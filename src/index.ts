import 'dotenv/config';
import logger from './infrastructure/logging/Logger';
import { container, AppConfig } from './infrastructure/di/index';

async function bootstrap() {
  try {
    console.log('🚀 Iniciando The Guardian...');

    // Configuración de la aplicación
    const config: AppConfig = {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB || '0')
      }
    };

    // Inicializar el contenedor de dependencias
    await container.initialize({
      mongoUri: process.env.MONGODB_URI,
      redisConfig: config.redis,
      openAiKey: process.env.OPENAI_API_KEY,
      slackPort: 3001
    });

    logger.info('✅ Aplicación iniciada correctamente');

  } catch (error: any) {
    logger.error('❌ Error durante el inicio de la aplicación:', error?.message || 'Error desconocido');
    if (error?.stack) {
      logger.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Manejar el cierre gracioso de la aplicación
process.on('SIGTERM', () => {
  logger.info('👋 Cerrando la aplicación...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('👋 Cerrando la aplicación...');
  process.exit(0);
});

bootstrap(); 