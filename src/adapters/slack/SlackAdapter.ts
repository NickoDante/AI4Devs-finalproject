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

    // Comando de consulta administrativa
    app.command('/tg-admin', async ({ command, ack, respond, client }) => {
      await ack();
      try {
        const userInfo = await client.users.info({ user: command.user_id });
        const username = userInfo.user?.real_name || userInfo.user?.name || 'Unknown User';

        const botResponse = await this.processMessage({
          content: command.text,
          userId: command.user_id,
          username,
          channel: command.channel_id,
          timestamp: new Date(),
          type: 'command',
          metadata: { command: 'admin' }
        });

        await respond(this.formatResponse(botResponse));
      } catch (error) {
        console.error('Error processing admin command:', error);
        await respond('Lo siento, ocurrió un error al procesar tu consulta administrativa.');
      }
    });

    // Comando de resumen
    app.command('/tg-summary', async ({ command, ack, respond, client }) => {
      await ack();
      try {
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
    return {
      content: 'Esta es una respuesta temporal. El procesamiento real será implementado pronto.',
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
    if (!process.env.SLACK_BOT_TOKEN || !process.env.SLACK_SIGNING_SECRET) {
      throw new Error('SLACK_BOT_TOKEN and SLACK_SIGNING_SECRET must be set in environment variables');
    }

    this.app = new App({
      token: process.env.SLACK_BOT_TOKEN,
      signingSecret: process.env.SLACK_SIGNING_SECRET,
      logLevel: LogLevel.DEBUG
    });

    this.initializeEventListeners();
    this.initializeCommands();

    await this.app.start(port);
    console.log('⚡️ Slack Bolt app está corriendo!');
  }
} 