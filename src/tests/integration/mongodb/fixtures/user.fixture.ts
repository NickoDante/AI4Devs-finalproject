import { User } from '../../../../domain/models/User';
import { ObjectId } from 'mongodb';

/**
 * Genera un usuario de prueba con valores predeterminados
 */
export function createTestUser(overrides: Partial<User> = {}): User {
  return {
    userId: `user_${Date.now()}`,
    username: 'testuser',
    email: 'test@example.com',
    realName: 'Test User',
    role: 'developer',
    isAdmin: false,
    language: 'es',
    permissions: ['read', 'write'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  };
}

/**
 * Genera varios usuarios de prueba
 */
export function createTestUsers(count: number): User[] {
  return Array.from({ length: count }).map((_, index) => {
    return createTestUser({
      userId: `user_${index}`,
      username: `testuser${index}`,
      email: `test${index}@example.com`
    });
  });
} 