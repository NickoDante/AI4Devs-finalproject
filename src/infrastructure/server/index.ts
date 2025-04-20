import express from 'express';
import { App } from '@slack/bolt';
import { registerCommands } from '../../interfaces/slack/commands';

export const startServer = async () => {
  const app = express();
  const port = Number(process.env.PORT) || 3000;

  // Configuración básica de Express
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Configuración del bot de Slack
  const slackApp = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET
  });

  // Registrar comandos
  registerCommands(slackApp);

  // Middleware de error global
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).send('¡Algo salió mal! El Guardian está investigando el problema.');
  });

  // Iniciar servidor Express
  app.listen(port, () => {
    console.log(`🚀 Servidor Express corriendo en el puerto ${port}`);
  });

  // Iniciar el bot de Slack
  await slackApp.start(port);
  console.log('⚡️ Slack Bot iniciado en el puerto', port);

  return app;
}; 