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
import { ProcessSummaryUseCase, SummaryRequest } from '../../application/use-cases/summary/ProcessSummaryUseCase';
import { ProcessFeedbackUseCase, CreateFeedbackRequest } from '../../application/use-cases/feedback/ProcessFeedbackUseCase';
import { SummaryCommand, SummaryValidationResult } from '../../application/commands/summary.command';
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

interface ParsedSummaryCommand {
  url: string;
  language: 'es' | 'en';
  originalText: string;
  hasLanguageParam: boolean;
}

export class SlackAdapter implements MessagePort {
  private app: App | null = null;
  private validationMiddleware: ValidationMiddleware;
  private cacheManager: CacheManager;
  private processMessageUseCase: ProcessMessageUseCase | null = null;
  private processQuestionUseCase: ProcessQuestionUseCase | null = null;
  private processSummaryUseCase: ProcessSummaryUseCase | null = null;
  private processFeedbackUseCase: ProcessFeedbackUseCase | null = null;
  private summaryCommand: SummaryCommand | null = null;
  private aiAdapter: AIAdapter | null = null;
  private knowledgePort: KnowledgePort | null = null;
  private readonly MAX_BLOCK_LENGTH = 2900; // Límite seguro para bloques de texto

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

  private getProcessSummaryUseCase(): ProcessSummaryUseCase {
    if (!this.processSummaryUseCase) {
      this.processSummaryUseCase = container.getProcessSummaryUseCase();
      if (!this.processSummaryUseCase) {
        throw new Error('ProcessSummaryUseCase no está inicializado en el contenedor');
      }
    }
    return this.processSummaryUseCase;
  }

