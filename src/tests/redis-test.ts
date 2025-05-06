import Redis from 'ioredis';
import { RedisAdapter } from '../adapters/cache/RedisAdapter';
import { createLogger } from '../infrastructure/logger';
import { ConversationContext } from '../domain/ports/CachePort';

const logger = createLogger('redis-test');
const redis = new Redis();
        const redisAdapter = new RedisAdapter(redis, logger);

async function testRedis() {
  try {
    // Test básico de set/get
    await redisAdapter.set('test:key', { foo: 'bar' });
    const value = await redisAdapter.get('test:key');
    console.log('Value from Redis:', value);

    // Test de contexto de conversación
    const context: ConversationContext = {
      userId: 'U123456',
      conversationId: 'conv_123456',
      messages: [
        {
          role: 'user',
          content: 'Hola',
          timestamp: new Date()
        },
        {
          role: 'assistant',
          content: '¡Hola! ¿En qué puedo ayudarte?',
          timestamp: new Date()
        }
      ],
            metadata: {
        lastInteraction: new Date(),
        topicId: 'general'
            }
        };

    // Guardar contexto
    await redisAdapter.saveConversationContext(context);
    
    // Recuperar contexto
    const savedContext = await redisAdapter.getConversationContext(context.userId, context.conversationId);
    console.log('Saved context:', savedContext);

    // Limpiar prueba
    await redisAdapter.removeConversationContext(context.userId, context.conversationId);
    
    console.log('Redis test completed successfully!');
    } catch (error) {
    console.error('Redis test failed:', error);
  } finally {
    redis.disconnect();
    }
}

testRedis(); 