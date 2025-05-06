/**
 * Script para configurar entorno de desarrollo local
 * Crea archivo .env.local basado en los servicios locales de MongoDB y Redis
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const dotEnvPath = path.join(process.cwd(), '.env');
const dotEnvLocalPath = path.join(process.cwd(), '.env.local');

// Contenido base del archivo .env.local
const baseEnvLocal = `# Configuración del servidor
PORT=3001
NODE_ENV=development
LOG_LEVEL=debug

# MongoDB - Puerto estándar que usa el script de inicio local
MONGODB_URI=mongodb://localhost:27017/tg-guardian

# Redis - Puerto 6380 según el script de inicio local
REDIS_HOST=localhost
REDIS_PORT=6380
REDIS_PASSWORD=
REDIS_DB=0

# Llama
LLAMA_MODEL_PATH=./models/mistral-7b-instruct-v0.2.Q4_K_M.gguf
LLAMA_GPU_LAYERS=0
`;

// Función para crear el archivo .env.local
async function setupLocalEnv() {
  console.log('🔧 Configurando entorno de desarrollo local...');
  
  try {
    // Verificar si existe el archivo .env para obtener tokens
    if (fs.existsSync(dotEnvPath)) {
      console.log('✅ Encontrado archivo .env, copiando tokens...');
      
      // Leer archivo .env existente
      const envContent = fs.readFileSync(dotEnvPath, 'utf8');
      
      // Extraer variables relacionadas con Slack y Confluence
      const slackTokens = envContent.match(/SLACK_[A-Z_]+=.+/g) || [];
      const confluenceTokens = envContent.match(/CONFLUENCE_[A-Z_]+=.+/g) || [];
      const securityTokens = envContent.match(/(JWT_SECRET|SESSION_SECRET|ENCRYPTION_KEY)=.+/g) || [];
      
      // Combinar con el contenido base
      const envLocalContent = [
        baseEnvLocal,
        '# Slack',
        ...slackTokens,
        '',
        '# Confluence',
        ...confluenceTokens,
        '',
        '# Seguridad',
        ...securityTokens
      ].join('\n');
      
      // Escribir archivo .env.local
      fs.writeFileSync(dotEnvLocalPath, envLocalContent);
      console.log('✅ Archivo .env.local creado exitosamente');
    } else {
      console.log('⚠️ No se encontró archivo .env. Creando .env.local básico...');
      fs.writeFileSync(dotEnvLocalPath, baseEnvLocal);
      console.log('✅ Archivo .env.local básico creado. Deberás agregar manualmente los tokens de Slack y Confluence.');
    }
    
    console.log('\n🚀 Configuración completada!');
    console.log('\nPara iniciar el entorno de desarrollo local:');
    console.log('1. Ejecuta TG-Guardian_SlackBot_Test(Local-StartServices).bat para iniciar MongoDB y Redis');
    console.log('2. Ejecuta "npm run dev:local" para iniciar la aplicación');
    
  } catch (error) {
    console.error('❌ Error al configurar entorno local:', error);
  }
}

// Ejecutar la configuración
setupLocalEnv(); 