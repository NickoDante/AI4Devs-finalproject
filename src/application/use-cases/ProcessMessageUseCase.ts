import { Message } from '../../domain/models/Message';
import { BotResponse } from '../../domain/models/BotResponse';
import { MessagePort } from '../../domain/ports/MessagePort';
import { AIAdapter } from '../../domain/ports/AIAdapter';

export class ProcessMessageUseCase {
  constructor(
    private readonly messagePort: MessagePort,
    private readonly aiAdapter: AIAdapter
  ) {}

  async execute(message: Message): Promise<BotResponse> {
    try {
      // Procesar el mensaje con el adaptador de IA
      const aiResponse = await this.aiAdapter.processMessage(message);

      // Guardar el mensaje usando el adaptador de mensajes
      await this.messagePort.sendMessage(message.channel, message.content);

      // Guardar la respuesta del bot
      await this.messagePort.sendMessage(
        message.channel,
        aiResponse.content
      );

      return aiResponse;
    } catch (error) {
      console.error('Error processing message:', error);
      return {
        content: 'Lo siento, ocurrió un error al procesar tu mensaje.',
        type: 'error',
        metadata: {
          error: error instanceof Error ? error.message : 'Error desconocido'
        }
      };
    }
  }
} 