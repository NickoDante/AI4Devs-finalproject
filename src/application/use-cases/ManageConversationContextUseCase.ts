import { Message } from '../../domain/models/Message';

export interface ConversationContext {
  lastMessages: Message[];
  metadata: {
    topic?: string;
    startTime: Date;
    lastUpdateTime: Date;
    messageCount: number;
    activeCommands?: string[];
  };
}

export class ManageConversationContextUseCase {
  private readonly maxContextMessages: number = 5;
  private contexts: Map<string, ConversationContext> = new Map();

  async addMessageToContext(message: Message): Promise<ConversationContext> {
    const channelId = message.channel;
    let context = this.contexts.get(channelId);

    if (!context) {
      context = this.createNewContext();
    }

    // Actualizar el contexto con el nuevo mensaje
    context.lastMessages.push(message);
    if (context.lastMessages.length > this.maxContextMessages) {
      context.lastMessages.shift(); // Remover el mensaje más antiguo
    }

    // Actualizar metadata
    context.metadata.lastUpdateTime = new Date();
    context.metadata.messageCount++;

    // Detectar y actualizar tema si es necesario
    this.updateContextTopic(context, message);

    // Guardar el contexto actualizado
    this.contexts.set(channelId, context);

    return context;
  }

  async getContextForChannel(channelId: string): Promise<ConversationContext | null> {
    return this.contexts.get(channelId) || null;
  }

  async clearContext(channelId: string): Promise<void> {
    this.contexts.delete(channelId);
  }

  private createNewContext(): ConversationContext {
    return {
      lastMessages: [],
      metadata: {
        startTime: new Date(),
        lastUpdateTime: new Date(),
        messageCount: 0
      }
    };
  }

  private updateContextTopic(context: ConversationContext, message: Message): void {
    // Implementación básica de detección de tema
    // En una implementación real, esto podría usar NLP para detectar el tema
    const commonTopics = [
      'ayuda',
      'documentación',
      'error',
      'búsqueda',
      'actualización'
    ];

    const messageContent = message.content.toLowerCase();
    const detectedTopic = commonTopics.find(topic => messageContent.includes(topic));

    if (detectedTopic && context.metadata.topic !== detectedTopic) {
      context.metadata.topic = detectedTopic;
    }
  }

  getActiveContexts(): string[] {
    return Array.from(this.contexts.keys());
  }

  async pruneOldContexts(maxAgeMinutes: number = 30): Promise<void> {
    const now = new Date();
    for (const [channelId, context] of this.contexts.entries()) {
      const timeDiff = now.getTime() - context.metadata.lastUpdateTime.getTime();
      if (timeDiff > maxAgeMinutes * 60 * 1000) {
        await this.clearContext(channelId);
      }
    }
  }
} 