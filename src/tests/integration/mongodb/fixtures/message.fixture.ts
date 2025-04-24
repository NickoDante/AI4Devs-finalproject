import { Message } from '../../../../domain/models/Message';
import { ObjectId } from 'mongodb';

/**
 * Genera un mensaje de prueba con valores predeterminados
 */
export function createTestMessage(overrides: Partial<Message> = {}): Message {
  return {
    content: 'Test message content',
    userId: 'user_test',
    username: 'testuser',
    channel: 'C12345',
    timestamp: new Date(),
    type: 'direct_message',
    ...overrides
  };
}

/**
 * Genera varios mensajes de prueba
 */
export function createTestMessages(count: number, userId: string = 'user_test', channel: string = 'C12345'): Message[] {
  return Array.from({ length: count }).map((_, index) => {
    return createTestMessage({
      content: `Test message ${index}`,
      userId,
      channel,
      timestamp: new Date(Date.now() - index * 60000) // Cada mensaje es 1 minuto más antiguo
    });
  });
} 