import { ConversationContext } from '../../../../application/use-cases/ManageConversationContextUseCase';
import { Message } from '../../../../domain/models/Message';
import { createTestMessage } from '../../mongodb/fixtures/message.fixture';

/**
 * Genera un contexto de conversación de prueba con valores predeterminados
 */
export function createTestContext(overrides: Partial<ConversationContext> = {}): ConversationContext {
  const defaultMessages: Message[] = Array.from({ length: 3 }).map((_, index) => {
    return createTestMessage({
      content: `Test message ${index}`,
      timestamp: new Date(Date.now() - index * 60000) // Cada mensaje es 1 minuto más antiguo
    });
  });

  return {
    lastMessages: defaultMessages,
    metadata: {
      topic: 'test',
      startTime: new Date(Date.now() - 3600000), // 1 hora atrás
      lastUpdateTime: new Date(),
      messageCount: defaultMessages.length,
      activeCommands: []
    },
    ...overrides
  };
}

/**
 * Genera un valor personalizado para pruebas de caché
 */
export function createTestCacheValue(key: string = 'test'): any {
  return {
    key,
    value: `Value for ${key}`,
    timestamp: new Date(),
    isTest: true,
    counter: Math.floor(Math.random() * 1000)
  };
}

/**
 * Genera un hash de prueba para Redis
 */
export function createTestHash(prefix: string = 'test'): Record<string, any> {
  return {
    [`${prefix}_string`]: `value_${Date.now()}`,
    [`${prefix}_number`]: Math.random() * 100,
    [`${prefix}_boolean`]: true,
    [`${prefix}_object`]: { name: 'Test Object', id: Date.now() },
    [`${prefix}_array`]: [1, 2, 3, 'test']
  };
}

/**
 * Genera valores de prueba para listas en Redis
 */
export function createTestListValues(count: number = 5): any[] {
  return Array.from({ length: count }).map((_, index) => {
    return {
      id: `item_${index}`,
      value: `Test value ${index}`,
      timestamp: new Date(Date.now() - index * 60000),
      metadata: {
        position: index,
        isTest: true
      }
    };
  });
} 