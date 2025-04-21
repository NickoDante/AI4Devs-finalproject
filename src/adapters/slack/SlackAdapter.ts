import { App, LogLevel } from '@slack/bolt';
import { MessagePort } from '../../domain/ports/MessagePort';
import { Message } from '../../domain/models/Message';
import { BotResponse } from '../../domain/models/BotResponse';

interface SlackMessageEvent {
  user?: string;
  text?: string;
  channel: string;
  ts: string;
  type: string;
}

export class SlackAdapter implements MessagePort {
  private app: App | null = null;

  constructor() {}

  private assertAppInitialized(): void {
    if (!this.app) {
      throw new Error('Slack app not initialized');
    }
  }

  private initializeEventListeners(): void {
    this.assertAppInitialized();
    const app = this.app!; // TypeScript now knows app is not null

    // Escuchar mensajes directos
    app.message(async ({ message, say, client }) => {
      try {
        const slackMessage = message as SlackMessageEvent;
        if (!slackMessage.user || !slackMessage.text) {
          console.warn('Mensaje recibido sin usuario o texto');
          return;
        }

        const userInfo = await client.users.info({ user: slackMessage.user });
        const username = userInfo.user?.real_name || userInfo.user?.name || 'Unknown User';

        const botResponse = await this.processMessage({
          content: slackMessage.text,
          userId: slackMessage.user,
          username,
          channel: slackMessage.channel,
          timestamp: new Date(Number(slackMessage.ts) * 1000),
          type: 'direct_message'
        });

        await say(this.formatResponse(botResponse));
      } catch (error) {
        console.error('Error processing direct message:', error);
        await say({
          text: 'Lo siento, ocurrió un error al procesar tu mensaje.',
          thread_ts: message.ts
        });
      }
    });

    // Escuchar menciones al bot
    app.event('app_mention', async ({ event, say, client }) => {
      try {
        if (!event.user || !event.text) {
          console.warn('Mención recibida sin usuario o texto');
          return;
        }

        const userInfo = await client.users.info({ user: event.user });
        const username = userInfo.user?.real_name || userInfo.user?.name || 'Unknown User';

        const botResponse = await this.processMessage({
          content: event.text,
          userId: event.user,
          username,
          channel: event.channel,
          timestamp: new Date(Number(event.ts) * 1000),
          type: 'mention'
        });

        await say(this.formatResponse(botResponse));
      } catch (error) {
        console.error('Error processing mention:', error);
        await say('Lo siento, ocurrió un error al procesar tu mención.');
      }
    });
  }

  private initializeCommands(): void {
    this.assertAppInitialized();
    const app = this.app!;

    // Comando de búsqueda
    app.command('/tg-search', async ({ command, ack, respond }) => {
      await ack();
      try {
        console.log('Comando search recibido:', command); // Log para debugging
        const botResponse = await this.processMessage({
          content: command.text,
          userId: command.user_id,
          username: command.user_name,
          channel: command.channel_id,
          timestamp: new Date(),
          type: 'command',
          metadata: { command: 'search' }
        });

        await respond(this.formatResponse(botResponse));
      } catch (error) {
        console.error('Error processing search command:', error);
        await respond('Lo siento, ocurrió un error al procesar tu búsqueda.');
      }
    });

    // Comando de preguntas
    app.command('/tg-question', async ({ command, ack, respond, client }) => {
      await ack();
      try {
        console.log('Comando question recibido:', command); // Log para debugging
        const userInfo = await client.users.info({ user: command.user_id });
        const username = userInfo.user?.real_name || userInfo.user?.name || 'Unknown User';

        const botResponse = await this.processMessage({
          content: command.text,
          userId: command.user_id,
          username,
          channel: command.channel_id,
          timestamp: new Date(),
          type: 'command',
          metadata: { command: 'question' }
        });

        await respond(this.formatResponse(botResponse));
      } catch (error) {
        console.error('Error processing question command:', error);
        await respond('Lo siento, ocurrió un error al procesar tu pregunta.');
      }
    });

    // Comando de resumen
    app.command('/tg-summary', async ({ command, ack, respond, client }) => {
      await ack();
      try {
        console.log('Comando summary recibido:', command); // Log para debugging
        const userInfo = await client.users.info({ user: command.user_id });
        const username = userInfo.user?.real_name || userInfo.user?.name || 'Unknown User';

        const botResponse = await this.processMessage({
          content: command.text,
          userId: command.user_id,
          username,
          channel: command.channel_id,
          timestamp: new Date(),
          type: 'command',
          metadata: { command: 'summary' }
        });

        await respond(this.formatResponse(botResponse));
      } catch (error) {
        console.error('Error processing summary command:', error);
        await respond('Lo siento, ocurrió un error al generar el resumen.');
      }
    });
  }

