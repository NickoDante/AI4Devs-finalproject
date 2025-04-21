import { App } from '@slack/bolt';

export const registerCommands = (app: App) => {
  // Comando de búsqueda
  app.command('/tg-search', async ({ command, ack, respond }) => {
    await ack();
    
    try {
      const searchQuery = command.text;
      
      // Mensaje de confirmación inmediata
      await respond({
        text: `🔍 Buscando información sobre: "${searchQuery}"...`,
        response_type: 'ephemeral'
      });

      // TODO: Implementar lógica de búsqueda real
      await respond({
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "*Resultados de búsqueda:*\nPor ahora esto es una respuesta de prueba."
            }
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `Query: ${searchQuery}\nEsta funcionalidad estará disponible pronto.`
            }
          }
        ]
      });
    } catch (error) {
      await respond({
        text: "❌ Lo siento, ocurrió un error al procesar tu búsqueda.",
        response_type: 'ephemeral'
      });
    }
  });

  // Comando administrativo
  app.command('/tg-admin', async ({ command, ack, respond }) => {
    await ack();
    
    try {
      const adminQuery = command.text;
      
      await respond({
        text: `👩‍💼 Procesando consulta administrativa: "${adminQuery}"...`,
        response_type: 'ephemeral'
      });

      // TODO: Implementar lógica administrativa real
      await respond({
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "*Respuesta administrativa:*\nPor ahora esto es una respuesta de prueba."
            }
          }
        ]
      });
    } catch (error) {
      await respond({
        text: "❌ Lo siento, ocurrió un error al procesar tu consulta administrativa.",
        response_type: 'ephemeral'
      });
    }
  });

  // Comando de ayuda (el más simple, probémoslo primero)
  app.command('/tg-help', async ({ command, ack, respond, logger }) => {
    // Primero enviamos el acknowledgement
    try {
      await ack();
      logger.debug('Comando /tg-help recibido:', command);
    } catch (error) {
      logger.error('Error al enviar ack para /tg-help:', error);
      return;
    }
    
    // Luego intentamos responder
    try {
      await respond({
        response_type: 'ephemeral', // Aseguramos que sea ephemeral
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "*🤖 TG: The Guardian - Comandos disponibles*"
            }
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "• `/tg-search [consulta]`: Busca información en la documentación\n• `/tg-admin [consulta]`: Realiza consultas administrativas\n• `/tg-help`: Muestra este mensaje de ayuda"
            }
          }
        ]
      });
      logger.debug('Respuesta de /tg-help enviada exitosamente');
    } catch (error) {
      logger.error('Error al enviar respuesta de /tg-help:', error);
      // Intentamos enviar un mensaje de error simple si falla
      try {
        await respond({
          response_type: 'ephemeral',
          text: "❌ Lo siento, ocurrió un error al mostrar la ayuda. Por favor, intenta de nuevo."
        });
      } catch (e) {
        logger.error('Error al enviar mensaje de error fallback:', e);
      }
    }
  });
}; 