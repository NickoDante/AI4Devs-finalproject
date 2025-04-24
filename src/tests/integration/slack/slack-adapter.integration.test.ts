import { SlackAdapter } from '../../../adapters/slack/SlackAdapter';
import { createLogger, format, transports } from 'winston';
import { Message } from '../../../domain/models/Message';
import { BotResponse } from '../../../domain/models/BotResponse';

// Configurar mocks
jest.mock('@slack/bolt', () => {
  return {
    App: jest.fn().mockImplementation(() => ({
      start: jest.fn().mockResolvedValue(undefined),
      command: jest.fn(),
      message: jest.fn(),
      event: jest.fn(),
      error: jest.fn()
    })),
    LogLevel: {
      DEBUG: 'debug'
    }
  };
});

describe('SlackAdapter Integration Tests', () => {
  let slackAdapter: SlackAdapter;
  let logger: any;
  let cachePort: any;
  
  beforeEach(() => {
    // Configurar logger
    logger = createLogger({
      level: 'debug',
      format: format.combine(
        format.timestamp(),
        format.json()
      ),
      transports: [
        new transports.Console()
      ]
    });
    
    // Mock para CachePort
    cachePort = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
      exists: jest.fn().mockResolvedValue(false),
      getTTL: jest.fn().mockResolvedValue(0),
      updateTTL: jest.fn().mockResolvedValue(undefined),
      clear: jest.fn().mockResolvedValue(undefined),
      pushToList: jest.fn().mockResolvedValue(1),
      getList: jest.fn().mockResolvedValue([]),
      setHash: jest.fn().mockResolvedValue(undefined),
      getHash: jest.fn().mockResolvedValue({}),
      healthCheck: jest.fn().mockResolvedValue(true),
      setConversationContext: jest.fn().mockResolvedValue(undefined),
      getConversationContext: jest.fn().mockResolvedValue(null)
    };
    
    // Crear instancia de SlackAdapter
    slackAdapter = new SlackAdapter(logger, cachePort);
  });
  
  test('should initialize SlackAdapter correctly', async () => {
    // En una prueba real, esto requeriría tokens de Slack válidos
    // Aquí sólo verificamos que no lance error con nuestros mocks
    process.env.SLACK_BOT_TOKEN = 'xoxb-test-token';
    process.env.SLACK_SIGNING_SECRET = 'test-signing-secret';
    process.env.SLACK_APP_TOKEN = 'xapp-test-token';
    
    // Mockear métodos internos para evitar errores
    (slackAdapter as any).initializeEventListeners = jest.fn();
    
    await expect(slackAdapter.start(3000)).resolves.not.toThrow();
  });
  
  test('should process messages correctly', async () => {
    const testMessage: Message = {
      content: 'Test message',
      userId: 'U123456',
      username: 'testuser',
      channel: 'C123456',
      timestamp: new Date(),
      type: 'direct_message'
    };
    
    const response = await slackAdapter.processMessage(testMessage);
    
    expect(response).toBeDefined();
    expect(response.content).toBeDefined();
    expect(response.type).toBe('text');
  });
  
  test('should handle command messages correctly', async () => {
    const testMessage: Message = {
      content: 'help',
      userId: 'U123456',
      username: 'testuser',
      channel: 'C123456',
      timestamp: new Date(),
      type: 'command',
      metadata: {
        command: 'search'
      }
    };
    
    const response = await slackAdapter.processMessage(testMessage);
    
    expect(response).toBeDefined();
    expect(response.type).toBe('text');
  });
  
  // Test para formatear respuestas
  test('should format responses correctly', () => {
    const botResponse: BotResponse = {
      content: 'Test response',
      type: 'text',
      metadata: {
        source: 'test-source',
        confidence: 0.95
      }
    };
    
    // @ts-ignore - accediendo a método privado para pruebas
    const formattedResponse = (slackAdapter as any).formatResponse(botResponse);
    
    expect(formattedResponse).toBeDefined();
    expect(formattedResponse.blocks).toBeDefined();
    expect(formattedResponse.blocks.length).toBeGreaterThan(0);
    expect(formattedResponse.blocks[0].text.text).toBe('Test response');
  });
}); 