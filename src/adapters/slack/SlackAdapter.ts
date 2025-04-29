import { App, LogLevel } from '@slack/bolt';
import { MessagePort } from '../../domain/ports/MessagePort';
import { Message } from '../../domain/models/Message';
import { BotResponse } from '../../domain/models/BotResponse';
import { ValidationMiddleware } from '../../infrastructure/middleware/ValidationMiddleware';
import { Logger } from 'winston';
import { CacheManager } from '../../infrastructure/cache/CacheManager';
import { CachePort } from '../../domain/ports/CachePort';
import { ProcessMessageUseCase } from '../../application/use-cases/message/ProcessMessageUseCase';
import { container } from '../../infrastructure/di';
import { Query } from '../../domain/models/Query';
import { createHash } from 'crypto';

interface SlackMessageEvent {
  user?: string;
  text?: string;
  channel: string;
  ts: string;
  type: string;
}

export class SlackAdapter implements MessagePort {
  private app: App | null = null;
  private validationMiddleware: ValidationMiddleware;
  private cacheManager: CacheManager;
  private processMessageUseCase: ProcessMessageUseCase | null = null;

  constructor(
    private readonly logger: Logger,
    private readonly cache: CachePort
  ) {
    this.validationMiddleware = new ValidationMiddleware(logger);
    this.cacheManager = new CacheManager(cache, logger);
  }

  private getProcessMessageUseCase(): ProcessMessageUseCase {
    if (!this.processMessageUseCase) {
      this.processMessageUseCase = container.getProcessMessageUseCase();
      if (!this.processMessageUseCase) {
        throw new Error('ProcessMessageUseCase no está inicializado en el contenedor');
      }
    }
    return this.processMessageUseCase;
  }

  private assertAppInitialized(): void {
    if (!this.app) {
      throw new Error('Slack app not initialized');
    }
  }

