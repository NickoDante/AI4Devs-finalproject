import 'dotenv/config';
import { validateEnv } from './shared/config/envValidator';
import { container } from './infrastructure/di';

async function bootstrap() {
  try {
    // Validar variables de entorno antes de iniciar
    validateEnv();

    console.log('🚀 Iniciando TG: The Guardian...');

    // Inicializar el contenedor de dependencias
    await container.initialize();
    console.log('✅ Contenedor de dependencias inicializado');

    // Obtener el adaptador de Slack
    const slackAdapter = container.getSlackAdapter();
    const port = Number(process.env.PORT) || 3000;

    try {
      // Iniciar el servidor de Slack
      await slackAdapter.start(port);
      console.log(`🤖 Bot de Slack iniciado en el puerto ${port}`);

      // Log de estado de la configuración
      console.log(`
      🟢 TG: The Guardian está en línea
      📱 Slack Bot Token: ${process.env.SLACK_BOT_TOKEN ? 'Configurado ✅' : 'No configurado ❌'}
      🔑 Signing Secret: ${process.env.SLACK_SIGNING_SECRET ? 'Configurado ✅' : 'No configurado ❌'}
      💾 MongoDB URI: ${process.env.MONGODB_URI ? 'Configurado ✅' : 'No configurado ❌'}
      🤖 OpenAI API Key: ${process.env.OPENAI_API_KEY ? 'Configurado ✅' : 'No configurado ❌'}
      `);
    } catch (error: any) {
      if (error?.message?.includes('already started')) {
        console.log('⚠️ Detectado servidor Slack previo, intentando reiniciar...');
        // Aquí podrías implementar una lógica de reinicio si es necesario
        process.exit(1);
      }
      throw error;
    }

    console.log('🚀 Aplicación iniciada correctamente');
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
  console.log('👋 Cerrando TG: The Guardian...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 Cerrando TG: The Guardian...');
  process.exit(0);
});

bootstrap(); 