import { LlamaAdapter } from '../../../adapters/llm/LlamaAdapter';
import { Message } from '../../../domain/models/Message';
import { createLogger, format, transports } from 'winston';
import fs from 'fs';

// Mock para fs.existsSync
jest.mock('fs', () => ({
  existsSync: jest.fn()
}));

// Mock para node-llama-cpp
jest.mock('node-llama-cpp', () => {
  return {
    __esModule: true,
    getLlama: jest.fn().mockImplementation(() => {
      return {
        loadModel: jest.fn().mockImplementation(() => {
          return {
            createContext: jest.fn().mockImplementation(() => {
              return {
                getSequence: jest.fn().mockReturnValue({})
              };
            })
          };
        })
      };
    }),
    LlamaChatSession: jest.fn().mockImplementation(() => {
      return {
        prompt: jest.fn().mockImplementation((text, options) => {
          // Proporcionar respuestas diferentes según el idioma detectado
          const systemPrompt = options?.systemPrompt || '';
          if (systemPrompt.includes('español') || systemPrompt.includes('SIEMPRE en español')) {
            return Promise.resolve('Esta es una respuesta simulada en español');
          } else {
            return Promise.resolve('This is a simulated response in English');
          }
        })
      };
    })
  };
});

describe('LlamaAdapter', () => {
  let llamaAdapter: LlamaAdapter;
  let logger: any;

  beforeEach(() => {
    // Configurar logger
    logger = createLogger({
      level: 'debug',
      format: format.combine(
        format.timestamp(),
        format.json()
      ),
      transports: [
        new transports.Console({
          silent: true // Silenciar logs durante tests
        })
      ]
    });

    // Limpiar mocks entre pruebas
    jest.clearAllMocks();
    
    // Configurar mock para existsSync (modelo existe por defecto)
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    
    // Crear instancia de LlamaAdapter
    llamaAdapter = new LlamaAdapter(logger);
  });

  describe('Detección de idioma', () => {
    test('debe detectar correctamente texto en español', () => {
      // Acceder al método privado para probar directamente
      const result = (llamaAdapter as any).detectLanguage('Hola, ¿cómo estás? Necesito información sobre el proyecto');
      expect(result).toBe('es');
    });

    test('debe detectar correctamente texto en inglés', () => {
      // Acceder al método privado para probar directamente
      const result = (llamaAdapter as any).detectLanguage('Hello, how are you? I need information about the project');
      expect(result).toBe('en');
    });

    test('debe usar español como idioma predeterminado para textos ambiguos', () => {
      // Texto que no contiene palabras clave distintivas
      const result = (llamaAdapter as any).detectLanguage('12345 67890');
      expect(result).toBe('es');
    });
  });

  describe('Procesamiento de mensajes', () => {
    test('debe generar respuesta en español para mensajes en español', async () => {
      const message: Message = {
        content: '¿Qué servicios ofrece Teravision Games?',
        userId: 'user123',
        username: 'testuser',
        channel: 'channel123',
        timestamp: new Date(),
        type: 'direct_message'
      };

      const response = await llamaAdapter.processMessage(message);
      
      expect(response.content).toContain('respuesta simulada en español');
      expect(response.metadata?.language).toBe('es');
    });

    test('debe generar respuesta en inglés para mensajes en inglés', async () => {
      const message: Message = {
        content: 'What services does Teravision Games offer?',
        userId: 'user123',
        username: 'testuser',
        channel: 'channel123',
        timestamp: new Date(),
        type: 'direct_message'
      };

      const response = await llamaAdapter.processMessage(message);
      
      expect(response.content).toContain('simulated response in English');
      expect(response.metadata?.language).toBe('en');
    });
  });

  describe('Manejo de errores y mensajes de fallback', () => {
    test('debe proporcionar mensaje de error en español cuando el modelo no existe y la pregunta es en español', async () => {
      // Simular que el modelo no existe
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      
      const message: Message = {
        content: '¿Cuál es la misión de la empresa?',
        userId: 'user123',
        username: 'testuser',
        channel: 'channel123',
        timestamp: new Date(),
        type: 'direct_message'
      };

      const response = await llamaAdapter.processMessage(message);
      
      expect(response.metadata?.modelMissing).toBe(true);
      expect(response.content).toContain('No se ha encontrado un modelo Llama');
      expect(response.metadata?.language).toBe('es');
    });

    test('debe proporcionar mensaje de error en inglés cuando el modelo no existe y la pregunta es en inglés', async () => {
      // Simular que el modelo no existe
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      
      const message: Message = {
        content: 'What is the company mission?',
        userId: 'user123',
        username: 'testuser',
        channel: 'channel123',
        timestamp: new Date(),
        type: 'direct_message'
      };

      const response = await llamaAdapter.processMessage(message);
      
      expect(response.metadata?.modelMissing).toBe(true);
      expect(response.content).toContain('No Llama model found');
      expect(response.metadata?.language).toBe('en');
    });

    test('debe manejar errores durante la carga del modelo en español', async () => {
      // Forzar un error en getLlama
      const error = new Error('Error al cargar el modelo');
      require('node-llama-cpp').getLlama.mockRejectedValueOnce(error);
      
      const message: Message = {
        content: '¿Dónde están las oficinas de Teravision?',
        userId: 'user123',
        username: 'testuser',
        channel: 'channel123',
        timestamp: new Date(),
        type: 'direct_message'
      };

      const response = await llamaAdapter.processMessage(message);
      
      expect(response.metadata?.error).toBe(true);
      expect(response.content).toContain('Llama LLM no está actualmente disponible');
      expect(response.metadata?.message).toBe('Error al cargar el modelo');
    });

    test('debe manejar errores durante la carga del modelo en inglés', async () => {
      // Forzar un error en getLlama
      const error = new Error('Error loading the model');
      require('node-llama-cpp').getLlama.mockRejectedValueOnce(error);
      
      const message: Message = {
        content: 'Where are the Teravision offices?',
        userId: 'user123',
        username: 'testuser',
        channel: 'channel123',
        timestamp: new Date(),
        type: 'direct_message'
      };

      const response = await llamaAdapter.processMessage(message);
      
      expect(response.metadata?.error).toBe(true);
      expect(response.content).toContain('Llama LLM is currently unavailable');
      expect(response.metadata?.message).toBe('Error loading the model');
    });
  });

  describe('Contexto de conversación', () => {
    test('debe mantener y limpiar correctamente el contexto de conversación', async () => {
      // Enviar un mensaje para crear contexto
      await llamaAdapter.processMessage({
        content: '¿Qué servicios ofrece Teravision Games?',
        userId: 'user123',
        username: 'testuser',
        channel: 'channel123',
        timestamp: new Date(),
        type: 'direct_message'
      });
      
      // Verificar que el contexto contiene el mensaje (accediendo a variable privada)
      expect((llamaAdapter as any).contextMessages.length).toBe(1);
      
      // Limpiar contexto
      await llamaAdapter.clearContext();
      
      // Verificar que el contexto está vacío
      expect((llamaAdapter as any).contextMessages.length).toBe(0);
    });
  });
}); 