import { Message } from '../../domain/models/Message';
import { BotResponse } from '../../domain/models/BotResponse';
import { MessagePort } from '../../domain/ports/MessagePort';
import { AIAdapter } from '../../domain/ports/AIAdapter';
import { PersistencePort } from '../../domain/ports/PersistencePort';
import { CachePort } from '../../domain/ports/CachePort';
import { Logger } from 'winston';

export class ProcessMessageUseCase {
  private readonly CACHE_NAMESPACE = 'search-results';
  private readonly CACHE_TTL = 3600; // 1 hora

  constructor(
    private readonly messagePort: MessagePort,
    private readonly aiAdapter: AIAdapter,
    private readonly persistencePort: PersistencePort,
    private readonly cachePort: CachePort,
    private readonly logger: Logger
  ) {}

  async execute(message: Message): Promise<BotResponse> {
    try {
      const cacheKey = `${this.CACHE_NAMESPACE}:${message.content}`;

      // 1. Intentar obtener respuesta del caché
      const cachedResponse = await this.cachePort.get<string[]>(cacheKey);

      if (cachedResponse) {
        this.logger.info('Respuesta encontrada en caché', {
          content: message.content
        });

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
      await this.cachePort.set(
        cacheKey,
        [aiResponse.content],
        { ttl: this.CACHE_TTL }
      );

      return aiResponse;
    } catch (error) {
      this.logger.error('Error procesando mensaje:', error);
      
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