  private formatResponse(response: BotResponse): any {
    const blocks = [];

    // Agregar el contenido principal
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: response.content
      }
    });

    // Agregar fuente si existe
    if (response.metadata?.source) {
      blocks.push({
        type: 'context',
        elements: [{
          type: 'mrkdwn',
          text: `📚 Fuente: ${response.metadata.source}`
        }]
      });
    }

    // Agregar nivel de confianza si existe
    if (response.metadata?.confidence) {
      blocks.push({
        type: 'context',
        elements: [{
          type: 'mrkdwn',
          text: `🎯 Confianza: ${Math.round(response.metadata.confidence * 100)}%`
        }]
      });
    }

    return {
      blocks,
      thread_ts: response.threadId
    };
  }

  async processMessage(message: Message): Promise<BotResponse> {
    // Si es un comando, procesar según el tipo
    if (message.type === 'command' && message.metadata?.command) {
      switch (message.metadata.command) {
        case 'search':
          return {
            content: `🔍 *Búsqueda de Documentos:* "${message.content}"\n\nBuscando en la base de documentos...\n• Término de búsqueda: ${message.content}\n• Solicitado por: ${message.username}\n• Canal: <#${message.channel}>`,
            type: 'text',
            metadata: {
              source: 'Búsqueda de documentos',
              confidence: 0.95
            }
          };

        case 'question':
          return {
            content: `❓ *Nueva Pregunta:* "${message.content}"\n\nAnalizando tu consulta...\n• Pregunta: ${message.content}\n• Solicitado por: ${message.username}\n• Canal: <#${message.channel}>`,
            type: 'text',
            metadata: {
              source: 'Sistema de preguntas y respuestas',
              confidence: 0.90
            }
          };

        case 'summary':
          return {
            content: `📝 *Solicitud de Resumen:* "${message.content}"\n\nGenerando resumen del documento...\n• Documento: ${message.content}\n• Tipo: ${message.content.endsWith('.pdf') ? 'PDF' : 'Link'}\n• Solicitado por: ${message.username}\n• Canal: <#${message.channel}>`,
            type: 'text',
            metadata: {
              source: 'Generador de resúmenes',
              confidence: 0.85
            }
          };
      }
    }

    // Si es una mención o mensaje directo
    if (message.type === 'mention' || message.type === 'direct_message') {
      return {
        content: `¡Hola ${message.username}! 👋\nHe recibido tu mensaje: "${message.content}"\n\nPuedes usar los siguientes comandos:\n• \`/tg-search\` para buscar documentos\n• \`/tg-question\` para hacer cualquier tipo de pregunta\n• \`/tg-summary\` para resumir documentos (links o PDFs)`,
        type: 'text',
        metadata: {
          source: 'Ayuda del bot',
          confidence: 1.0
        }
      };
    }

    // Respuesta por defecto
    return {
      content: '❓ No pude determinar cómo procesar este mensaje. Por favor, usa uno de los comandos disponibles o mencióname para obtener ayuda.',
      type: 'text',
      metadata: {}
    };
  }

  async sendMessage(channel: string, text: string): Promise<void> {
    this.assertAppInitialized();
    try {
      await this.app!.client.chat.postMessage({
        channel,
        text
      });
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async start(port: number): Promise<void> {
    if (!process.env.SLACK_BOT_TOKEN || !process.env.SLACK_SIGNING_SECRET || !process.env.SLACK_APP_TOKEN) {
      throw new Error('SLACK_BOT_TOKEN, SLACK_SIGNING_SECRET y SLACK_APP_TOKEN deben estar configurados en las variables de entorno');
    }

    console.log('🚀 Iniciando SlackAdapter con Socket Mode...');

    this.app = new App({
      token: process.env.SLACK_BOT_TOKEN,
      signingSecret: process.env.SLACK_SIGNING_SECRET,
      socketMode: true,
      appToken: process.env.SLACK_APP_TOKEN,
      port: port,
      logLevel: LogLevel.DEBUG
    });

    // Manejador de errores global
    this.app.error(async (error) => {
      console.error('⚠️ Error en Slack App:', error);
    });

    // Configurar comandos
    this.app.command('/tg-search', async ({ command, ack, respond }) => {
      await ack();
      console.log('🔍 Comando search recibido:', command);
      try {
        const botResponse = await this.processMessage({
          content: command.text,
          userId: command.user_id,
          username: command.user_name,
          channel: command.channel_id,
          timestamp: new Date(),
          type: 'command',
          metadata: { command: 'search' }
        });
        await respond(this.formatResponse(botResponse));
      } catch (error) {
        console.error('Error en comando search:', error);
        await respond('Lo siento, ocurrió un error al procesar tu búsqueda.');
      }
    });

    this.app.command('/tg-question', async ({ command, ack, respond }) => {
      await ack();
      console.log('❓ Comando question recibido:', command);
      try {
        const botResponse = await this.processMessage({
          content: command.text,
          userId: command.user_id,
          username: command.user_name,
          channel: command.channel_id,
          timestamp: new Date(),
          type: 'command',
          metadata: { command: 'question' }
        });
        await respond(this.formatResponse(botResponse));
      } catch (error) {
        console.error('Error en comando question:', error);
        await respond('Lo siento, ocurrió un error al procesar tu pregunta.');
      }
    });

    this.app.command('/tg-summary', async ({ command, ack, respond }) => {
      await ack();
      console.log('📝 Comando summary recibido:', command);
      try {
        const botResponse = await this.processMessage({
          content: command.text,
          userId: command.user_id,
          username: command.user_name,
          channel: command.channel_id,
          timestamp: new Date(),
          type: 'command',
          metadata: { command: 'summary' }
        });
        await respond(this.formatResponse(botResponse));
      } catch (error) {
        console.error('Error en comando summary:', error);
        await respond('Lo siento, ocurrió un error al generar el resumen.');
      }
    });

    // Configurar evento de mención
    this.app.event('app_mention', async ({ event, say }) => {
      console.log('👋 Mención recibida:', event);
      try {
        const botResponse = await this.processMessage({
          content: event.text,
          userId: event.user,
          username: 'Usuario', // Aquí deberíamos obtener el nombre real
          channel: event.channel,
          timestamp: new Date(),
          type: 'mention'
        });
        await say(this.formatResponse(botResponse));
      } catch (error) {
        console.error('Error en mención:', error);
        await say('Lo siento, ocurrió un error al procesar tu mención.');
      }
    });

    await this.app.start();
    console.log(`⚡️ Slack Bolt app está corriendo en modo Socket en el puerto ${port}!`);
    console.log('🔍 Comandos registrados y esperando:');
    console.log('- /tg-search  -> para búsqueda de documentos');
    console.log('- /tg-question -> para hacer preguntas');
    console.log('- /tg-summary  -> para resumir documentos');
  }
} 