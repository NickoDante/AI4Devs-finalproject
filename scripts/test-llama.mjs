// Script para probar la integración con Llama
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { getLlama, LlamaChatSession } from 'node-llama-cpp';
import fs from 'fs';

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuración del modelo
const MODEL_PATH = process.env.LLAMA_MODEL_PATH || path.join(process.cwd(), 'models', 'llama-model.gguf');

// Función principal para probar Llama
async function testLlama() {
    console.log('⏳ Iniciando prueba de integración con Llama...');
    
    try {
        // Verificar si el modelo existe
        if (!fs.existsSync(MODEL_PATH)) {
            console.error(`❌ Modelo no encontrado en: ${MODEL_PATH}`);
            console.log('ℹ️ Por favor, descarga un modelo compatible usando las instrucciones en models/README.md');
            return;
        }

        console.log(`🔍 Usando modelo: ${MODEL_PATH}`);
        
        // Inicializar Llama
        const llama = await getLlama();
        console.log('✅ Llama inicializado correctamente');
        
        // Cargar el modelo
        console.log('⏳ Cargando modelo...');
        const model = await llama.loadModel({
            modelPath: MODEL_PATH,
            contextSize: 4096,
            gpuLayers: process.env.LLAMA_GPU_LAYERS ? parseInt(process.env.LLAMA_GPU_LAYERS) : 0
        });
        console.log('✅ Modelo cargado correctamente');
        
        // Crear contexto y sesión
        const context = await model.createContext();
        const session = new LlamaChatSession({
            contextSequence: context.getSequence()
        });
        console.log('✅ Sesión de chat creada correctamente');
        
        // Realizar una prueba simple
        const testQuestion = "¿Qué es Teravision Games y a qué se dedica?";
        console.log(`🤔 Enviando pregunta: "${testQuestion}"`);
        
        // Definir sistema prompt
        const systemPrompt = "Eres un asistente útil que ayuda a los empleados de Teravision Games a encontrar información y responder preguntas sobre la empresa.";
        
        // Procesar la pregunta
        console.log('⏳ Procesando respuesta (esto puede tomar un momento)...');
        const response = await session.prompt(testQuestion, {
            systemPrompt: systemPrompt
        });
        
        console.log('\n📝 Respuesta:');
        console.log('------------------------');
        console.log(response);
        console.log('------------------------');
        
        console.log('\n✅ Prueba completada con éxito');
    } catch (error) {
        console.error('\n❌ Error durante la prueba:', error);
    }
}

// Ejecutar la prueba
testLlama().catch(console.error); 