  private getProcessFeedbackUseCase(): ProcessFeedbackUseCase {
    if (!this.processFeedbackUseCase) {
      this.processFeedbackUseCase = container.getProcessFeedbackUseCase();
      if (!this.processFeedbackUseCase) {
        throw new Error('ProcessFeedbackUseCase no está inicializado en el contenedor');
      }
    }
    return this.processFeedbackUseCase;
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

  private getSummaryCommand(): SummaryCommand {
    if (!this.summaryCommand) {
      this.summaryCommand = new SummaryCommand(this.logger);
    }
    return this.summaryCommand;
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

        // NUEVO: Detectar si la mención incluye palabras clave de resumen en inglés y español
        const mentionText = event.text.toLowerCase();
        const isSummaryRequest = mentionText.includes('summary') || 
                                mentionText.includes('resumen') || 
                                mentionText.includes('resume');
        
        if (isSummaryRequest) {
          this.logger.info('🔍 Mención de resumen detectada:', {
            text: event.text,
            user: event.user,
            hasFiles: !!(event.files && event.files.length > 0),
            filesCount: event.files ? event.files.length : 0,
            detectedKeywords: {
              summary: mentionText.includes('summary'),
              resumen: mentionText.includes('resumen'),
              resume: mentionText.includes('resume')
            }
          });
          
          // Detectar idioma basado en la palabra clave utilizada
          const isEnglish = mentionText.includes('summary') || mentionText.includes('resume');
          const isSpanish = mentionText.includes('resumen');
          
          try {
            // Crear mensaje enriquecido para el comando summary
            const summaryMessage: Message = {
              content: event.text,
              userId: event.user,
              username,
              channel: event.channel,
              timestamp: new Date(Number(event.ts) * 1000),
              type: 'mention',
              metadata: { 
                command: 'summary',
                // Incluir archivos si están presentes
                slackFiles: event.files ? event.files.map((file: any) => ({
                  id: file.id,
                  name: file.name || 'archivo_sin_nombre',
                  url_private: file.url_private || file.permalink,
                  permalink: file.permalink || file.url_private,
                  size: file.size || 0,
                  mimetype: file.mimetype || 'application/octet-stream'
                })) : undefined
              }
            };
            
            // Procesar como comando summary
            const summaryCommand = this.getSummaryCommand();
            const validation = await summaryCommand.validate(summaryMessage);
            
            if (validation.isValid) {
              let responseText = '';
              
              if (validation.type === 'file_attachment') {
                const fileName = validation.fileInfo?.name || (isEnglish ? 'file' : 'archivo');
                const fileSize = validation.fileInfo?.size ? 
                  ` (${(validation.fileInfo.size / (1024 * 1024)).toFixed(2)}MB)` : '';
                
                if (isEnglish) {
                  responseText = `📎 Processing attached document for summary...

📄 **File detected:** "${fileName}"${fileSize}
🔍 **Type:** ${validation.fileInfo?.mimetype}
✅ Input validated successfully. Generating summary...`;
                } else {
                  responseText = `📎 Procesando documento adjunto para resumen...

📄 **Archivo detectado:** "${fileName}"${fileSize}
🔍 **Tipo:** ${validation.fileInfo?.mimetype}
✅ Entrada validada exitosamente. Generando resumen...`;
                }
              } else {
                if (isEnglish) {
                  responseText = `🌐 Processing ${validation.metadata?.isConfluence ? 'Confluence URL' : 'URL'} for summary...

🔗 **URL detected:** ${validation.content}
✅ Input validated successfully. Generating summary...`;
                } else {
                  responseText = `🌐 Procesando ${validation.metadata?.isConfluence ? 'URL de Confluence' : 'URL'} para resumen...

🔗 **URL detectada:** ${validation.content}
✅ Entrada validada exitosamente. Generando resumen...`;
                }
              }
              
              await say({
                text: responseText,
                blocks: [
                  {
                    type: "section",
                    text: {
                      type: "mrkdwn",
                      text: responseText
                    }
                  }
                ],
                thread_ts: event.ts
              });
              
              // Crear solicitud de resumen basada en la validación
              let summaryRequest: SummaryRequest;

              if (validation.type === 'file_attachment' && validation.fileInfo) {
                // Para archivos adjuntos, necesitamos descargar el archivo de Slack
                try {
                  this.logger.info('Descargando archivo de Slack:', {
                    fileName: validation.fileInfo.name,
                    fileSize: validation.fileInfo.size,
                    url: validation.fileInfo.url
                  });

                  // Descargar el archivo desde Slack
                  const fileBuffer = await this.downloadSlackFile(validation.fileInfo.url);
                  
                  summaryRequest = {
                    type: 'pdf_buffer',
                    content: fileBuffer,
                    metadata: {
                      userId: event.user,
                      channel: event.channel,
                      fileName: validation.fileInfo.name,
                      fileSize: validation.fileInfo.size
                    }
                  };
                } catch (downloadError) {
                  this.logger.error('Error descargando archivo de Slack:', downloadError);
                  throw new Error(`No se pudo descargar el archivo: ${downloadError instanceof Error ? downloadError.message : 'Error desconocido'}`);
                }
              } else {
                // Para URLs normales
                summaryRequest = {
                  type: 'url',
                  content: validation.content || event.text || '',
                  metadata: {
                    userId: event.user,
                    channel: event.channel
                  }
                };
              }

              // Procesar el resumen
              const summaryUseCase = this.getProcessSummaryUseCase();
              const botResponse = await summaryUseCase.execute(summaryMessage, summaryRequest, {
                maxLength: 500,
                language: isEnglish ? 'en' : 'es',
                includeMetadata: true,
                format: 'structured'
              });

              // Enviar respuesta final
              if (this.app) {
                const formattedResponse = this.formatResponse(botResponse);
                await this.app.client.chat.postMessage({
                  channel: event.channel,
                  text: botResponse.content,
                  blocks: formattedResponse.blocks,
                  thread_ts: event.ts,
                  as_user: true
                });
              }

              return; // Salir aquí para no procesar como mensaje normal
            } else {
              // Error de validación en mención de resumen
              this.logger.error('Error de validación en mención de resumen:', validation.error);
              await say({
                text: validation.error || 'Error de validación',
                blocks: [
                  {
                    type: "section",
                    text: {
                      type: "mrkdwn",
                      text: validation.error || 'Error de validación desconocido'
                    }
                  }
                ],
                thread_ts: event.ts
              });
              return;
            }
          } catch (summaryError) {
            // Error específico en procesamiento de resumen
            this.logger.error('Error procesando resumen en mención:', summaryError);
            const errorMessage = isEnglish ? 
              '❌ *Error generating summary.* There was a problem processing your content. Please try again.' :
              '❌ *Error al generar el resumen.* Hubo un problema al procesar tu contenido. Por favor, inténtalo de nuevo.';
            
            await say({
              text: errorMessage,
              blocks: [
                {
                  type: "section",
                  text: {
                    type: "mrkdwn",
                    text: errorMessage
                  }
                }
              ],
              thread_ts: event.ts
            });
            return;
          }
        }

        // Procesamiento normal de menciones (no summary)
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
                confidence: 0.0,
                error: true,
                message: String(error)
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
    app.command('/tg-summary', async ({ command, ack, respond, client }) => {
      await ack();
      this.logger.info('📝 Comando summary recibido:', command);
      
      // DEBUG: Agregar logging detallado del objeto command
      this.logger.info('DEBUG - Estructura completa del comando:', {
        text: command.text,
        user_id: command.user_id,
        user_name: command.user_name,
        channel_id: command.channel_id,
        channel_name: command.channel_name,
        team_id: command.team_id,
        team_domain: command.team_domain,
        enterprise_id: command.enterprise_id,
        enterprise_name: command.enterprise_name,
        command: command.command,
        token: command.token ? '[PRESENTE]' : '[AUSENTE]',
        response_url: command.response_url ? '[PRESENTE]' : '[AUSENTE]',
        trigger_id: command.trigger_id ? '[PRESENTE]' : '[AUSENTE]',
        files: command.files || 'NO_FILES',
        allKeys: Object.keys(command)
      });
      
      // Variable para controlar mensajes de espera
      let processingComplete = false;
      let waitingMessageInterval: NodeJS.Timeout | null = null;
      let initialMessageTs: string | undefined;
          
      // NUEVO: Parsear comando con parámetros de idioma
      const parsedCommand = this.parseSummaryCommand(command.text || '');
      const language = parsedCommand.language;
      
      this.logger.info('Comando /tg-summary parseado:', {
        originalText: command.text,
        extractedUrl: parsedCommand.url,
        detectedLanguage: parsedCommand.language,
        hasLanguageParam: parsedCommand.hasLanguageParam
      });
      
      try {
        // Enviar mensaje inicial de procesamiento
          if (this.app) {
          const initialResponse = await this.app.client.chat.postMessage({
              channel: command.channel_id,
            text: language === 'en' ? 
              'The Guardian is analyzing your content for summary...' : 
              'The Guardian está analizando tu contenido para generar un resumen...',
            blocks: [
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: language === 'en' ? 
                    '📝 *The Guardian is processing your summary request...*\n\nAnalyzing content and preparing a comprehensive summary.' :
                    '📝 *The Guardian está procesando tu solicitud de resumen...*\n\nAnalizando contenido y preparando un resumen completo.'
                }
              },
              {
                type: "context",
                elements: [
                  {
                    type: "mrkdwn",
                    text: language === 'en' ? 
                      '💡 _Tip: For best results, use Confluence URLs or upload PDF/Word documents._' :
                      '💡 _Consejo: Para mejores resultados, usa URLs de Confluence o sube documentos PDF/Word._'
                  }
                ]
              }
            ],
            as_user: true
          });
          
          initialMessageTs = initialResponse.ts as string;
          
          // Configurar mensajes de espera cada 20 segundos para resúmenes (pueden tomar más tiempo)
          waitingMessageInterval = setInterval(async () => {
            if (!processingComplete) {
              await this.sendWaitingMessage(command.channel_id, command.text || 'contenido', language, initialMessageTs);
            } else if (waitingMessageInterval) {
              clearInterval(waitingMessageInterval);
            }
          }, 20000);
        }

        // Intentar obtener archivos adjuntos del comando DIRECTAMENTE (prioridad sobre URLs)
        let enrichedMessage: Message = {
          content: parsedCommand.url || command.text || '', // Usar URL parseada si está disponible
          userId: command.user_id,
          username: command.user_name,
          channel: command.channel_id,
          timestamp: new Date(),
          type: 'command',
          metadata: { 
            command: 'summary',
            requestedLanguage: parsedCommand.language,
            hasLanguageParam: parsedCommand.hasLanguageParam,
            originalText: command.text
          }
        };

        // PRIORIDAD 1: Buscar archivos adjuntos directamente en el comando slash
        try {
          this.logger.info('Buscando archivos adjuntos en el comando summary (acceso directo)');
          
          // Verificar si el comando tiene archivos adjuntos directamente
          if (command.files && Array.isArray(command.files) && command.files.length > 0) {
            const file = command.files[0];
            this.logger.info('Archivo encontrado en comando directo (prioridad alta):', { 
              id: file.id, 
              name: file.name, 
              mimetype: file.mimetype,
              size: file.size,
              source: 'command_direct'
            });
          
            // Enriquecer el mensaje con información del archivo
            enrichedMessage.metadata = {
              ...enrichedMessage.metadata,
              slackFiles: [{
                id: file.id,
                name: file.name,
                url_private: file.url_private,
                permalink: file.permalink,
                size: file.size,
                mimetype: file.mimetype
              }]
            };
          } else {
            // INFORMACIÓN: Los comandos slash no soportan archivos adjuntos
            this.logger.info('No hay archivos en comando directo (limitación de Slack)');
            
            // Si no hay texto tampoco, informar sobre la alternativa
            if (!parsedCommand.url && (!command.text || !command.text.trim())) {
              // Detener mensajes de espera
              processingComplete = true;
              if (waitingMessageInterval) {
                clearInterval(waitingMessageInterval);
              }
              
              // Informar sobre la alternativa de usar menciones
              if (this.app) {
                await this.app.client.chat.postMessage({
                  channel: command.channel_id,
                  text: '📎 **Para resumir archivos adjuntos:**\n\n1. 📤 **Sube tu archivo** al canal\n2. 🏷️ **Menciona al bot:**\n   • `@TG-TheGuardian summary` (English)\n   • `@TG-TheGuardian resume` (English)\n   • `@TG-TheGuardian resumen` (Español)\n\n*Los comandos slash (`/tg-summary`) solo funcionan con URLs.*',
                  blocks: [
                    {
                      type: "section",
                      text: {
                        type: "mrkdwn",
                        text: "📎 **Para resumir archivos adjuntos:**\n\n1. 📤 **Sube tu archivo** al canal\n2. 🏷️ **Menciona al bot:**\n   • `@TG-TheGuardian summary` (English)\n   • `@TG-TheGuardian resume` (English)\n   • `@TG-TheGuardian resumen` (Español)\n\n*Los comandos slash (`/tg-summary`) solo funcionan con URLs.*"
                      }
                    },
                    {
                      type: "section",
                      text: {
                        type: "mrkdwn",
                        text: "🔗 **Para resumir URLs:**\n\n• `/tg-summary [URL]` (Español por defecto)\n• `/tg-summary [URL] es` (Español explícito)\n• `/tg-summary [URL] en` (Inglés explícito)\n\n💡 **Ejemplos:**\n• `/tg-summary https://confluence.empresa.com/page`\n• `/tg-summary https://confluence.empresa.com/page en`\n• `/tg-summary en https://confluence.empresa.com/page`"
                      }
                    },
                    {
                      type: "context",
                      elements: [
                        {
                          type: "mrkdwn",
                          text: "💡 _Tip: Esta es una limitación de Slack - los comandos slash no pueden recibir archivos adjuntos._"
                        }
                      ]
                    }
                  ],
                  thread_ts: initialMessageTs,
                  as_user: true
                });
          }
              return;
            }
            
            // COMANDO SLASH: Solo procesar URLs, NO buscar archivos en historial
            this.logger.info('Comando slash: Solo procesando URLs, no buscando archivos en historial');
          }
        } catch (fileError) {
          this.logger.warn('No se pudieron obtener archivos:', fileError);
          // Continuar sin archivos - la validación manejará este caso
        }

        // Validar usando el nuevo SummaryCommand
        const summaryCommand = this.getSummaryCommand();
        const validation: SummaryValidationResult = await summaryCommand.validate(enrichedMessage);
        
        if (!validation.isValid) {
          // Detener mensajes de espera
          processingComplete = true;
          if (waitingMessageInterval) {
            clearInterval(waitingMessageInterval);
          }
          
          // Enviar mensaje de error de validación
        if (this.app) {
          await this.app.client.chat.postMessage({
            channel: command.channel_id,
              text: validation.error || 'Error de validación',
            blocks: [
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                    text: validation.error || 'Error de validación desconocido'
                }
              }
            ],
              thread_ts: initialMessageTs,
            as_user: true
          });
          }
          return;
        }

        // Actualizar mensaje inicial con información específica sobre lo que se está procesando
        if (this.app && initialMessageTs) {
          let processingInfo = '';
          let contentInfo = '';
          
          if (validation.type === 'file_attachment') {
            // PRIORIDAD: Mostrar información del archivo adjunto
            const fileName = validation.fileInfo?.name || 'archivo';
            const fileSize = validation.fileInfo?.size ? 
              ` (${(validation.fileInfo.size / (1024 * 1024)).toFixed(2)}MB)` : '';
            const fileType = validation.fileInfo?.mimetype || 'tipo desconocido';
            
            processingInfo = language === 'en' ? 
              `📎 *Processing attached document for summary...*` :
              `📎 *Procesando documento adjunto para resumen...*`;
            
            contentInfo = `> 📄 **Archivo detectado:** "${fileName}"${fileSize}\n> 🔍 **Tipo:** ${fileType}`;
            
            // Si había texto adicional, mostrarlo también
            if (command.text && command.text.trim()) {
              contentInfo += `\n> 💬 **Texto adicional:** "${command.text.trim()}"`;
            }
            
          } else if (validation.type === 'url') {
            const isConfluence = validation.metadata?.isConfluence;
            const urlType = isConfluence ? 'Confluence' : 'Web';
            
            processingInfo = language === 'en' ? 
              `📄 *Processing ${urlType} URL for summary...*` :
              `📄 *Procesando URL de ${urlType} para resumen...*`;
            
            // Mostrar la URL que se va a procesar
            const urlToShow = validation.content || '';
            contentInfo = `> 🔗 **URL detectada:** ${urlToShow}`;
            
            // Si la URL original era diferente (hipervínculo), mostrar ambas
            if (command.text && command.text !== urlToShow) {
              contentInfo += `\n> 📝 **Texto original:** "${command.text}"`;
            }
          }

          await this.app.client.chat.update({
            channel: command.channel_id,
            ts: initialMessageTs,
            text: processingInfo,
            blocks: [
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: `👁️👁️👁️ ${processingInfo}\n\n${contentInfo}\n\n_${language === 'en' ? 
                    '✅ Input validated successfully. Ready to process...' :
                    '✅ Entrada validada exitosamente. Listo para procesar...'}_`
                }
              },
              {
                type: "context",
                elements: [
                  {
                    type: "mrkdwn",
                    text: language === 'en' ? 
                      '💡 _Tip: Files have priority over URLs. Upload documents for best results._' :
                      '💡 _Consejo: Los archivos tienen prioridad sobre URLs. Sube documentos para mejores resultados._'
                  }
                ]
              }
            ],
            as_user: true
          });
        }

        // Crear solicitud de resumen basada en la validación
        let summaryRequest: SummaryRequest;
        
        if (validation.type === 'file_attachment' && validation.fileInfo) {
          // Para archivos adjuntos, necesitamos descargar el archivo de Slack
          try {
            this.logger.info('Descargando archivo de Slack:', {
              fileName: validation.fileInfo.name,
              fileSize: validation.fileInfo.size,
              url: validation.fileInfo.url
            });

            // Descargar el archivo desde Slack
            const fileBuffer = await this.downloadSlackFile(validation.fileInfo.url);
            
            summaryRequest = {
              type: 'pdf_buffer',
              content: fileBuffer,
              metadata: {
                userId: command.user_id,
                channel: command.channel_id,
                fileName: validation.fileInfo.name,
                fileSize: validation.fileInfo.size
              }
            };
          } catch (downloadError) {
            this.logger.error('Error descargando archivo de Slack:', downloadError);
            throw new Error(`No se pudo descargar el archivo: ${downloadError instanceof Error ? downloadError.message : 'Error desconocido'}`);
          }
        } else {
          // Para URLs normales
          summaryRequest = {
            type: 'url',
            content: validation.content || command.text || '',
            metadata: {
              userId: command.user_id,
              channel: command.channel_id
            }
          };
        }

        // Procesar el resumen
        const summaryUseCase = this.getProcessSummaryUseCase();
        const botResponse = await summaryUseCase.execute(enrichedMessage, summaryRequest, {
          maxLength: 500,
          language: language === 'en' ? 'en' : 'es',
          includeMetadata: true,
          format: 'structured'
        });

        // Detener mensajes de espera
        processingComplete = true;
        if (waitingMessageInterval) {
          clearInterval(waitingMessageInterval);
        }

        // Enviar respuesta final
        if (this.app) {
          const formattedResponse = this.formatResponse(botResponse);
          await this.app.client.chat.postMessage({
            channel: command.channel_id,
            text: botResponse.content,
            blocks: formattedResponse.blocks,
            thread_ts: initialMessageTs,
            as_user: true
          });
        }
      } catch (error) {
        // Detener mensajes de espera
        processingComplete = true;
        if (waitingMessageInterval) {
          clearInterval(waitingMessageInterval);
        }
        
        this.logger.error('Error en comando summary:', error);
        
        const errorMessage = language === 'en' ?
          '❌ *Error generating summary.* There was a problem processing your content. Please try again with a different URL or file.' :
          '❌ *Error al generar el resumen.* Hubo un problema al procesar tu contenido. Por favor, inténtalo de nuevo con una URL o archivo diferente.';
        
        if (this.app) {
          await this.app.client.chat.postMessage({
            channel: command.channel_id,
            text: errorMessage,
            blocks: [
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: errorMessage
                }
              }
            ],
            thread_ts: initialMessageTs,
            as_user: true
          });
        }
      }
    });

    // Comando de feedback
    app.command('/tg-feedback', async ({ command, ack, respond }) => {
      await ack();
      this.logger.info('Comando /tg-feedback recibido:', {
        text: command.text,
        user: command.user_name,
        channel: command.channel_name
      });

      try {
        // Detectar idioma
        const language = this.detectLanguage(command.text);
        
        // Validar formato del comando: /tg-feedback [+1|-1] [comentario opcional]
        const parts = command.text.trim().split(' ');
        if (parts.length === 0 || parts[0] === '') {
          await respond({
            blocks: [
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: language === 'en' ? 
                    "📝 *How to use feedback:*\n\n• `/tg-feedback +1` - Mark last response as helpful\n• `/tg-feedback -1` - Mark as not helpful\n• `/tg-feedback +1 Great explanation!` - Add a comment\n\n💡 _Tip: Your feedback helps improve The Guardian's responses._" :
                    "📝 *Cómo usar el feedback:*\n\n• `/tg-feedback +1` - Marcar última respuesta como útil\n• `/tg-feedback -1` - Marcar como no útil\n• `/tg-feedback +1 ¡Excelente explicación!` - Agregar comentario\n\n💡 _Consejo: Tu feedback ayuda a mejorar las respuestas de The Guardian._"
                }
              }
            ]
          });
          return;
        }

        const feedbackType = parts[0].trim();
        const isHelpful = feedbackType === '+1';
        const isNotHelpful = feedbackType === '-1';
        
        if (!isHelpful && !isNotHelpful) {
          await respond({
            blocks: [
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: language === 'en' ? 
                    "❌ *Invalid feedback format.*\n\nPlease use:\n• `+1` for positive feedback\n• `-1` for negative feedback\n\n💡 _Example: `/tg-feedback +1` or `/tg-feedback -1 needs improvement`_" :
                    "❌ *Formato de feedback inválido.*\n\nPor favor usa:\n• `+1` para feedback positivo\n• `-1` para feedback negativo\n\n💡 _Ejemplo: `/tg-feedback +1` o `/tg-feedback -1 necesita mejoras`_"
                }
              }
            ]
          });
          return;
        }

        // Extraer comentario opcional (todo después del emoji)
        const comment = parts.slice(1).join(' ').trim() || undefined;

        // Crear solicitud de feedback
        const feedbackRequest: CreateFeedbackRequest = {
          responseId: `response_${command.channel_id}_${Date.now()}`, // ID temporal para MVP
          userId: command.user_id,
          isHelpful: isHelpful,
          rating: isHelpful ? 5 : 1,
          comment: comment,
          categories: ['user_feedback'],
          tags: [language, 'slack_command']
        };

        // Procesar feedback
        const feedbackUseCase = this.getProcessFeedbackUseCase();
        const savedFeedback = await feedbackUseCase.createFeedback(feedbackRequest);

        // Responder al usuario
        const successMessage = language === 'en' ? 
          `✅ *Feedback received!*\n\nThank you for your ${isHelpful ? 'positive' : 'constructive'} feedback. This helps The Guardian improve.${comment ? `\n\n💬 Your comment: "${comment}"` : ''}` :
          `✅ *¡Feedback recibido!*\n\nGracias por tu feedback ${isHelpful ? 'positivo' : 'constructivo'}. Esto ayuda a The Guardian a mejorar.${comment ? `\n\n💬 Tu comentario: "${comment}"` : ''}`;

        await respond({
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: successMessage
              }
            },
            {
              type: "context",
              elements: [
                {
                  type: "mrkdwn",
                  text: language === 'en' ? 
                    `📊 Feedback ID: ${savedFeedback.id.substring(0, 8)}...` :
                    `📊 ID de feedback: ${savedFeedback.id.substring(0, 8)}...`
                }
              ]
            }
          ]
        });

        this.logger.info('Feedback procesado exitosamente:', {
          feedbackId: savedFeedback.id,
          userId: command.user_id,
          isHelpful: isHelpful,
          hasComment: !!comment
        });

      } catch (error) {
        this.logger.error('Error procesando feedback:', error);
        const language = this.detectLanguage(command.text);
        
        await respond({
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: language === 'en' ? 
                  "❌ *Error processing feedback.* Please try again later." :
                  "❌ *Error al procesar feedback.* Por favor, inténtalo de nuevo más tarde."
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
          try {
            // Determinar el tipo de contenido y crear la solicitud de resumen
            const summaryRequest: SummaryRequest = {
              type: 'url', // Por ahora solo URLs, PDFs vendrán después
              content: command.text,
              metadata: {
                userId: command.user_id,
                channel: command.channel_id
              }
            };

            // Crear mensaje temporal para el caso de uso
            const tempMessage: Message = {
              content: command.text,
              userId: command.user_id,
              username: command.user_name,
              channel: command.channel_id,
              timestamp: new Date(),
              type: 'command',
              metadata: { command: 'summary' }
            };

            // Procesar el resumen usando el nuevo caso de uso
            const summaryUseCase = this.getProcessSummaryUseCase();
            response = await summaryUseCase.execute(tempMessage, summaryRequest, {
              maxLength: 500,
              language: 'es',
              includeMetadata: true,
              format: 'structured'
            });

          } catch (error) {
            this.logger.error('Error procesando resumen:', error);
          response = {
              content: `❌ *Error al generar resumen*\n\n${error instanceof Error ? error.message : 'Error desconocido al procesar el documento.'}`,
            type: 'text',
            metadata: {
                source: 'Sistema de resúmenes',
                confidence: 0,
                error: true
            }
          };
          }
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

  private formatResponse(response: BotResponse): { blocks: any[], thread_ts?: string } {
    const blocks: any[] = [];
    
    // Si el contenido es muy largo, dividirlo en bloques más pequeños
    const contentChunks = this.splitLongMessage(response.content);
    
    // Agregar cada chunk como un bloque separado
    for (let i = 0; i < contentChunks.length; i++) {
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: contentChunks[i]
        }
      });
      
      // Si no es el último chunk, agregar un divisor
      if (i < contentChunks.length - 1) {
        blocks.push({
          type: "divider"
        });
      }
    }
    
    // Agregar metadatos si están disponibles
    if (response.metadata) {
      // Agregar fuente si está disponible
      if (response.metadata.source) {
        blocks.push({
          type: "context",
          elements: [{
            type: "mrkdwn",
            text: `📚 Fuente: ${response.metadata.source}`
          }]
        });
      }
      
      // Agregar confianza si está disponible
      if (response.metadata.confidence) {
        blocks.push({
          type: "context",
          elements: [{
            type: "mrkdwn",
            text: `🎯 Confianza: ${Math.round(response.metadata.confidence * 100)}%`
          }]
        });
      }
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

  /**
   * Divide un mensaje largo en partes más pequeñas
   */
  private splitLongMessage(text: string, maxLength: number = 2900): string[] {
    const chunks: string[] = [];
    let currentChunk = '';
    
    // Dividir por párrafos primero
    const paragraphs = text.split('\n\n');
    
    for (const paragraph of paragraphs) {
      // Si el párrafo por sí solo excede el límite, dividirlo por líneas
      if (paragraph.length > maxLength) {
        const lines = paragraph.split('\n');
        for (const line of lines) {
          // Si la línea es muy larga, dividirla en fragmentos
          if (line.length > maxLength) {
            let i = 0;
            while (i < line.length) {
              const chunk = line.slice(i, i + maxLength);
              if (currentChunk.length + chunk.length + 1 > maxLength) {
                chunks.push(currentChunk);
                currentChunk = chunk;
              } else {
                currentChunk += (currentChunk ? '\n' : '') + chunk;
              }
              i += maxLength;
            }
          } else {
            // Agregar la línea si cabe en el chunk actual
            if (currentChunk.length + line.length + 1 > maxLength) {
              chunks.push(currentChunk);
              currentChunk = line;
            } else {
              currentChunk += (currentChunk ? '\n' : '') + line;
            }
          }
        }
      } else {
        // Agregar el párrafo si cabe en el chunk actual
        if (currentChunk.length + paragraph.length + 2 > maxLength) {
          chunks.push(currentChunk);
          currentChunk = paragraph;
        } else {
          currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
        }
      }
    }
    
    // Agregar el último chunk si no está vacío
    if (currentChunk) {
      chunks.push(currentChunk);
    }
    
    return chunks;
  }

  /**
   * Envía un mensaje largo dividiéndolo en partes si es necesario
   */
  private async sendLongMessage(channel: string, text: string, threadTs?: string): Promise<void> {
    this.assertAppInitialized();
    try {
      const parts = this.splitLongMessage(text);
      const totalParts = parts.length;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isFirstPart = i === 0;
        const isLastPart = i === parts.length - 1;

        // Agregar indicadores de parte si hay múltiples partes
        let messageText = part;
        if (totalParts > 1) {
          messageText = `${isFirstPart ? '📝 ' : ''}${messageText}${isLastPart ? '' : ' ...'}\n${isLastPart ? '' : `(Parte ${i + 1}/${totalParts})`}`;
        }

        const response = await this.app!.client.chat.postMessage({
          channel,
          text: messageText,
          thread_ts: threadTs,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: messageText
              }
            }
          ]
        });

        // Si es la primera parte, usar su ts como thread_ts para las siguientes partes
        if (isFirstPart && !threadTs) {
          threadTs = response.ts;
        }

        // Pequeña pausa entre mensajes para mantener el orden
        if (!isLastPart) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } catch (error) {
      this.logger.error('Error al enviar mensaje largo:', error);
      throw error;
    }
  }

  /**
   * Envía un mensaje a Slack
   */
  async sendMessage(channel: string, message: string, threadTs?: string): Promise<void> {
    this.assertAppInitialized();
    try {
      if (message.length > this.MAX_BLOCK_LENGTH) {
        await this.sendLongMessage(channel, message, threadTs);
      } else {
        await this.app!.client.chat.postMessage({
          channel,
          text: message,
          thread_ts: threadTs,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: message
              }
            }
          ]
        });
      }
    } catch (error) {
      this.logger.error('Error al enviar mensaje:', error);
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

  // Método para validar si una cadena es una URL válida
  private isValidUrl(text: string): boolean {
    try {
      const url = new URL(text);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  // Método para parsear comandos de resumen con parámetros de idioma
  private parseSummaryCommand(commandText: string): ParsedSummaryCommand {
    const parts = commandText.trim().split(/\s+/).filter(part => part.length > 0);
    
    // Palabras clave de idioma
    const languageKeywords = {
      'es': ['es', 'español', 'spanish', 'spa'],
      'en': ['en', 'english', 'inglés', 'ing', 'eng']
    };
    
    let detectedLanguage: 'es' | 'en' = 'es'; // Default español
    let urlPart = '';
    let hasLanguageParam = false;
    
    // Buscar idioma y URL en los parámetros
    for (const part of parts) {
      const lowerPart = part.toLowerCase();
      
      // Verificar si es un parámetro de idioma
      if (languageKeywords.es.includes(lowerPart)) {
        detectedLanguage = 'es';
        hasLanguageParam = true;
      } else if (languageKeywords.en.includes(lowerPart)) {
        detectedLanguage = 'en';
        hasLanguageParam = true;
      } else if (this.isValidUrl(part)) {
        urlPart = part;
      } else if (part.startsWith('<') && part.endsWith('>')) {
        // Manejar URLs en formato Slack <URL|texto> o <URL>
        const urlMatch = part.match(/^<([^|>]+)/);
        if (urlMatch && this.isValidUrl(urlMatch[1])) {
          urlPart = urlMatch[1];
        }
      }
    }
    
    // Si no se encontró URL válida, intentar extraer de texto completo
    if (!urlPart) {
      // Buscar URLs en el texto completo
      const urlRegex = /(https?:\/\/[^\s]+)/gi;
      const urlMatch = commandText.match(urlRegex);
      if (urlMatch && urlMatch[0]) {
        urlPart = urlMatch[0];
      }
    }
    
    this.logger.info('Comando de resumen parseado:', {
      originalText: commandText,
      detectedLanguage,
      hasLanguageParam,
      extractedUrl: urlPart,
      parts
    });
    
    return {
      url: urlPart,
      language: detectedLanguage,
      originalText: commandText,
      hasLanguageParam
    };
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

  private async downloadSlackFile(url: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const https = require('https');
      const http = require('http');
      
      // Determinar el cliente HTTP apropiado
      const client = url.startsWith('https:') ? https : http;
      
      // Configurar headers con el token de autenticación
      const options = {
        headers: {
          'Authorization': `Bearer ${process.env.SLACK_BOT_TOKEN}`,
          'User-Agent': 'TG-TheGuardian-Bot/1.0'
        }
      };

      const request = client.get(url, options, (response: any) => {
        // Manejar redirecciones
        if (response.statusCode === 302 || response.statusCode === 301) {
          const redirectUrl = response.headers.location;
          if (redirectUrl) {
            this.logger.info('Siguiendo redirección de archivo de Slack:', redirectUrl);
            // Recursivamente seguir la redirección
            this.downloadSlackFile(redirectUrl).then(resolve).catch(reject);
            return;
          }
        }

        if (response.statusCode !== 200) {
          reject(new Error(`Error descargando archivo de Slack: HTTP ${response.statusCode}`));
          return;
        }

        const chunks: Buffer[] = [];
        let totalSize = 0;
        const maxSize = 50 * 1024 * 1024; // 50MB límite

        response.on('data', (chunk: Buffer) => {
          totalSize += chunk.length;
          
          if (totalSize > maxSize) {
            request.destroy();
            reject(new Error('El archivo es demasiado grande (máximo 50MB)'));
            return;
          }
          
          chunks.push(chunk);
        });

        response.on('end', () => {
          const buffer = Buffer.concat(chunks);
          this.logger.info('Archivo descargado exitosamente:', {
            size: buffer.length,
            sizeInMB: (buffer.length / (1024 * 1024)).toFixed(2)
          });
          resolve(buffer);
        });

        response.on('error', (error: Error) => {
          reject(new Error(`Error en la respuesta: ${error.message}`));
        });
      });

      request.on('error', (error: Error) => {
        reject(new Error(`Error de conexión: ${error.message}`));
      });

      request.setTimeout(30000, () => {
        request.destroy();
        reject(new Error('Timeout descargando archivo (30s)'));
      });
    });
  }
} 