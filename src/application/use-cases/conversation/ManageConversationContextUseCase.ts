import { CachePort } from '../../../domain/ports/CachePort';
import { Message } from '../../../domain/models/Message';
import { Logger } from 'winston';

export interface ConversationContext {
  lastMessages: Message[];
  metadata?: {
    topic?: string;
    startTime?: Date;
    lastUpdateTime?: Date;
    messageCount?: number;
    activeCommands?: string[];
    [key: string]: any;
  };
}

export class ManageConversationContextUseCase {
  private readonly CACHE_NAMESPACE = 'context';
  private readonly DEFAULT_TTL = 1800; // 30 minutos
  private readonly MAX_MESSAGES = 10;

  constructor(
    private readonly cachePort: CachePort,
    private readonly logger: Logger
  ) {}

  async getContext(userId: string): Promise<ConversationContext | null> {
    try {
      const cacheKey = `${this.CACHE_NAMESPACE}:${userId}`;
      const context = await this.cachePort.getConversationContext(userId);
      
      if (!context) {
        this.logger.debug('No se encontró contexto para el usuario', { userId });
        return null;
      }
      
      return context;
    } catch (error) {
      this.logger.error('Error al obtener contexto de conversación:', error);
      return null;
    }
  }

  async updateContext(userId: string, message: Message): Promise<ConversationContext> {
    try {
      const cacheKey = `${this.CACHE_NAMESPACE}:${userId}`;
      let context = await this.getContext(userId);
      
      if (!context) {
        // Crear nuevo contexto si no existe
        context = {
          lastMessages: [],
          metadata: {
            topic: 'general',
            startTime: new Date(),
            lastUpdateTime: new Date(),
            messageCount: 0,
            activeCommands: []
          }
        };
      }
      
      // Actualizar mensajes
      context.lastMessages = [message, ...context.lastMessages].slice(0, this.MAX_MESSAGES);
      
      // Actualizar metadata
      const metadata = context.metadata || {};
      metadata.lastUpdateTime = new Date();
      metadata.messageCount = (metadata.messageCount || 0) + 1;
      
      // Actualizar comandos activos si el mensaje tiene un comando
      if (message.metadata?.command) {
        metadata.activeCommands = [...(metadata.activeCommands || []), message.metadata.command];
      }
      
      context.metadata = metadata;
      
      // Guardar contexto actualizado
      await this.cachePort.setConversationContext(userId, context);
      
      this.logger.debug('Contexto de conversación actualizado', { userId, messageCount: metadata.messageCount });
      
      return context;
    } catch (error) {
      this.logger.error('Error al actualizar contexto de conversación:', error);
      // Devolver un contexto mínimo en caso de error
      return {
        lastMessages: [message],
        metadata: {
          startTime: new Date(),
          lastUpdateTime: new Date(),
          messageCount: 1
        }
      };
    }
  }

  async clearContext(userId: string): Promise<boolean> {
    try {
      const cacheKey = `${this.CACHE_NAMESPACE}:${userId}`;
      await this.cachePort.delete(cacheKey);
      
      this.logger.info('Contexto de conversación eliminado', { userId });
      return true;
    } catch (error) {
      this.logger.error('Error al eliminar contexto de conversación:', error);
      return false;
    }
  }
} 