import { RedisAdapter } from '../../../adapters/cache/RedisAdapter';
import { createLogger, format, transports } from 'winston';
import { createTestContext, createTestCacheValue, createTestHash, createTestListValues } from './fixtures/context.fixture';

// Mock de ioredis
jest.mock('ioredis', () => {
  // Mock para la clase Redis
  return {
    Redis: jest.fn().mockImplementation(() => {
      return {
        ping: jest.fn().mockResolvedValue('PONG'),
        setex: jest.fn().mockResolvedValue('OK'),
        set: jest.fn().mockResolvedValue('OK'),
        get: jest.fn(),
        del: jest.fn().mockResolvedValue(1),
        exists: jest.fn(),
        keys: jest.fn(),
        ttl: jest.fn(),
        expire: jest.fn(),
        rpush: jest.fn(),
        lrange: jest.fn(),
        hmset: jest.fn(),
        hgetall: jest.fn()
      };
    })
  };
});

describe('RedisAdapter Integration Tests', () => {
  let redisAdapter: RedisAdapter;
  let redisMock: any;
  let logger: any;

  beforeAll(() => {
    // Configurar el logger
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
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Acceder directamente al constructor mock
    const Redis = require('ioredis').Redis;
    redisMock = new Redis();
    
    // Crear el adaptador de Redis con el mock
    redisAdapter = new RedisAdapter(redisMock, logger);
  });

  // Tests para la conexión y health check
  describe('Connection Tests', () => {
    it('should check health successfully', async () => {
      // Mock para la respuesta de ping ya configurado en el mock principal
      const isHealthy = await redisAdapter.healthCheck();
      expect(isHealthy).toBe(true);
      expect(redisMock.ping).toHaveBeenCalled();
    });

    it('should return false on health check failure', async () => {
      // Sobrescribir el mock para este test específico
      redisMock.ping.mockRejectedValueOnce(new Error('Connection failed'));

      const isHealthy = await redisAdapter.healthCheck();
      expect(isHealthy).toBe(false);
    });
  });

  // Tests para operaciones básicas
  describe('Basic Operations', () => {
    it('should set and get a value', async () => {
      const key = 'test:key';
      const value = createTestCacheValue(key);
      const serializedValue = JSON.stringify(value);

      // Configurar el mock para get
      redisMock.get.mockResolvedValueOnce(serializedValue);

      await redisAdapter.set(key, value);
      const retrievedValue = await redisAdapter.get(key);

      // Convertir a cadena y luego volver a parsear para comparar correctamente
      // ya que Redis serializa las fechas como strings
      const valueAsString = JSON.parse(JSON.stringify(value));
      
      expect(retrievedValue).toEqual(valueAsString);
      expect(redisMock.setex).toHaveBeenCalled();
      expect(redisMock.get).toHaveBeenCalled();
    });

    it('should delete a value', async () => {
      const key = 'test:key';
      
      await redisAdapter.delete(key);
      
      expect(redisMock.del).toHaveBeenCalled();
    });

    it('should check if a key exists', async () => {
      const key = 'test:key';
      
      // Mock para exists
      redisMock.exists.mockResolvedValueOnce(1);

      const exists = await redisAdapter.exists(key);
      
      expect(exists).toBe(true);
      expect(redisMock.exists).toHaveBeenCalled();
    });

    it('should clear all keys or a namespace', async () => {
      // Mock para keys
      redisMock.keys.mockResolvedValueOnce(['tg:test:key1', 'tg:test:key2']);
      
      await redisAdapter.clear('test');
      
      expect(redisMock.keys).toHaveBeenCalled();
      expect(redisMock.del).toHaveBeenCalled();
    });
  });

  // Tests para operaciones de TTL
  describe('TTL Operations', () => {
    it('should get TTL for a key', async () => {
      const key = 'test:key';
      
      // Mock para ttl
      redisMock.ttl.mockResolvedValueOnce(3600);

      const ttl = await redisAdapter.getTTL(key);
      
      expect(ttl).toBe(3600);
      expect(redisMock.ttl).toHaveBeenCalled();
    });

    it('should update TTL for a key', async () => {
      const key = 'test:key';
      const newTtl = 7200;
      
      // Mock para expire
      redisMock.expire.mockResolvedValueOnce(1);

      await redisAdapter.updateTTL(key, newTtl);
      
      expect(redisMock.expire).toHaveBeenCalled();
    });
  });

  // Tests para operaciones de listas
  describe('List Operations', () => {
    it('should push values to a list', async () => {
      const key = 'test:list';
      const values = createTestListValues(3);
      
      // Mock para rpush
      redisMock.rpush.mockResolvedValueOnce(3);

      const length = await redisAdapter.pushToList(key, ...values);
      
      expect(length).toBe(3);
      expect(redisMock.rpush).toHaveBeenCalled();
    });

    it('should get values from a list', async () => {
      const key = 'test:list';
      const values = createTestListValues(3);
      const serializedValues = values.map(v => JSON.stringify(v));
      
      // Mock para lrange
      redisMock.lrange.mockResolvedValueOnce(serializedValues);

      const retrievedValues = await redisAdapter.getList(key);
      
      // Serializar y deserializar para comparación correcta de fechas
      const valuesAsString = JSON.parse(JSON.stringify(values));
      
      expect(retrievedValues).toEqual(valuesAsString);
      expect(redisMock.lrange).toHaveBeenCalled();
    });
  });

  // Tests para operaciones de hash
  describe('Hash Operations', () => {
    it('should set a hash', async () => {
      const key = 'test:hash';
      const hash = createTestHash();
      
      // Mock para hmset
      redisMock.hmset.mockResolvedValueOnce('OK');

      await redisAdapter.setHash(key, hash);
      
      expect(redisMock.hmset).toHaveBeenCalled();
    });

    it('should get a hash', async () => {
      const key = 'test:hash';
      const hash = createTestHash();
      
      // Serializar los valores como lo haría Redis
      const serializedHash = Object.entries(hash).reduce((acc, [field, value]) => {
        acc[field] = JSON.stringify(value);
        return acc;
      }, {} as Record<string, string>);
      
      // Mock para hgetall
      redisMock.hgetall.mockResolvedValueOnce(serializedHash);

      const retrievedHash = await redisAdapter.getHash(key);
      
      expect(retrievedHash).toEqual(hash);
      expect(redisMock.hgetall).toHaveBeenCalled();
    });
  });

  // Tests para manejo de contexto
  describe('Conversation Context', () => {
    it('should save and retrieve conversation context', async () => {
      const userId = 'user123';
      const context = createTestContext();
      const serializedContext = JSON.stringify(context);
      
      // Mock para get
      redisMock.get.mockResolvedValueOnce(serializedContext);

      await redisAdapter.setConversationContext(userId, context);
      const retrievedContext = await redisAdapter.getConversationContext(userId);
      
      // Serializar y deserializar para comparación correcta de fechas
      const contextAsString = JSON.parse(JSON.stringify(context));
      
      expect(retrievedContext).toEqual(contextAsString);
    });

    it('should return null for non-existent context', async () => {
      const userId = 'nonexistent';
      
      // Mock para get retornando null
      redisMock.get.mockResolvedValueOnce(null);

      const context = await redisAdapter.getConversationContext(userId);
      
      expect(context).toBeNull();
    });
  });
}); 