// Este archivo usa importaciones dinámicas para resolver problemas de compatibilidad ESM/CommonJS
import { Message } from '../../domain/models/Message';
import { BotResponse } from '../../domain/models/BotResponse';
import { AIAdapter } from '../../domain/ports/AIAdapter';
import path from 'path';
import fs from 'fs';
import { Logger } from 'winston';
import logger from '../../infrastructure/logging/Logger';

/**
 * Interfaces para opciones de Llama
 * Usadas para documentación y para evitar usar "any" directamente
 */
interface LlamaModelOptionsExtended {
  modelPath: string;
  contextSize: number;
  gpuLayers: number;
  [key: string]: any; // Para otras propiedades que puedan existir
}

interface LlamaPromptOptionsExtended {
  systemPrompt: string;
  [key: string]: any; // Para otras propiedades que puedan existir
}

/**
 * Adaptador para modelos Llama locales
 * Esta implementación evita completamente el uso de top-level await
 * y es compatible con entornos CommonJS y Docker
 */
export class LlamaAdapter implements AIAdapter {
  private contextMessages: Message[] = [];
  private readonly MAX_CONTEXT_LENGTH = 10;
  private readonly MODEL_PATH = process.env.LLAMA_MODEL_PATH || 
    path.join(process.cwd(), 'models', 'mistral-7b-instruct-v0.2.Q4_K_M.gguf');
  private readonly logger: Logger;
  private llamaInstance: any = null;

  constructor(loggerInstance?: Logger) {
    this.logger = loggerInstance || logger;
    this.logger.info(`🔍 Modelo Llama configurado en: ${this.MODEL_PATH}`);
    
    // Verificar si el modelo existe
    if (!fs.existsSync(this.MODEL_PATH)) {
      this.logger.warn(`⚠️ Modelo no encontrado en: ${this.MODEL_PATH}`);
      this.logger.info('ℹ️ Se utilizará una respuesta simulada para las consultas. Ejecute "npm run download:llama" para descargar un modelo.');
    } else {
      this.logger.info('✅ Modelo Llama encontrado y listo para usarse cuando se necesite');
    }
  }

  /**
   * Detecta el idioma probable del texto basado en palabras comunes
   * @param text Texto para analizar
   * @returns Código de idioma ('es', 'en', etc.)
   */
  private detectLanguage(text: string): string {
    const lowerText = text.toLowerCase();
    
    // Palabras comunes en español
    const spanishWords = ['el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'y', 'o', 'pero', 
      'porque', 'como', 'que', 'cuando', 'donde', 'quien', 'cual', 'esto', 'esta', 'estos', 'estas',
      'para', 'por', 'con', 'sin', 'sobre', 'bajo', 'ante', 'cómo', 'cuándo', 'dónde', 'qué'];
    
    // Palabras comunes en inglés
    const englishWords = ['the', 'a', 'an', 'and', 'or', 'but', 'because', 'as', 'that', 'when', 
      'where', 'who', 'which', 'this', 'these', 'those', 'for', 'by', 'with', 'without', 'about', 
      'under', 'over', 'how', 'what', 'why'];
      
    // Contar coincidencias
    let spanishCount = 0;
    let englishCount = 0;
    
    // Dividir el texto en palabras
    const words = lowerText.split(/\W+/);
    
    // Contar palabras en español
    for (const word of words) {
      if (spanishWords.includes(word)) spanishCount++;
      if (englishWords.includes(word)) englishCount++;
    }
    
    this.logger.debug(`Detección de idioma: ES=${spanishCount}, EN=${englishCount}`);
    
    // Determinar el idioma
    if (spanishCount > englishCount) return 'es';
    if (englishCount > spanishCount) return 'en';
    
    // Por defecto, español si no podemos determinar
    return 'es';
  }

