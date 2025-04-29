import { App } from '@slack/bolt';
import { Logger } from 'winston';
import { ValidationMiddleware } from '../../infrastructure/middleware/ValidationMiddleware';
import { ProcessMessageUseCase } from '../../application/use-cases/message/ProcessMessageUseCase';
import { container } from '../../infrastructure/di';
import { CacheManager } from '../../infrastructure/cache/CacheManager';
import { CachePort } from '../../domain/ports/CachePort';
import { Message } from '../../domain/models/Message';

/**
 * Registra los comandos disponibles en la aplicación de Slack
 */
export function registerCommands(
  app: App, 
  logger: Logger, 
  validation: ValidationMiddleware,
  cache: CachePort
) {
  const cacheManager = new CacheManager(cache, logger);
  const processMessageUseCase = container.getProcessMessageUseCase();

  // Registro del comando /tg-search
  app.command('/tg-search', async ({ command, ack, respond }) => {
    await ack();
    logger.info('🔍 Comando search recibido:', { text: command.text, user: command.user_name });
    
    try {
      // Validar el comando
      await validation.validateCommand('/tg-search')({ body: command } as any, { json: respond } as any, async () => {
        // Procesar el comando
        const message: Message = {
          content: command.text,
          userId: command.user_id,
          username: command.user_name,
          channel: command.channel_id,
          timestamp: new Date(),
          type: 'command',
          metadata: { command: 'search' }
        };

        // Obtener respuesta del caché o procesarla
        const cachedResponse = await cacheManager.getCachedResponse('/tg-search', command.text);
        const response = cachedResponse || await processMessageUseCase.execute(message);

        // Guardar en caché si no existía previamente
        if (!cachedResponse) {
          await cacheManager.setCachedResponse('/tg-search', command.text, response);
        }

        // Formatear y enviar respuesta
        await respond(formatSlackResponse(response));
      });
    } catch (error) {
      logger.error('Error procesando comando search:', error);
      await respond({
        text: 'Lo siento, ocurrió un error al procesar tu búsqueda.'
      });
    }
  });

  // Registro del comando /tg-question
  app.command('/tg-question', async ({ command, ack, respond }) => {
    await ack();
    logger.info('❓ Comando question recibido:', { text: command.text, user: command.user_name });
    
    try {
      // Validar el comando
      await validation.validateCommand('/tg-question')({ body: command } as any, { json: respond } as any, async () => {
        // Procesar el comando (no se usa caché para preguntas)
        const message: Message = {
          content: command.text,
          userId: command.user_id,
          username: command.user_name,
          channel: command.channel_id,
          timestamp: new Date(),
          type: 'command',
          metadata: { command: 'question' }
        };

        // Respuesta temporal mientras se procesa
        const tempResponse = {
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `🤔 *Analizando tu consulta:*\n"${command.text}"\n\n_Procesando..._`
              }
            }
          ]
        };
        
        await respond(tempResponse);
        
        // Procesamiento real (implementado en el siguiente paso)
        // Este código se completará en el Paso 3
      });
    } catch (error) {
      logger.error('Error procesando comando question:', error);
      await respond({
        text: 'Lo siento, ocurrió un error al procesar tu pregunta.'
      });
    }
  });

  // Función auxiliar para formatear respuestas para Slack
  function formatSlackResponse(response: any) {
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
} 