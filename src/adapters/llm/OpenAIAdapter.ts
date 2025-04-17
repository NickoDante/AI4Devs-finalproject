import OpenAI from 'openai';
import { MessagePort } from '../../domain/ports/MessagePort';
import { Message } from '../../domain/models/Message';
import { BotResponse } from '../../domain/models/BotResponse';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export class OpenAIAdapter implements MessagePort {
  private openai: OpenAI;
  private context: ChatCompletionMessageParam[] = [];

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Inicializar el contexto con el prompt del sistema
    this.context.push({
      role: 'system',
      content: `Eres TG: The Guardian, un chatbot corporativo para Teravision Games. 
      Tu objetivo es ayudar a los empleados proporcionando información precisa y útil.`
    });
  }

  async processMessage(message: Message): Promise<BotResponse> {
    try {
      // Agregar el mensaje del usuario al contexto
      this.context.push({
        role: 'user',
        content: message.content
      });

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: this.context,
        temperature: 0.7,
        max_tokens: 500
      });

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
        type: 'text',
        metadata: {
          source: 'OpenAI GPT-3.5',
          confidence: 0.9
        }
      };
    } catch (error) {
      console.error('Error processing message with OpenAI:', error);
      return {
        content: 'Lo siento, ocurrió un error al procesar tu mensaje.',
        type: 'error',
        metadata: {
          error: error instanceof Error ? error.message : 'Error desconocido'
        }
      };
    }
  }

  async sendMessage(channel: string, text: string): Promise<void> {
    // OpenAI no necesita implementar sendMessage, pero debe estar presente
    // para cumplir con la interfaz
    throw new Error('Method not implemented in OpenAI adapter');
  }

  async start(port: number): Promise<void> {
    // OpenAI no necesita iniciar un servidor, pero debe implementar el método
    console.log('OpenAI adapter initialized');
  }

  async clearContext(): Promise<void> {
    // Mantener solo el prompt del sistema
    this.context = [this.context[0]];
  }
} 