  async processMessage(message: Message): Promise<BotResponse> {
    try {
      // Verificar si el modelo existe antes de intentar usarlo
      if (!fs.existsSync(this.MODEL_PATH)) {
        return this.getMissingModelResponse(message);
      }

      // Gestionar el contexto de la conversación
      this.contextMessages.push(message);
      if (this.contextMessages.length > this.MAX_CONTEXT_LENGTH) {
        this.contextMessages.shift();
      }

      // Detectar el idioma del mensaje
      const detectedLanguage = this.detectLanguage(message.content);
      this.logger.info(`🌎 Idioma detectado: ${detectedLanguage === 'es' ? 'Español' : 'Inglés'}`);

      // Intentar cargar el módulo y procesar el mensaje de forma segura
      try {
        this.logger.info(`🚀 Inicializando procesamiento con Llama...`);
        
        // Importación dinámica y procesamiento del mensaje
        // Note: Este enfoque NO usa top-level await
        const llamaModule = await import('node-llama-cpp');
        this.logger.info(`📦 Módulo node-llama-cpp importado correctamente`);
        
        const llama = await llamaModule.getLlama();
        this.logger.info(`⚙️ Instancia de Llama obtenida, cargando modelo...`);
        
        // Configuración del modelo con casteo explícito para evitar errores de tipo
        const model = await llama.loadModel({
          modelPath: this.MODEL_PATH,
          contextSize: 4096,
          gpuLayers: Number(process.env.LLAMA_GPU_LAYERS || 0)
        } as any);
        this.logger.info(`📚 Modelo cargado correctamente desde: ${this.MODEL_PATH}`);
        
        const context = await model.createContext();
        this.logger.info(`🧠 Contexto creado para la conversación`);
        
        const session = new llamaModule.LlamaChatSession({
          contextSequence: context.getSequence()
        });
        this.logger.info(`💬 Sesión de chat iniciada`);

        // Procesar el mensaje con Llama
        let systemPrompt = "";
        
        if (detectedLanguage === 'es') {
          systemPrompt = "Eres un asistente útil que ayuda a los empleados de Teravision Games a encontrar información y responder preguntas sobre la empresa. Responde SIEMPRE en español.";
        } else {
          systemPrompt = "You are a helpful assistant that helps Teravision Games employees find information and answer questions about the company. Always respond in English.";
        }
        
        // Añadir instrucción para responder en el mismo idioma de la pregunta
        systemPrompt += detectedLanguage === 'es' 
          ? " Responde siempre en el mismo idioma en que se te ha hecho la pregunta."
          : " Always respond in the same language as the question.";
        
        this.logger.info(`📝 Procesando pregunta con sistema de contexto en ${detectedLanguage === 'es' ? 'español' : 'inglés'}`);
        
        // Procesar con casteo explícito para evitar errores de tipo
        const response = await session.prompt(message.content, {
          systemPrompt: systemPrompt
        } as any);
        
        this.logger.info(`✅ Respuesta generada correctamente`);

        return {
          content: response,
          type: 'text',
          threadId: message.threadId,
          metadata: {
            model: "llama-local",
            confidence: 0.9,
            language: detectedLanguage
          }
        };
      } catch (error) {
        this.logger.error('❌ Error al procesar mensaje con Llama:', error);
        return this.getErrorResponse(message, error as Error);
      }
    } catch (error) {
      this.logger.error('❌ Error general en LlamaAdapter:', error);
      return this.getErrorResponse(message, error as Error);
    }
  }

