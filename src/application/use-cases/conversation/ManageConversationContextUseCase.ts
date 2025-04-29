import { CachePort, ConversationContext as CacheConversationContext } from '../../../domain/ports/CachePort';
import { Message } from '../../../domain/models/Message';
import { Logger } from 'winston';

// Alias para mantener la estructura actual
export interface ConversationContext {
  messages: Message[];
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
  private readonly DEFAULT_CONVERSATION_ID = 'default';

  constructor(
    private readonly cachePort: CachePort,
    private readonly logger: Logger
  ) {}

  async getContext(userId: string): Promise<ConversationContext | null> {
    try {
      const cacheKey = `${this.CACHE_NAMESPACE}:${userId}`;
      const context = await this.cachePort.getConversationContext(userId, this.DEFAULT_CONVERSATION_ID);
      
      if (!context) {
        this.logger.debug('No se encontró contexto para el usuario', { userId });
        return null;
      }
      
      // Adaptar al formato requerido por este use case
      // Convertir los mensajes del formato CacheConversationContext al formato Message
      const messages: Message[] = context.messages.map(msg => ({
        content: msg.content,
        userId: userId,
        username: 'unknown',
        channel: 'unknown',
        timestamp: msg.timestamp,
        type: msg.role === 'user' ? 'direct_message' : 
              msg.role === 'system' ? 'command' : 'bot_message'
      }));
      
      return {
        messages,
        metadata: {
          ...context.metadata,
          topic: context.metadata?.topicId
        }
      };
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
          messages: [],
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
      context.messages = [message, ...context.messages].slice(0, this.MAX_MESSAGES);
      
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
      await this.saveContext(userId, context);
      
      this.logger.debug('Contexto de conversación actualizado', { userId, messageCount: metadata.messageCount });
      
      return context;
    } catch (error) {
      this.logger.error('Error al actualizar contexto de conversación:', error);
      // Devolver un contexto mínimo en caso de error
      return {
        messages: [message],
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
  
  // Método auxiliar para convertir y guardar el contexto en el formato esperado por CachePort
  private async saveContext(userId: string, context: ConversationContext): Promise<boolean> {
    try {
      // Convertir al formato esperado por CachePort
      const cacheContext: CacheConversationContext = {
        userId,
        conversationId: this.DEFAULT_CONVERSATION_ID,
        messages: context.messages.map(msg => ({
          // Mapear el tipo de mensaje a un rol adecuado
          role: msg.type === 'bot_message' ? 'assistant' :
                msg.type === 'command' ? 'system' : 'user',
          content: msg.content,
          timestamp: msg.timestamp
        })),
        metadata: {
          lastInteraction: new Date(),
          topicId: context.metadata?.topic
        }
      };
      
      return await this.cachePort.saveConversationContext(cacheContext);
    } catch (error) {
      this.logger.error('Error al guardar contexto en caché:', error);
      return false;
    }
  }
} 