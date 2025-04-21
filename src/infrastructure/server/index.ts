import express from 'express';
import { App, LogLevel } from '@slack/bolt';
import { registerCommands } from '../../interfaces/slack/commands';
import { HealthCheckService } from '../health/HealthCheckService';
import { container } from '../di';

export const startServer = async () => {
  const app = express();
  const port = Number(process.env.PORT) || 3001;

  // Configuración básica de Express
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Configuración del bot de Slack con Socket Mode y logging detallado
  const slackApp = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: true,
    appToken: process.env.SLACK_APP_TOKEN,
    logLevel: LogLevel.DEBUG // Añadimos logging detallado
  });

  // Registrar comandos
  registerCommands(slackApp);

  // Crear servicio de health check
  const healthCheckService = new HealthCheckService(
    container.getCacheAdapter(),
    container.getPersistenceAdapter(),
    container.getLogger()
  );

  // Endpoint de health check
  app.get('/health', async (req, res) => {
    try {
      const health = await healthCheckService.checkHealth();
      res.status(health.status === 'healthy' ? 200 : 
                 health.status === 'degraded' ? 200 : 503)
         .json(health);
    } catch (error) {
      res.status(500).json({
        status: 'unhealthy',
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  });

  // Middleware de error global
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error en middleware:', err.stack);
    res.status(500).send('¡Algo salió mal! El Guardian está investigando el problema.');
  });

  try {
    // Iniciar el bot de Slack
    await slackApp.start();
    console.log('⚡️ Slack Bot iniciado con Socket Mode');
    console.log('🔑 Bot Token:', process.env.SLACK_BOT_TOKEN?.substring(0, 10) + '...');
    console.log('🔐 App Token:', process.env.SLACK_APP_TOKEN?.substring(0, 10) + '...');

    // Evento para errores no manejados del bot
    slackApp.error(async (error) => {
      console.error('⚠️ Error en Slack App:', error);
    });

    // Iniciar servidor Express
    app.listen(port, () => {
      console.log(`🚀 Servidor Express corriendo en el puerto ${port}`);
      console.log(`🏥 Health check disponible en http://localhost:${port}/health`);
    });
  } catch (error) {
    console.error('❌ Error crítico al iniciar el bot:', error);
    throw error;
  }

  return app;
}; 