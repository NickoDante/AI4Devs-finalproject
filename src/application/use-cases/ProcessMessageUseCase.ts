import { Message } from '../../domain/models/Message';
import { BotResponse } from '../../domain/models/BotResponse';
import { MessagePort } from '../../domain/ports/MessagePort';
import { AIAdapter } from '../../domain/ports/AIAdapter';
import { PersistencePort } from '../../domain/ports/PersistencePort';
import { CachePort } from '../../domain/ports/CachePort';

export class ProcessMessageUseCase {
  constructor(
    private readonly messagePort: MessagePort,
    private readonly aiAdapter: AIAdapter,
    private readonly persistencePort: PersistencePort,
    private readonly cachePort: CachePort
  ) {}

  async execute(message: Message): Promise<BotResponse> {
    try {
      // 1. Intentar obtener respuesta del caché
      const cachedResponse = await this.cachePort.getCachedSearchResults(message.content);
      if (cachedResponse) {
        return {
          content: cachedResponse[0],
          type: 'text',
          threadId: message.threadId,
          metadata: { source: 'cache' }
        };
      }

      // 2. Procesar el mensaje con IA
      const aiResponse = await this.aiAdapter.processMessage(message);

      // 3. Guardar el mensaje y la respuesta
      await this.persistencePort.saveMessage(message);
      
      // 4. Enviar la respuesta
      await this.messagePort.sendMessage(message.channel, aiResponse.content);

      // 5. Cachear la respuesta para futuras consultas similares
      await this.cachePort.cacheSearchResults(message.content, [aiResponse.content]);

      return aiResponse;
    } catch (error) {
      console.error('Error processing message:', error);
      
      // Guardar el error en la persistencia para análisis
      await this.persistencePort.saveMessage({
        ...message,
        metadata: {
          error: true,
          errorMessage: error instanceof Error ? error.message : 'Error desconocido'
        }
      });

      return {
        content: 'Lo siento, ocurrió un error al procesar tu mensaje.',
        type: 'error',
        threadId: message.threadId,
        metadata: {
          error: true,
          message: error instanceof Error ? error.message : 'Error desconocido'
        }
      };
    }
  }
} 