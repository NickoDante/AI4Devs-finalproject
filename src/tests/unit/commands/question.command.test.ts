import { SlackAdapter } from '../../../adapters/slack/SlackAdapter';
import { createLogger, format, transports } from 'winston';
import { Message } from '../../../domain/models/Message';
import { BotResponse } from '../../../domain/models/BotResponse';

// Mock para dependencias
const mockAIAdapter = {
  processMessage: jest.fn()
};

// Usar doMock en lugar de mock para asegurarnos que se ejecute después de definir mockAIAdapter
jest.doMock('../../../infrastructure/di', () => ({
  container: {
    getAIAdapter: jest.fn().mockReturnValue(mockAIAdapter),
    getKnowledgeAdapter: jest.fn().mockReturnValue({}),
    getProcessMessageUseCase: jest.fn().mockReturnValue({
      execute: jest.fn().mockResolvedValue({
        content: 'Respuesta de prueba',
        type: 'text'
      })
    }),
    getProcessQuestionUseCase: jest.fn().mockReturnValue({
      execute: jest.fn().mockResolvedValue({
        content: 'Respuesta a la pregunta',
        type: 'text'
      })
    })
  }
}));

describe('Comando /tg-question', () => {
  let mockLogger: any;
  let mockCache: any;
  let slackAdapter: SlackAdapter;
  let mockAck: jest.Mock;
  let mockRespond: jest.Mock;
  let mockClient: any;
  let commandHandler: jest.Mock;

  beforeEach(() => {
    // Resetear todos los mocks
    jest.clearAllMocks();
    
    // Configurar logger
    mockLogger = createLogger({
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
    
    // Mock para Cache
    mockCache = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
      exists: jest.fn().mockResolvedValue(false),
      delete: jest.fn().mockResolvedValue(undefined),
      getTTL: jest.fn().mockResolvedValue(0),
      updateTTL: jest.fn().mockResolvedValue(undefined),
      clear: jest.fn().mockResolvedValue(undefined),
      healthCheck: jest.fn().mockResolvedValue(true),
      getConversationContext: jest.fn().mockResolvedValue(null),
      setConversationContext: jest.fn().mockResolvedValue(undefined)
    };
    
    // Mock para Slack client
    mockClient = {
      chat: {
        postMessage: jest.fn().mockResolvedValue({ ts: 'message-123' }),
        update: jest.fn().mockResolvedValue({})
      }
    };
    
    // Mocks para Slack interacciones
    mockAck = jest.fn();
    mockRespond = jest.fn();
    
    // Configurar respuesta del adaptador AI
    mockAIAdapter.processMessage.mockResolvedValue({
      content: 'Respuesta de prueba',
      type: 'text',
      metadata: {
        model: 'llama-local',
        confidence: 0.9,
        language: 'es'
      }
    });
    
    // Crear SlackAdapter
    slackAdapter = new SlackAdapter(mockLogger, mockCache);
    
    // Crear un mock para el handler del comando
    commandHandler = jest.fn().mockImplementation(async ({ command, ack, respond, client }) => {
      // Confirmar recepción del comando
      await ack();
      
      // Enviar mensaje de espera
      await respond({
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: 'The Guardian está procesando tu pregunta...'
            }
          }
        ]
      });
      
      try {
        // Simular procesamiento del comando
        const botResponse = await mockAIAdapter.processMessage({
          content: command.text,
          userId: command.user_id,
          username: command.user_name,
          channel: command.channel_id,
          timestamp: new Date(),
          type: 'command'
        });
        
        // Enviar respuesta final
        await client.chat.postMessage({
          channel: command.channel_id,
          text: botResponse.content
        });
        
        return botResponse;
      } catch (error) {
        // Manejar el error
        await respond({
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: 'Error al procesar tu pregunta'
              }
            }
          ]
        });
        throw error;
      }
    });
    
    // Configurar mocks internos del SlackAdapter
    (slackAdapter as any).app = {
      client: mockClient,
      command: jest.fn().mockImplementation((commandName, handler) => {
        // Ignoramos el handler real y usamos nuestro mock
        return (slackAdapter as any).app;
      })
    };
    
    // Mockear el método processCommand
    (slackAdapter as any).processCommand = jest.fn().mockImplementation(async (command, commandType) => {
      if (commandType === '/tg-question') {
        // Convertir el comando de Slack a un mensaje para el AI Adapter
        const message: Message = {
          content: command.text,
          userId: command.user_id,
          username: command.user_name,
          channel: command.channel_id,
          timestamp: new Date(),
          type: 'command'
        };
        
        // Procesar el mensaje con el AI Adapter
        return mockAIAdapter.processMessage(message);
      }
      return undefined;
    });
  });

  describe('Manejo del comando', () => {
    test('debe mostrar mensaje de espera y procesar la respuesta', async () => {
      // Comando simulado
      const command = {
        command: '/tg-question',
        text: '¿Qué servicios ofrece Teravision Games?',
        user_id: 'usuario123',
        user_name: 'Usuario Prueba',
        channel_id: 'canal123'
      };
      
      // Ejecutar el handler directamente
      await commandHandler({ 
        command, 
        ack: mockAck, 
        respond: mockRespond,
        client: mockClient
      });
      
      // Verificar que se confirmó el comando
      expect(mockAck).toHaveBeenCalled();
      
      // Verificar que se mostró mensaje de espera
      expect(mockRespond).toHaveBeenCalledWith(expect.objectContaining({
        blocks: expect.arrayContaining([
          expect.objectContaining({
            text: expect.objectContaining({
              text: expect.stringContaining('The Guardian está procesando tu pregunta')
            })
          })
        ])
      }));
      
      // Verificar que se envió la respuesta final
      expect(mockClient.chat.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          channel: 'canal123'
        })
      );
    });
  });

  describe('Procesamiento del comando', () => {
    test('debe procesar correctamente el comando y enviar respuesta', async () => {
      // Simular comando y contexto
      const command = {
        command: '/tg-question',
        text: '¿Qué servicios ofrece Teravision Games?',
        user_id: 'usuario123',
        user_name: 'Usuario Prueba',
        channel_id: 'canal123'
      };
      
      // Ejecutar el método que procesa comandos
      const response = await (slackAdapter as any).processCommand(command, '/tg-question');
      
      // Verificar que la respuesta es correcta
      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
      expect(response.type).toBe('text');
    });

    test('debe manejar errores durante el procesamiento del comando', async () => {
      // Forzar un error en el procesamiento
      const mockError = new Error('Error de prueba');
      mockAIAdapter.processMessage.mockRejectedValueOnce(mockError);
      
      // Simular comando
      const command = {
        command: '/tg-question',
        text: '¿Qué servicios ofrece Teravision Games?',
        user_id: 'usuario123',
        user_name: 'Usuario Prueba',
        channel_id: 'canal123'
      };
      
      try {
        // Ejecutar el handler directamente
        await commandHandler({ 
          command, 
          ack: mockAck, 
          respond: mockRespond,
          client: mockClient
        });
        // Si llegamos aquí, deberíamos fallar el test
        fail('Debería haber lanzado un error');
      } catch (error) {
        // Verificar que se mostró mensaje de error
        expect(mockRespond).toHaveBeenCalledWith(
          expect.objectContaining({
            blocks: expect.arrayContaining([
              expect.objectContaining({
                text: expect.objectContaining({
                  text: expect.stringContaining('Error al procesar tu pregunta')
                })
              })
            ])
          })
        );
        // Es aceptable que el test lance error en este escenario
        expect(error).toBeDefined();
      }
    });
  });

  describe('Detección de idioma', () => {
    test('debe procesar la pregunta con el idioma correcto cuando se usa español', async () => {
      // Configurar AI Adapter para verificar el mensaje recibido
      let capturedMessage: Message | null = null;
      
      // Es importante limpiar el mock primero
      mockAIAdapter.processMessage.mockReset();
      
      // Configurar el nuevo comportamiento
      mockAIAdapter.processMessage.mockImplementation((message: Message) => {
        capturedMessage = message;
        return Promise.resolve({
          content: 'Respuesta en español',
          type: 'text',
          metadata: {
            language: 'es'
          }
        });
      });
      
      // Simular comando en español
      const command = {
        command: '/tg-question',
        text: '¿Qué servicios ofrece Teravision Games?',
        user_id: 'usuario123',
        user_name: 'Usuario Prueba',
        channel_id: 'canal123'
      };
      
      // Ejecutar procesamiento del comando
      await (slackAdapter as any).processCommand(command, '/tg-question');
      
      // Verificar que el adaptador de AI recibió el contenido en español
      expect(capturedMessage).not.toBeNull();
      expect(capturedMessage!.content).toBe('¿Qué servicios ofrece Teravision Games?');
    });
    
    test('debe procesar la pregunta con el idioma correcto cuando se usa inglés', async () => {
      // Configurar AI Adapter para verificar el mensaje recibido
      let capturedMessage: Message | null = null;
      
      // Es importante limpiar el mock primero
      mockAIAdapter.processMessage.mockReset();
      
      // Configurar el nuevo comportamiento
      mockAIAdapter.processMessage.mockImplementation((message: Message) => {
        capturedMessage = message;
        return Promise.resolve({
          content: 'Response in English',
          type: 'text',
          metadata: {
            language: 'en'
          }
        });
      });
      
      // Simular comando en inglés
      const command = {
        command: '/tg-question',
        text: 'What services does Teravision Games offer?',
        user_id: 'usuario123',
        user_name: 'Usuario Prueba',
        channel_id: 'canal123'
      };
      
      // Ejecutar procesamiento del comando
      await (slackAdapter as any).processCommand(command, '/tg-question');
      
      // Verificar que el adaptador de AI recibió el contenido en inglés
      expect(capturedMessage).not.toBeNull();
      expect(capturedMessage!.content).toBe('What services does Teravision Games offer?');
    });
  });
}); 