  private initializeEventListeners(): void {
    this.assertAppInitialized();
    const app = this.app!;

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
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: "❌ *Error al procesar tu mensaje.* Ha ocurrido un problema. Por favor, inténtalo de nuevo en unos momentos."
              }
            }
          ],
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
        await say({
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: "❌ *Error al procesar tu mención.* Ha ocurrido un problema. Por favor, inténtalo de nuevo en unos momentos."
              }
            }
          ]
        });
      }
    });
  }

  private initializeCommands(): void {
    this.assertAppInitialized();
    const app = this.app!;

    // Comando de búsqueda
    app.command('/tg-search', async ({ command, ack, respond }) => {
      this.logger.info('Comando /tg-search recibido:', {
        text: command.text,
        user: command.user_name,
        channel: command.channel_name
      });

      await ack();
      try {
        // Validar el comando
        await this.validationMiddleware.validateCommand('/tg-search')({ body: command } as any, { json: respond } as any, async () => {
          this.logger.info('Procesando comando /tg-search:', {
            text: command.text,
            user: command.user_name
          });

          const botResponse = await this.processCommand(command, '/tg-search');
          this.logger.info('Respuesta generada para /tg-search:', {
            content: botResponse.content,
            metadata: botResponse.metadata
          });

          await respond(this.formatResponse(botResponse));
        });
      } catch (error) {
        this.logger.error('Error en comando search:', error);
        await respond({
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: "❌ *Error al procesar tu búsqueda.* Ha ocurrido un problema al comunicarse con Slack. Por favor, inténtalo de nuevo o con términos de búsqueda diferentes."
              }
            }
          ]
        });
      }
    });

    // Comando de preguntas
    app.command('/tg-question', async ({ command, ack, respond }) => {
      await ack();
      this.logger.info('❓ Comando question recibido:', command);
      try {
        // Validar el comando
        await this.validationMiddleware.validateCommand('/tg-question')({ body: command } as any, { json: respond } as any, async () => {
          const botResponse = await this.processCommand(command, '/tg-question');
          await respond(this.formatResponse(botResponse));
        });
      } catch (error) {
        this.logger.error('Error en comando question:', error);
        await respond({
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: "❌ *Error al procesar tu pregunta.* Ha ocurrido un problema al comunicarse con Slack. Por favor, inténtalo de nuevo o reformula tu pregunta."
              }
            }
          ]
        });
      }
    });

    // Comando de resumen
    app.command('/tg-summary', async ({ command, ack, respond }) => {
      await ack();
      this.logger.info('📝 Comando summary recibido:', command);
      try {
        // Validar el comando
        await this.validationMiddleware.validateCommand('/tg-summary')({ body: command } as any, { json: respond } as any, async () => {
          const botResponse = await this.processCommand(command, '/tg-summary');
          await respond(this.formatResponse(botResponse));
        });
      } catch (error) {
        this.logger.error('Error en comando summary:', error);
        await respond({
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: "❌ *Error al generar el resumen.* Ha ocurrido un problema al comunicarse con Slack. Por favor, inténtalo de nuevo o con un enlace diferente."
              }
            }
          ]
        });
      }
    });
  }

  private async processCommand(command: any, commandType: string): Promise<BotResponse> {
    try {
      this.logger.info(`Procesando comando ${commandType}:`, {
        text: command.text,
        user: command.user_name,
        channel: command.channel_name
      });

      // Intentar obtener respuesta del caché
      const cachedResponse = await this.cacheManager.getCachedResponse(
        commandType,
        command.text
      );

      if (cachedResponse) {
        this.logger.info('Respuesta encontrada en caché:', {
          commandType,
          text: command.text
        });
        return cachedResponse;
      }

      // Procesar el mensaje según el tipo de comando
      const message: Message = {
        content: command.text,
        userId: command.user_id,
        username: command.user_name,
        channel: command.channel_id,
        timestamp: new Date(),
        type: 'command',
        metadata: { 
          command: commandType.replace('/tg-', '') as 'search' | 'question' | 'summary'
        }
      };

      let response: BotResponse;

      switch (commandType) {
        case '/tg-search':
          response = await this.getProcessMessageUseCase().execute(message);
          break;

        case '/tg-question':
          // Preparar la consulta para el procesamiento natural
          const query: Query = {
            id: crypto.randomUUID(),
            queryHash: createHash('sha256').update(message.content).digest('hex'),
            originalText: message.content,
            normalizedText: message.content.toLowerCase().trim(),
            language: 'es', // Por ahora hardcoded, luego detectar
            type: 'question',
            command: '/tg-question',
            status: 'pending',
            userId: message.userId,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          // Respuesta temporal mientras se procesa
          response = {
            content: `🤔 *Analizando tu consulta:*\n"${message.content}"\n\n_Procesando..._`,
            type: 'text',
            metadata: {
              source: 'Sistema de preguntas y respuestas',
              confidence: 0.90,
              query: query
            }
          };
          break;

        case '/tg-summary':
          // Respuesta temporal mientras se procesa (restaurando la funcionalidad original)
          response = {
            content: `📝 *Solicitud de Resumen:* "${message.content}"\n\nGenerando resumen del documento...\n• Documento: ${message.content}\n• Tipo: ${message.content.endsWith('.pdf') ? 'PDF' : 'Link'}\n• Solicitado por: ${message.username}\n• Canal: <#${message.channel}>`,
            type: 'text',
            metadata: {
              source: 'Generador de resúmenes',
              confidence: 0.85
            }
          };
          break;

        default:
          throw new Error(`Comando no soportado: ${commandType}`);
      }

      // Guardar en caché si no es una pregunta (las preguntas no se cachean por ahora)
      if (commandType !== '/tg-question') {
      await this.cacheManager.setCachedResponse(
        commandType,
        command.text,
        response
      );
      }

      this.logger.info('Respuesta generada:', {
        commandType,
        text: command.text,
        responseType: response.type
      });

      return response;
    } catch (error) {
      this.logger.error(`Error procesando comando ${commandType}:`, error);
      throw error;
    }
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
    try {
      if (message.type === 'command' && message.metadata?.command) {
        switch (message.metadata.command) {
          case 'search':
            return await this.getProcessMessageUseCase().execute(message);

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

      return await this.getProcessMessageUseCase().execute(message);
    } catch (error) {
      this.logger.error('Error procesando mensaje:', error);
      return {
        content: '❌ Lo siento, ocurrió un error al procesar tu mensaje.',
        type: 'text',
        metadata: {
          source: 'Sistema',
          confidence: 0,
          hasError: true
        }
      };
    }
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
      // Intentar reconectar si es un error de conexión
      if (error.message.includes('disconnect') || error.message.includes('websocket')) {
        console.log('🔄 Intentando reconectar...');
        try {
          await this.app?.start();
        } catch (reconnectError) {
          console.error('❌ Error al reconectar:', reconnectError);
        }
      }
    });

    // Configurar comandos y eventos
    this.initializeEventListeners();
    this.initializeCommands();

    try {
      await this.app.start();
      console.log(`⚡️ Slack Bolt app está corriendo en modo Socket en el puerto ${port}!`);
      console.log('🔍 Comandos registrados y esperando:');
      console.log('- /tg-search  -> para búsqueda de documentos');
      console.log('- /tg-question -> para hacer preguntas');
      console.log('- /tg-summary  -> para resumir documentos');
    } catch (error) {
      console.error('❌ Error al iniciar la aplicación:', error);
      throw error;
    }
  }

  private async handleReconnection(): Promise<void> {
    console.log('🔄 Intentando reconectar...');
    try {
      await this.app?.start();
      console.log('✅ Reconexión exitosa');
    } catch (error) {
      console.error('❌ Error al reconectar:', error);
      // Esperar 5 segundos antes de intentar nuevamente
      setTimeout(() => this.handleReconnection(), 5000);
    }
  }
} 