import { RedisConnectionFactory, RedisConfig } from '../infrastructure/cache/RedisConnectionFactory';
import { RedisAdapter } from '../adapters/cache/RedisAdapter';
import { createLogger, format, transports } from 'winston';
import { ConversationContext } from '../application/use-cases/ManageConversationContextUseCase';
import { Message } from '../domain/models/Message';

async function testRedisAdapter() {
    // Configurar el logger
    const logger = createLogger({
        level: 'debug',
        format: format.combine(
            format.timestamp(),
            format.json()
        ),
        transports: [
            new transports.Console()
        ]
    });

    // Configuración de Redis
    const redisConfig: RedisConfig = {
        host: 'localhost',
        port: 6379,
        db: 0
    };

    try {
        // Crear conexión Redis
        logger.info('Conectando a Redis...');
        const redis = await RedisConnectionFactory.createConnection(redisConfig, logger);
        const redisAdapter = new RedisAdapter(redis, logger);

        // Verificar conexión
        logger.info('Verificando conexión...');
        const isHealthy = await redisAdapter.healthCheck();
        console.log('Health check:', isHealthy);

        // Probar operaciones básicas
        logger.info('Probando operaciones básicas...');
        await redisAdapter.set('test-key', { message: 'Hola mundo!' });
        const value = await redisAdapter.get('test-key');
        console.log('Valor recuperado:', value);

        // Probar TTL
        const ttl = await redisAdapter.getTTL('test-key');
        console.log('TTL:', ttl);

        // Probar listas
        logger.info('Probando operaciones con listas...');
        await redisAdapter.pushToList('test-list', 
            { id: 1, text: 'Primer elemento' },
            { id: 2, text: 'Segundo elemento' },
            { id: 3, text: 'Tercer elemento' }
        );
        const lista = await redisAdapter.getList('test-list');
        console.log('Lista recuperada:', lista);

        // Probar hashes
        logger.info('Probando operaciones con hashes...');
        await redisAdapter.setHash('test-hash', {
            nombre: 'Juan',
            edad: 30,
            roles: ['admin', 'user'],
            metadata: { lastLogin: new Date() }
        });
        const hash = await redisAdapter.getHash('test-hash');
        console.log('Hash recuperado:', hash);

        // Probar contexto de conversación
        logger.info('Probando contexto de conversación...');
        const mockMessage: Message = {
            content: 'Hola bot, necesito ayuda',
            userId: 'user123',
            username: 'Juan',
            channel: 'general',
            timestamp: new Date(),
            type: 'direct_message',
            metadata: {
                command: 'question',
                source: 'slack'
            }
        };

        const mockContext: ConversationContext = {
            lastMessages: [mockMessage],
            metadata: {
                topic: 'ayuda',
                startTime: new Date(),
                lastUpdateTime: new Date(),
                messageCount: 1,
                activeCommands: ['help']
            }
        };

        await redisAdapter.setConversationContext('user123', mockContext);
        const context = await redisAdapter.getConversationContext('user123');
        console.log('Contexto recuperado:', context);

        // Probar limpieza
        logger.info('Probando limpieza de caché...');
        await redisAdapter.clear('test');
        const exists = await redisAdapter.exists('test-key');
        console.log('¿La clave aún existe?:', exists);

        // Cerrar conexión
        await RedisConnectionFactory.closeConnection();
        logger.info('Pruebas completadas exitosamente');

    } catch (error) {
        logger.error('Error durante las pruebas:', error);
    }
}

// Ejecutar las pruebas
testRedisAdapter().catch(console.error); 