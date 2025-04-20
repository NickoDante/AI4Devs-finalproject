import { Message } from '../../domain/models/Message';
import { BotResponse } from '../../domain/models/BotResponse';
import { MessagePort } from '../../domain/ports/MessagePort';
import { AIAdapter } from '../../domain/ports/AIAdapter';

export class ProcessMessageUseCase {
  constructor(
    private readonly messagePort: MessagePort,
    private readonly aiAdapter: AIAdapter | null
  ) {}

  async execute(message: Message): Promise<BotResponse> {
    try {
      let response: BotResponse;

      if (this.aiAdapter) {
        // Procesar el mensaje con el adaptador de IA si está disponible
        response = await this.aiAdapter.processMessage(message);
      } else {
        // Respuesta por defecto cuando no hay adaptador de IA
        response = {
          content: 'El servicio de IA está temporalmente deshabilitado. Por favor, inténtalo más tarde.',
          type: 'text',
          threadId: message.threadId,
          attachments: []
        };
      }

      // Guardar el mensaje usando el adaptador de mensajes
      await this.messagePort.sendMessage(message.channel, message.content);

      // Guardar la respuesta del bot
      await this.messagePort.sendMessage(message.channel, response.content);

      return response;
    } catch (error) {
      console.error('Error processing message:', error);
      return {
        content: 'Lo siento, ocurrió un error al procesar tu mensaje.',
        type: 'error',
        threadId: message.threadId,
        attachments: [],
        metadata: {
          error: true,
          message: error instanceof Error ? error.message : 'Error desconocido'
        }
      };
    }
  }
} 