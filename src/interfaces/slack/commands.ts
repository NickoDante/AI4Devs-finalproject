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

  // Comando de ayuda
  app.command('/tg-help', async ({ ack, respond }) => {
    await ack();
    
    try {
      await respond({
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
    } catch (error) {
      await respond({
        text: "❌ Lo siento, ocurrió un error al mostrar la ayuda.",
        response_type: 'ephemeral'
      });
    }
  });
}; 