import 'dotenv/config';
import { SlackAdapter } from './adapters/slack/SlackAdapter';

async function bootstrap() {
  try {
    console.log('🚀 Iniciando prueba de conexión con Slack...');

    const slackAdapter = new SlackAdapter();
    await slackAdapter.start(3001);

  } catch (error: any) {
    console.error('❌ Error durante el inicio de la aplicación:', error?.message || 'Error desconocido');
    if (error?.stack) {
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Manejar el cierre gracioso de la aplicación
process.on('SIGTERM', () => {
  console.log('👋 Cerrando la aplicación...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 Cerrando la aplicación...');
  process.exit(0);
});

bootstrap(); 