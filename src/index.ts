import 'dotenv/config';
import { container } from './infrastructure/di';

async function bootstrap() {
  try {
    // Inicializar el contenedor de dependencias
    await container.initialize();

    // Obtener el adaptador de Slack
    const slackAdapter = container.getSlackAdapter();
    const port = Number(process.env.PORT) || 3000;

    // Iniciar el servidor
    await slackAdapter.start(port);
    
    console.log('🚀 TG: The Guardian está listo para ayudar!');
  } catch (error) {
    console.error('Error al iniciar la aplicación:', error);
    process.exit(1);
  }
}

bootstrap(); 