  private getMissingModelResponse(message: Message): BotResponse {
    // Detectar el idioma para la respuesta de error
    const detectedLanguage = this.detectLanguage(message.content);
    
    let content = '';
    if (detectedLanguage === 'es') {
      content = `Esta es una respuesta simulada para tu pregunta: "${message.content}".\n\n⚠️ No se ha encontrado un modelo Llama en la ruta configurada.\n\nPara instalar automáticamente un modelo, ejecuta el siguiente comando en la terminal:\nnpm run download:llama\n\nAlternativamente, puedes descargar manualmente un modelo siguiendo las instrucciones en models/README.md y configurar LLAMA_MODEL_PATH en el archivo .env`;
    } else {
      content = `This is a simulated response to your question: "${message.content}".\n\n⚠️ No Llama model found at the configured path.\n\nTo automatically install a model, run the following command in the terminal:\nnpm run download:llama\n\nAlternatively, you can manually download a model following the instructions in models/README.md and configure LLAMA_MODEL_PATH in the .env file`;
    }
    
    return {
      content,
      type: 'text',
      threadId: message.threadId,
      metadata: {
        model: "llama-fallback",
        confidence: 0.5,
        error: true,
        modelMissing: true,
        language: detectedLanguage
      }
    };
  }

  private getErrorResponse(message: Message, error: Error): BotResponse {
    // Detectar el idioma para la respuesta de error
    const detectedLanguage = this.detectLanguage(message.content);
    
    let content = '';
    if (detectedLanguage === 'es') {
      content = `Esta es una respuesta simulada para tu pregunta: "${message.content}".\n\nLlama LLM no está actualmente disponible (Error: ${error.message}).\n\nVerifica la configuración del modelo o ejecuta "npm run test:llama" para diagnosticar el problema.`;
    } else {
      content = `This is a simulated response to your question: "${message.content}".\n\nLlama LLM is currently unavailable (Error: ${error.message}).\n\nCheck the model configuration or run "npm run test:llama" to diagnose the issue.`;
    }
    
    return {
      content,
      type: 'text',
      threadId: message.threadId,
      metadata: {
        model: "llama-fallback",
        confidence: 0.5,
        error: true,
        message: error.message,
        language: detectedLanguage
      }
    };
  }

  async clearContext(): Promise<void> {
    this.logger.info('🧹 Limpiando contexto de conversación');
    this.contextMessages = [];
    // No necesitamos hacer nada más, ya que creamos una nueva sesión cada vez
  }

  /**
   * Inicializa el modelo Llama si aún no está inicializado
   */
  private async initializeLlama(): Promise<any> {
    if (!this.llamaInstance) {
      try {
        const llamaModule = await import('node-llama-cpp');
        const llama = await llamaModule.getLlama();
        this.llamaInstance = await llama.loadModel({
          modelPath: this.MODEL_PATH,
          contextSize: 4096,
          gpuLayers: Number(process.env.LLAMA_GPU_LAYERS || 0)
        } as any);
        this.logger.info('✅ Modelo Llama inicializado correctamente');
      } catch (error) {
        this.logger.error('❌ Error al inicializar Llama:', error);
        throw error;
      }
    }
    return this.llamaInstance;
  }

  /**
   * Genera embeddings para un texto dado
   */
  async generateEmbeddings(text: string): Promise<number[]> {
    try {
      const model = await this.initializeLlama();
      const context = await model.createContext();
      
      // Usar el modelo para generar embeddings
      const embeddings = await context.getEmbeddings(text);
      
      this.logger.debug('Embeddings generados correctamente', {
        textLength: text.length,
        embeddingsLength: embeddings.length
      });
      
      return embeddings;
    } catch (error) {
      this.logger.error('❌ Error al generar embeddings:', error);
      throw error;
    }
  }

  /**
   * Genera embeddings para múltiples textos en batch
   */
  async generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
    try {
      const model = await this.initializeLlama();
      const context = await model.createContext();
      
      // Procesar textos en batch
      const embeddings = await Promise.all(
        texts.map(text => context.getEmbeddings(text))
      );
      
      this.logger.debug('Embeddings batch generados correctamente', {
        textsCount: texts.length,
        embeddingsCount: embeddings.length
      });
      
      return embeddings;
    } catch (error) {
      this.logger.error('❌ Error al generar embeddings batch:', error);
      throw error;
    }
  }
} 