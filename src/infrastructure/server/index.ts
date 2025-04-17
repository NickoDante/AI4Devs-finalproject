import express from 'express';
import { SlackAdapter } from '../../adapters/slack/SlackAdapter';

export async function startServer() {
  const app = express();
  const port = Number(process.env.PORT) || 3000;

  // Configuración básica de Express
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Inicializar Slack Bot
  const slackAdapter = new SlackAdapter();

  // Middleware de error global
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).send('¡Algo salió mal! El Guardian está investigando el problema.');
  });

  // Iniciar servidor Express
  app.listen(port, () => {
    console.log(`🚀 Servidor Express corriendo en el puerto ${port}`);
  });

  // Iniciar Slack App
  await slackAdapter.start(port);

  return { app, slackAdapter };
} 