import { CachePort, ConversationContext } from '../../domain/ports/CachePort';

export class ManageConversationContextUseCase {
  constructor(private readonly cachePort: CachePort) {}

  async getContext(userId: string, conversationId?: string): Promise<ConversationContext | null> {
    try {
      if (!conversationId) {
        // Si no hay ID de conversación, buscar la última conversación activa del usuario
        const activeConversations = await this.cachePort.getActiveConversations(userId);
        if (activeConversations && activeConversations.length > 0) {
          // Usar la conversación más reciente
          conversationId = activeConversations[0];
        } else {
          return null;
        }
      }

      return await this.cachePort.getConversationContext(userId, conversationId);
    } catch (error) {
      console.error('Error al obtener contexto de conversación:', error);
      return null;
    }
  }

  async saveContext(context: ConversationContext): Promise<boolean> {
    try {
      // Actualizar timestamp
      if (context.metadata) {
        context.metadata.lastInteraction = new Date();
      } else {
        context.metadata = {
          lastInteraction: new Date()
        };
      }

      return await this.cachePort.saveConversationContext(context);
    } catch (error) {
      console.error('Error al guardar contexto de conversación:', error);
      return false;
    }
  }

  async addMessageToContext(
    userId: string, 
    conversationId: string, 
    message: string, 
    role: 'system' | 'user' | 'assistant'
  ): Promise<ConversationContext | null> {
    try {
      // Obtener contexto existente o crear uno nuevo
      let context = await this.getContext(userId, conversationId);
      
      if (!context) {
        context = {
          userId,
          conversationId,
          messages: [],
          metadata: {
            lastInteraction: new Date()
          }
        };
      }

      // Agregar nuevo mensaje
      context.messages.push({
        role,
        content: message,
        timestamp: new Date()
      });

      // Limitar mensajes (mantener solo los últimos 10 para evitar tokens excesivos)
      if (context.messages.length > 10) {
        // Mantener el primer mensaje (system prompt) y los últimos 9
        const systemPrompt = context.messages.find(m => m.role === 'system');
        const recentMessages = context.messages.slice(-9);
        
        context.messages = systemPrompt 
          ? [systemPrompt, ...recentMessages] 
          : recentMessages;
      }

      // Guardar contexto actualizado
      await this.saveContext(context);
      return context;
    } catch (error) {
      console.error('Error al agregar mensaje al contexto:', error);
      return null;
    }
  }

  async clearContext(userId: string, conversationId: string): Promise<boolean> {
    try {
      return await this.cachePort.removeConversationContext(userId, conversationId);
    } catch (error) {
      console.error('Error al limpiar contexto de conversación:', error);
      return false;
    }
  }
} 