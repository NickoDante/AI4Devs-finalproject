// Script para descargar automáticamente un modelo Llama
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import { createWriteStream } from 'fs';
import readline from 'readline';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MODELS_DIR = path.join(process.cwd(), 'models');
const DEFAULT_MODEL = 'llama-2-7b-chat.Q4_K_M.gguf';
const DEFAULT_MODEL_URL = 'https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF/resolve/main/llama-2-7b-chat.Q4_K_M.gguf';

// Asegurar que el directorio models existe
if (!fs.existsSync(MODELS_DIR)) {
  fs.mkdirSync(MODELS_DIR, { recursive: true });
  console.log(`✅ Directorio de modelos creado: ${MODELS_DIR}`);
}

// Función para mostrar progreso de descarga
function showDownloadProgress(received, total) {
  const percentage = (received * 100) / total;
  const mbReceived = (received / 1048576).toFixed(2);
  const mbTotal = (total / 1048576).toFixed(2);
  
  readline.cursorTo(process.stdout, 0);
  process.stdout.write(`Descargando: ${mbReceived} MB de ${mbTotal} MB (${percentage.toFixed(2)}%)`);
}

// Función para preguntar al usuario si quiere descargar el modelo
function askDownload() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log(`\n⚠️ No se ha encontrado un modelo Llama.`);
    console.log(`ℹ️ El modelo recomendado (${DEFAULT_MODEL}) tiene un tamaño aproximado de 4GB.`);
    
    rl.question('¿Deseas descargar el modelo ahora? (S/n): ', (answer) => {
      rl.close();
      resolve(answer.toLowerCase() !== 'n');
    });
  });
}

// Función para descargar el modelo
async function downloadModel(url = DEFAULT_MODEL_URL, targetFile = DEFAULT_MODEL) {
  const modelPath = path.join(MODELS_DIR, targetFile);
  
  // Verificar si el modelo ya existe
  if (fs.existsSync(modelPath)) {
    console.log(`\n✅ El modelo ya existe en: ${modelPath}`);
    return modelPath;
  }

  // Preguntar al usuario
  const shouldDownload = await askDownload();
  if (!shouldDownload) {
    console.log('\n❌ Descarga cancelada por el usuario.');
    return null;
  }

  console.log(`\n🚀 Iniciando descarga del modelo desde: ${url}`);
  console.log(`📁 El archivo se guardará en: ${modelPath}`);

  return new Promise((resolve, reject) => {
    const file = createWriteStream(modelPath);
    let receivedBytes = 0;

    https.get(url, response => {
      const totalBytes = parseInt(response.headers['content-length'], 10);
      
      response.on('data', chunk => {
        receivedBytes += chunk.length;
        showDownloadProgress(receivedBytes, totalBytes);
        file.write(chunk);
      });

      response.on('end', () => {
        file.end();
        console.log(`\n\n✅ Descarga completada: ${modelPath}`);
        resolve(modelPath);
      });

      response.on('error', err => {
        fs.unlink(modelPath, () => {}); // Eliminar archivo incompleto
        console.error(`\n❌ Error durante la descarga: ${err.message}`);
        reject(err);
      });
    }).on('error', err => {
      fs.unlink(modelPath, () => {}); // Eliminar archivo incompleto
      console.error(`\n❌ Error al iniciar la descarga: ${err.message}`);
      reject(err);
    });
  });
}

// Función para actualizar el archivo .env con la ruta del modelo
function updateEnvFile(modelPath) {
  const envPath = path.join(process.cwd(), '.env');
  const envLocalPath = path.join(process.cwd(), '.env.local');
  const modelRelPath = path.relative(process.cwd(), modelPath);
  
  // Definir la línea a añadir/reemplazar
  const envLine = `LLAMA_MODEL_PATH=${modelRelPath.replace(/\\/g, '/')}`;
  
  try {
    // Actualizar .env si existe
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, 'utf8');
      
      // Reemplazar o añadir la variable de entorno
      if (envContent.includes('LLAMA_MODEL_PATH=')) {
        envContent = envContent.replace(/LLAMA_MODEL_PATH=.*/g, envLine);
      } else {
        envContent += `\n${envLine}`;
      }
      
      fs.writeFileSync(envPath, envContent);
      console.log(`✅ Archivo .env actualizado con la ruta del modelo.`);
    }
    
    // Actualizar .env.local si existe
    if (fs.existsSync(envLocalPath)) {
      let envLocalContent = fs.readFileSync(envLocalPath, 'utf8');
      
      // Reemplazar o añadir la variable de entorno
      if (envLocalContent.includes('LLAMA_MODEL_PATH=')) {
        envLocalContent = envLocalContent.replace(/LLAMA_MODEL_PATH=.*/g, envLine);
      } else {
        envLocalContent += `\n${envLine}`;
      }
      
      fs.writeFileSync(envLocalPath, envLocalContent);
      console.log(`✅ Archivo .env.local actualizado con la ruta del modelo.`);
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Error al actualizar archivos .env: ${error.message}`);
    return false;
  }
}

// Función principal
async function main() {
  try {
    console.log('🤖 Utilidad de descarga de modelos Llama para TG-TheGuardian');
    console.log('====================================================================');
    
    // Verificar si ya existe algún modelo en el directorio
    const modelFiles = fs.readdirSync(MODELS_DIR)
      .filter(file => file.endsWith('.gguf') || file.endsWith('.bin'));
    
    if (modelFiles.length > 0) {
      console.log('ℹ️ Modelos encontrados en el directorio:');
      modelFiles.forEach(file => console.log(` - ${file}`));
      
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise(resolve => {
        rl.question('\n¿Deseas descargar un nuevo modelo de todos modos? (s/N): ', response => {
          rl.close();
          resolve(response.toLowerCase() === 's');
        });
      });
      
      if (!answer) {
        const existingModelPath = path.join(MODELS_DIR, modelFiles[0]);
        console.log(`\n✅ Usando modelo existente: ${existingModelPath}`);
        updateEnvFile(existingModelPath);
        return;
      }
    }

    // Descargar el modelo
    const modelPath = await downloadModel();
    
    if (modelPath) {
      // Actualizar archivo .env
      updateEnvFile(modelPath);
      
      console.log('\n====================================================================');
      console.log('🎉 ¡Configuración completa!');
      console.log('Para probar el modelo, ejecuta: npm run test:llama');
    } else {
      console.log('\n⚠️ El modelo no fue descargado. Puedes descargarlo manualmente siguiendo las instrucciones en models/README.md');
    }
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
  }
}

// Ejecutar la función principal
main().catch(console.error); 