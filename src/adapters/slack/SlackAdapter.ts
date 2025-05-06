import { App, LogLevel } from '@slack/bolt';
import { MessagePort } from '../../domain/ports/MessagePort';
import { Message } from '../../domain/models/Message';
import { BotResponse } from '../../domain/models/BotResponse';
import { ValidationMiddleware } from '../../infrastructure/middleware/ValidationMiddleware';
import { Logger } from 'winston';
import { CacheManager } from '../../infrastructure/cache/CacheManager';
import { CachePort } from '../../domain/ports/CachePort';
import { ProcessMessageUseCase } from '../../application/use-cases/message/ProcessMessageUseCase';
import { ProcessQuestionUseCase } from '../../application/use-cases/message/ProcessQuestionUseCase';
import { container } from '../../infrastructure/di';
import { Query } from '../../domain/models/Query';
import { createHash } from 'crypto';
import { AIAdapter } from '../../domain/ports/AIAdapter';
import { KnowledgePort } from '../../domain/ports/KnowledgePort';

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
  private processQuestionUseCase: ProcessQuestionUseCase | null = null;
  private aiAdapter: AIAdapter | null = null;
  private knowledgePort: KnowledgePort | null = null;

  // Agregar estos mensajes de espera aleatorios al inicio de la clase SlackAdapter
  private waitingMessages: Record<string, string[]> = {
    es: [
      "🔍 Todavía estoy investigando tu pregunta. Dame un momento más...",
      "⏳ Estoy consultando diversas fuentes para darte la mejor respuesta posible.",
      "🧠 Analizando información relevante para tu consulta. Casi listo...",
      "📚 Revisando documentación para ofrecerte datos precisos. Un momento más...",
      "👁️ Mis ojos están trabajando arduamente para encontrar la mejor respuesta para ti.",
      "🔎 Recopilando información valiosa para responder tu pregunta de manera completa.",
      "💭 Procesando tu consulta con atención. Gracias por tu paciencia.",
      "📝 Elaborando una respuesta detallada y útil para ti. Casi terminamos...",
      "🧩 Conectando diferentes piezas de información para responder correctamente."
    ],
    en: [
      "🔍 Still researching your question. Give me a moment more...",
      "⏳ Consulting various sources to give you the best possible answer.",
      "🧠 Analyzing relevant information for your query. Almost ready...",
      "📚 Reviewing documentation to offer you accurate data. One more moment...",
      "👁️ My eyes are working hard to find the best answer for you.",
      "🔎 Collecting valuable information to answer your question completely.",
      "💭 Processing your query carefully. Thanks for your patience.",
      "📝 Crafting a detailed and useful response for you. Almost done...",
      "🧩 Connecting different pieces of information to answer correctly."
    ]
  };

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

  private getProcessQuestionUseCase(): ProcessQuestionUseCase {
    if (!this.processQuestionUseCase) {
      // Si no está disponible en el contenedor, lo creamos aquí
      const aiAdapter = this.getAIAdapter();
      const knowledgePort = this.getKnowledgePort();
      this.processQuestionUseCase = new ProcessQuestionUseCase(
        aiAdapter,
        knowledgePort,
        this.cache,
        this.logger
      );
    }
    return this.processQuestionUseCase;
  }

  private getAIAdapter(): AIAdapter {
    if (!this.aiAdapter) {
      this.aiAdapter = container.getAIAdapter();
      if (!this.aiAdapter) {
        throw new Error('AIAdapter no está inicializado en el contenedor');
      }
    }
    return this.aiAdapter;
  }

  private getKnowledgePort(): KnowledgePort {
    if (!this.knowledgePort) {
      this.knowledgePort = container.getKnowledgeAdapter();
      if (!this.knowledgePort) {
        throw new Error('KnowledgePort no está inicializado en el contenedor');
      }
    }
    return this.knowledgePort;
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

        const formattedResponse = this.formatResponse(botResponse);
        await say(formattedResponse);
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

        // Agregar tipo de mensaje en metadata para formatear correctamente
        if (!botResponse.metadata) {
          botResponse.metadata = {};
        }
        botResponse.metadata.messageType = 'mention';

        const formattedResponse = this.formatResponse(botResponse);
        await say(formattedResponse);
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

          const formattedResponse = this.formatResponse(botResponse);
          
          // En lugar de usar el método respond, usamos chat.postMessage para más control
          if (this.app) {
            await this.app.client.chat.postMessage({
              channel: command.channel_id,
              text: botResponse.content,
              blocks: formattedResponse.blocks,
              thread_ts: formattedResponse.thread_ts,
              as_user: true // Asegura que se muestre como el bot con su avatar y nombre
            });
          } else {
            await respond(formattedResponse);
          }
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
      
      // Variable para controlar si debemos seguir enviando mensajes de espera
      let processingComplete = false;
      let waitingMessageInterval: NodeJS.Timeout | null = null;
      let initialMessageTs: string | undefined;
      
      // Detectar el idioma de la pregunta
      const language = this.detectLanguage(command.text);
      
      try {
        // Validar el comando
        await this.validationMiddleware.validateCommand('/tg-question')({ body: command } as any, { json: respond } as any, async () => {
          // Enviar mensaje de espera amistoso con The Guardian y la pregunta incluida
          if (this.app) {
            const initialResponse = await this.app.client.chat.postMessage({
              channel: command.channel_id,
              text: language === 'en' ? 
                `The Guardian is processing your question "${command.text}"...` : 
                `The Guardian está procesando tu pregunta "${command.text}"...`,
              blocks: [
                {
                  type: "section",
                  text: {
                    type: "mrkdwn",
                    text: this.getIntroMessage(language, command.text)
                  }
                },
                {
                  type: "context",
                  elements: [
                    {
                      type: "mrkdwn",
                      text: this.getTipMessage(language)
                    }
                  ]
                }
              ],
              as_user: true
            });
            
            initialMessageTs = initialResponse.ts as string;
            
            // Configurar mensajes de espera periódicos cada 15 segundos
            waitingMessageInterval = setInterval(async () => {
              if (!processingComplete) {
                await this.sendWaitingMessage(command.channel_id, command.text, language, initialMessageTs);
              } else if (waitingMessageInterval) {
                clearInterval(waitingMessageInterval);
              }
            }, 15000); // 15 segundos
          }

          // Procesar la pregunta
          let botResponse: BotResponse;
          try {
            botResponse = await this.processCommand(command, '/tg-question');
            
            // Verificar si la respuesta está en el mismo idioma que la pregunta
            const responseLanguage = this.detectLanguage(botResponse.content);
            const expectedLanguage = language;
            
            if (responseLanguage !== expectedLanguage) {
              // Agregar una nota sobre el idioma
              const originalContent = botResponse.content;
              const noteText = language === 'en' ? 
                `\n\n_Note: The Guardian works best with responses in the same language as your question._` : 
                `\n\n_Nota: The Guardian funciona mejor con respuestas en el mismo idioma que tu pregunta._`;
                
              botResponse = {
                ...botResponse,
                content: `${this.getFriendlyIntro(language)}${originalContent}${noteText}`
              };
            } else {
              // Añadir una introducción amigable en el idioma correspondiente
              const originalContent = botResponse.content;
              botResponse = {
                ...botResponse,
                content: `${this.getFriendlyIntro(language)}${originalContent}`
              };
            }
            
            // Asegurarse de que la fuente contenga el enlace si existe
            if (botResponse.metadata && botResponse.metadata.sourceUrl) {
              botResponse.metadata.source = `<${botResponse.metadata.sourceUrl}|${botResponse.metadata.source || 'Documento'}>`;
            } else if (botResponse.metadata && botResponse.metadata.contextSources) {
              const sources = Array.isArray(botResponse.metadata.contextSources) 
                ? botResponse.metadata.contextSources 
                : [botResponse.metadata.contextSources];
              
              if (sources.length > 0 && sources[0].url) {
                botResponse.metadata.source = `<${sources[0].url}|${sources[0].title || 'Documento'}>`;
              }
            }
          } catch (error) {
            this.logger.error('Error procesando pregunta:', error);
            botResponse = {
              content: language === 'en' ?
                '❌ *Error processing your question.* A problem occurred while searching for information. Please try again with another question or reformulate it.' :
                '❌ *Error al procesar tu pregunta.* Ocurrió un problema mientras buscaba la información. Por favor, intenta nuevamente con otra pregunta o reformúlala.',
              type: 'text',
              metadata: {
                source: 'Sistema',
                confidence: 0,
                hasError: true
              }
            };
          }
          
          // Detener los mensajes de espera
          processingComplete = true;
          if (waitingMessageInterval) {
            clearInterval(waitingMessageInterval);
            waitingMessageInterval = null;
          }
          
          // Enviar la respuesta final como un nuevo mensaje
          if (this.app) {
            const formattedResponse = this.formatResponse(botResponse);
            await this.app.client.chat.postMessage({
              channel: command.channel_id || '',
              text: botResponse.content,
              blocks: formattedResponse.blocks,
              thread_ts: initialMessageTs, // Responder en el mismo hilo del mensaje inicial
              as_user: true
            });
          }
        });
      } catch (error) {
        // Detener los mensajes de espera en caso de error
        processingComplete = true;
        if (waitingMessageInterval) {
          clearInterval(waitingMessageInterval);
          waitingMessageInterval = null;
        }
        
        this.logger.error('Error en comando question:', error);
        if (this.app) {
          await this.app.client.chat.postMessage({
            channel: command.channel_id,
            text: language === 'en' ? "Error processing your question" : "Error al procesar tu pregunta",
            blocks: [
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: language === 'en' ?
                    "❌ *Error processing your question.* There was a problem communicating with Slack. Please try again or reformulate your question." :
                    "❌ *Error al procesar tu pregunta.* Ha ocurrido un problema al comunicarse con Slack. Por favor, inténtalo de nuevo o reformula tu pregunta."
                }
              }
            ],
            thread_ts: initialMessageTs,
            as_user: true
          });
        } else {
          await respond({
            blocks: [
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: language === 'en' ?
                    "❌ *Error processing your question.* There was a problem communicating with Slack. Please try again or reformulate your question." :
                    "❌ *Error al procesar tu pregunta.* Ha ocurrido un problema al comunicarse con Slack. Por favor, inténtalo de nuevo o reformula tu pregunta."
                }
              }
            ]
          });
        }
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
          const formattedResponse = this.formatResponse(botResponse);
          
          // En lugar de usar el método respond, usamos chat.postMessage para más control
          if (this.app) {
            await this.app.client.chat.postMessage({
              channel: command.channel_id,
              text: botResponse.content,
              blocks: formattedResponse.blocks,
              thread_ts: formattedResponse.thread_ts,
              as_user: true // Asegura que se muestre como el bot con su avatar y nombre
            });
          } else {
            await respond(formattedResponse);
          }
        });
      } catch (error) {
        this.logger.error('Error en comando summary:', error);
        if (this.app) {
          await this.app.client.chat.postMessage({
            channel: command.channel_id,
            text: "Error al generar el resumen",
            blocks: [
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: "❌ *Error al generar el resumen.* Ha ocurrido un problema al comunicarse con Slack. Por favor, inténtalo de nuevo o con un enlace diferente."
                }
              }
            ],
            as_user: true
          });
        } else {
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
          // Usar el nuevo caso de uso para procesar preguntas
          try {
            this.logger.info('Procesando pregunta con sistema de contexto:', message.content);
            
            // Preparar la consulta para tracking y auditoría
            const query: Query = {
              id: crypto.randomUUID(),
              queryHash: createHash('sha256').update(message.content).digest('hex'),
              originalText: message.content,
              normalizedText: message.content.toLowerCase().trim(),
              language: 'es',
              type: 'question',
              command: '/tg-question',
              status: 'pending',
              userId: message.userId,
              createdAt: new Date(),
              updatedAt: new Date()
            };
            
            // Procesar la pregunta usando el sistema de contexto
            const questionUseCase = this.getProcessQuestionUseCase();
            const questionResponse = await questionUseCase.execute(message);
            
            // Actualizar el estado de la consulta
            query.status = 'completed';
            query.updatedAt = new Date();
            
            // Construir respuesta enriquecida
            response = {
              content: `*Respuesta:*\n${questionResponse.content}`,
              type: 'text',
              threadId: message.threadId,
              metadata: {
                ...questionResponse.metadata,
                query: query
              }
            };
          } catch (error) {
            this.logger.error('Error procesando pregunta:', error);
          response = {
              content: `❌ *Error al procesar tu pregunta*\nLo siento, tuve un problema al procesar tu consulta. Por favor, inténtalo de nuevo con otra pregunta.`,
            type: 'text',
            metadata: {
              source: 'Sistema de preguntas y respuestas',
                confidence: 0.0,
                error: true,
                message: String(error)
            }
          };
          }
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

    // Verificar si la respuesta proviene de una mención del bot (mention)
    const isMention = response.metadata?.messageType === 'mention';
    
    // Verificar si hay metadatos y si debe mostrar información adicional
    const hasMetadata = response.metadata !== undefined && Object.keys(response.metadata || {}).length > 0;
    const hasSearchResults = hasMetadata && response.metadata?.confidence !== undefined && response.metadata?.confidence > 0;
    const hasEmptyResults = hasMetadata && response.metadata?.emptyResults === true;

    // Solo mostrar fuente y confianza cuando hay resultados reales (no vacíos)
    if (hasMetadata && !hasEmptyResults && response.metadata?.source && !isMention && hasSearchResults) {
      blocks.push({
        type: 'context',
        elements: [{
          type: 'mrkdwn',
          text: `📚 Fuente: ${response.metadata.source}`
        }]
      });
    }

    // Solo mostrar confianza cuando hay resultados reales (no vacíos)
    if (hasMetadata && !hasEmptyResults && response.metadata?.confidence !== undefined && !isMention && hasSearchResults) {
      blocks.push({
        type: 'context',
        elements: [{
          type: 'mrkdwn',
          text: `🎯 Confianza: ${Math.round(response.metadata.confidence * 100)}%`
        }]
      });
    }

    // Cuando no hay resultados, agregar un bloque adicional para mantener consistencia en formato
    if (hasEmptyResults) {
      blocks.push({
        type: 'context',
        elements: [{
          type: 'mrkdwn',
          text: `ℹ️ _Prueba con otros términos de búsqueda para encontrar lo que necesitas._`
        }]
      });
    }

    // Configuración para enviar a Slack
    const responseConfig: any = {
      blocks,
      thread_ts: response.threadId,
      text: response.content // Texto alternativo para notificaciones
    };

    return responseConfig;
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
        text,
        as_user: true
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

  // Método para detectar el idioma de la pregunta
  private detectLanguage(text: string): string {
    // Detección simple basada en caracteres y palabras comunes
    const spanishPattern = /([áéíóúüñ¿¡]|(\bde\b|\bla\b|\bel\b|\ben\b|\bcon\b|\bpor\b|\bpara\b|\bcomo\b|\bquien\b|\bcual\b|\bcuando\b|\bdonde\b))/i;
    const englishPattern = /(\bthe\b|\bis\b|\bare\b|\bwas\b|\bwere\b|\bwill\b|\bcan\b|\bcould\b|\bshould\b|\bwould\b|\bhow\b|\bwhen\b|\bwhere\b|\bwhy\b|\bwhat\b)/i;
    
    if (spanishPattern.test(text)) return 'es';
    if (englishPattern.test(text)) return 'en';
    
    // Por defecto, devolver español
    return 'es';
  }

  // Método para obtener mensajes de introducción según el idioma
  private getIntroMessage(language: string, question: string): string {
    if (language === 'en') {
      return `👁️👁️👁️ *The Guardian is processing your question:*\n\n> "${question}"\n\n_My multiple eyes are searching for the best answer for you. This process may take a few moments, especially if it's a complex question or requires consulting various sources of information. Please wait a moment!_`;
    }
    
    // Español por defecto
    return `👁️👁️👁️ *The Guardian está procesando tu pregunta:*\n\n> "${question}"\n\n_Mis múltiples ojos están buscando la mejor respuesta para ti. Este proceso puede tomar unos momentos, especialmente si es una pregunta compleja o requiere consultar varias fuentes de información. ¡Por favor espera un momento!_`;
  }

  // Método para obtener mensajes de consejo según el idioma
  private getTipMessage(language: string): string {
    if (language === 'en') {
      return "💡 *Tip:* For faster questions, try to be specific and concise.";
    }
    
    // Español por defecto
    return "💡 *Tip:* Para preguntas más rápidas, intenta ser específico y conciso.";
  }

  // Método para obtener una introducción amigable para la respuesta según el idioma
  private getFriendlyIntro(language: string): string {
    if (language === 'en') {
      return "*Hello! Here's the information I found for your question:*\n\n";
    }
    
    // Español por defecto
    return "*¡Hola! He encontrado esta información para tu pregunta:*\n\n";
  }

  // Método para manejar mensajes de espera
  private async sendWaitingMessage(channelId: string, originalQuestion: string, language: string = 'es', messageTs?: string): Promise<string | undefined> {
    try {
      if (!this.app) return undefined;
      
      // Seleccionar un mensaje aleatorio del idioma correspondiente
      const messages = this.waitingMessages[language] || this.waitingMessages.es;
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      
      // Texto para la pregunta según el idioma
      const questionText = language === 'en' ? "Question" : "Pregunta";
      
      const response = await this.app.client.chat.postMessage({
        channel: channelId,
        text: randomMessage,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `👁️👁️👁️ *${randomMessage}*`
            }
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: `💬 ${questionText}: "${originalQuestion}"`
              }
            ]
          }
        ],
        thread_ts: messageTs,
        as_user: true
      });
      
      return response.ts as string;
    } catch (error) {
      this.logger.error('Error enviando mensaje de espera:', error);
      return undefined;
    }
  }
} 