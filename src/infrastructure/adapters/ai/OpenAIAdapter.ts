import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat';
import { Message } from '../../../domain/models/Message';
import { BotResponse } from '../../../domain/models/BotResponse';
import { AIAdapter } from '../../../domain/ports/AIAdapter';

export class OpenAIAdapter implements AIAdapter {
  private openai: OpenAI;
  private context: ChatCompletionMessageParam[] = [];

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Inicializar el contexto con el prompt del sistema
    this.context.push({
      role: 'system',
      content: 'You are TG: The Guardian, a helpful AI assistant for Teravision Games. You help employees with various tasks and questions about the company.'
    });
  }

  async processMessage(message: Message): Promise<BotResponse> {
    try {
      // Agregar el mensaje del usuario al contexto
      this.context.push({
        role: 'user',
        content: message.content
      });

      // Realizar la llamada a la API de OpenAI
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: this.context,
        temperature: 0.7,
        max_tokens: 500
      });

      // Obtener la respuesta
      const response = completion.choices[0]?.message?.content || 'Lo siento, no pude procesar tu mensaje.';

      // Agregar la respuesta al contexto
      this.context.push({
        role: 'assistant',
        content: response
      });

      // Mantener el contexto limitado a las últimas 10 interacciones
      if (this.context.length > 21) { // 1 system + 10 pares de user/assistant
        this.context = [
          this.context[0], // Mantener el prompt del sistema
          ...this.context.slice(-20) // Mantener las últimas 20 interacciones
        ];
      }

      return {
        content: response,
        type: 'text'
      };

    } catch (error) {
      console.error('Error al procesar mensaje con OpenAI:', error);
      return {
        content: 'Lo siento, ocurrió un error al procesar tu mensaje.',
        type: 'error',
        metadata: {
          error: error instanceof Error ? error.message : 'Error desconocido'
        }
      };
    }
  }

  async clearContext(): Promise<void> {
    // Mantener solo el prompt del sistema
    this.context = [this.context[0]];
  }
} 