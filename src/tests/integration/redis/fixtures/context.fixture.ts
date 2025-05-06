import { ConversationContext } from '../../../../domain/ports/CachePort';
import { Message } from '../../../../domain/models/Message';
import { createTestMessage } from '../../mongodb/fixtures/message.fixture';

/**
 * Genera un contexto de conversación de prueba con valores predeterminados
 */
export function createTestContext(overrides: Partial<ConversationContext> = {}): ConversationContext {
  const defaultMessages = Array.from({ length: 3 }).map((_, index) => {
    const role = index === 0 ? 'system' : index % 2 === 0 ? 'assistant' : 'user';
    return {
      role: role as 'system' | 'user' | 'assistant',
      content: `Test message ${index}`,
      timestamp: new Date(Date.now() - index * 60000) // Cada mensaje es 1 minuto más antiguo
    };
  });

  return {
    userId: `user_${Date.now()}`,
    conversationId: `conv_${Date.now()}`,
    messages: defaultMessages,
    metadata: {
      topicId: 'test',
      lastInteraction: new Date(),
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

export const mockContext: ConversationContext = {
  userId: 'U123456',
  conversationId: 'conv_123456',
  messages: [
    {
      role: 'system',
      content: 'Eres un asistente útil y servicial.',
      timestamp: new Date('2025-05-01T10:00:00Z')
    },
    {
      role: 'user',
      content: '¿Cómo solicito vacaciones?',
      timestamp: new Date('2025-05-01T10:01:00Z')
    },
    {
      role: 'assistant',
      content: 'Para solicitar vacaciones, debes seguir estos pasos...',
      timestamp: new Date('2025-05-01T10:01:30Z')
    }
  ],
  metadata: {
    lastInteraction: new Date('2025-05-01T10:01:30Z'),
    topicId: 'topic_123456'
  }
}; 