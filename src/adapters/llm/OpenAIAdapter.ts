import OpenAI from 'openai';
import { Message } from '../../domain/models/Message';
import { BotResponse } from '../../domain/models/BotResponse';
import { AIAdapter } from '../../domain/ports/AIAdapter';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export class OpenAIAdapter implements AIAdapter {
  private openai: OpenAI;
  private context: Message[] = [];
  private readonly MAX_CONTEXT_LENGTH = 10;

  constructor(apiKey?: string) {
    this.openai = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY
    });
  }

  async processMessage(message: Message): Promise<BotResponse> {
    try {
      // Agregar mensaje al contexto
      this.context.push(message);
      if (this.context.length > this.MAX_CONTEXT_LENGTH) {
        this.context.shift();
      }

      // Construir mensajes para la API
      const messages: ChatCompletionMessageParam[] = [
        {
          role: "system",
          content: "Eres un asistente útil que ayuda a los empleados de Teravision Games a encontrar información y responder preguntas sobre la empresa."
        },
        ...this.context.map(msg => ({
          role: msg.userId === "system" ? "system" as const : "user" as const,
          content: msg.content
        }))
      ];

      // Llamar a la API de OpenAI
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages,
        temperature: 0.7,
        max_tokens: 500
      });

      const response = completion.choices[0]?.message?.content || "Lo siento, no pude procesar tu mensaje.";

      return {
        content: response,
        type: 'text',
        threadId: message.threadId,
        metadata: {
          model: "gpt-3.5-turbo",
          confidence: completion.choices[0]?.finish_reason === 'stop' ? 0.9 : 0.7
        }
      };
    } catch (error) {
      console.error('Error en OpenAI API:', error);
      throw new Error('Error al procesar el mensaje con OpenAI');
    }
  }

  private buildPrompt(message: Message): string {
    let prompt = "";

    // Agregar contexto previo si existe
    if (this.context.length > 1) {
      prompt += "Contexto previo:\n";
      this.context.slice(0, -1).forEach(msg => {
        prompt += `${msg.username}: ${msg.content}\n`;
      });
      prompt += "\n";
    }

    // Agregar el mensaje actual
    prompt += `${message.username}: ${message.content}`;

    return prompt;
  }

  async clearContext(): Promise<void> {
    this.context = [];
  }
} 