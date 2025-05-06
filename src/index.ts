import 'dotenv/config';
import logger from './infrastructure/logging/Logger';
import { container, AppConfig } from './infrastructure/di/index';
import { UncaughtErrorMiddleware } from './infrastructure/middleware/UncaughtErrorMiddleware';
import { DependencyContainer } from './infrastructure/di';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';

// Inicializar manejo de errores no capturados
const uncaughtErrorMiddleware = new UncaughtErrorMiddleware(logger);
uncaughtErrorMiddleware.initialize();

// Verificar si el modelo Llama está disponible
const checkModelAvailability = () => {
  const modelPath = process.env.LLAMA_MODEL_PATH || path.join(process.cwd(), 'models', 'llama-model.gguf');
  
  if (!fs.existsSync(modelPath)) {
    logger.warn('⚠️ No se ha encontrado un modelo Llama en la ruta configurada:', modelPath);
    logger.info('ℹ️ Puedes descargar automáticamente un modelo ejecutando: npm run download:llama');
    
    // Preguntar al usuario si desea descargar el modelo automáticamente
    if (process.stdout.isTTY) { // Solo en entorno interactivo (no en producción)
      console.log('\n\n🤖 ¿Deseas descargar automáticamente el modelo Llama ahora? (S/n):');
      
      // Configurar entrada estándar para la respuesta
      process.stdin.resume();
      process.stdin.setEncoding('utf8');
      
      process.stdin.once('data', (data) => {
        const response = data.toString().trim().toLowerCase();
        
        if (response !== 'n') {
          console.log('\n📥 Iniciando descarga del modelo...\n');
          
          // Ejecutar script de descarga
          const downloadProcess = exec('npm run download:llama');
          
          // Redirigir salida del proceso a la consola principal
          downloadProcess.stdout?.pipe(process.stdout);
          downloadProcess.stderr?.pipe(process.stderr);
          
          downloadProcess.on('exit', (code) => {
            if (code === 0) {
              console.log('\n✅ Modelo descargado correctamente. Reiniciando aplicación...');
              startApplication();
            } else {
              console.error('\n❌ Error al descargar el modelo. Por favor, inténtelo manualmente: npm run download:llama');
              startApplication();
            }
          });
        } else {
          console.log('\n⏭️ Continuando sin descargar el modelo...');
          startApplication();
        }
      });
      
      return false; // No iniciar la aplicación todavía
    }
  }
  
  return true; // El modelo existe o no estamos en un entorno interactivo
};

// Función para iniciar la aplicación
const startApplication = async () => {
  try {
    logger.info('🚀 Iniciando TG-TheGuardian...');
    
    // Inicializar el contenedor de dependencias
    const container = DependencyContainer.getInstance();
    
    // Configuración y conexión a servicios externos
    await container.initialize({
      mongoUri: process.env.MONGODB_URI,
      redisConfig: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
      },
      llamaModelPath: process.env.LLAMA_MODEL_PATH,
      slackPort: parseInt(process.env.PORT || '3001')
    });
    
    // Manejar señales de término
process.on('SIGTERM', () => {
      logger.info('🛑 Recibida señal SIGTERM, cerrando aplicación...');
  process.exit(0);
});

process.on('SIGINT', () => {
      logger.info('🛑 Recibida señal SIGINT, cerrando aplicación...');
  process.exit(0);
});

    logger.info('✅ TG-TheGuardian iniciado correctamente');
  } catch (error) {
    logger.error('❌ Error al iniciar la aplicación:', error);
    process.exit(1);
  }
};

// Iniciar la aplicación verificando primero si el modelo está disponible
if (checkModelAvailability()) {
  startApplication();
} 