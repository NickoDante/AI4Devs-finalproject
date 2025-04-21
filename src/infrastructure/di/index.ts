import { MongoDBAdapter } from '../../adapters/persistence/MongoDBAdapter';
import { OpenAIAdapter } from '../../adapters/llm/OpenAIAdapter';
import { SlackAdapter } from '../../adapters/slack/SlackAdapter';
import { RedisAdapter } from '../../adapters/cache/RedisAdapter';
import { ProcessMessageUseCase } from '../../application/use-cases/ProcessMessageUseCase';
import { MessagePort } from '../../domain/ports/MessagePort';
import { AIAdapter } from '../../domain/ports/AIAdapter';
import { PersistencePort } from '../../domain/ports/PersistencePort';
import { CachePort } from '../../domain/ports/CachePort';
import { RedisConnectionFactory, RedisConfig } from '../cache/RedisConnectionFactory';
import logger from '../logging/Logger';
import { Logger } from 'winston';

export interface AppConfig {
    redis: {
        host: string;
        port: number;
        password?: string;
        db?: number;
    };
}

export class DependencyContainer {
    private static instance: DependencyContainer;
    
    private services: {
        persistence: PersistencePort;
        ai: AIAdapter;
        messaging: MessagePort;
        cache: CachePort;
        logger: Logger;
    };

    private useCases: {
        processMessage: ProcessMessageUseCase;
    };

    private constructor() {
        this.services = {
            persistence: {} as PersistencePort,
            ai: {} as AIAdapter,
            messaging: {} as MessagePort,
            cache: {} as CachePort,
            logger: logger
        };

        this.useCases = {
            processMessage: {} as ProcessMessageUseCase
        };
    }

    public static getInstance(): DependencyContainer {
        if (!DependencyContainer.instance) {
            DependencyContainer.instance = new DependencyContainer();
        }
        return DependencyContainer.instance;
    }

    async initialize(config: {
        mongoUri?: string;
        redisConfig?: RedisConfig;
        openAiKey?: string;
        slackPort?: number;
    } = {}): Promise<void> {
        try {
            console.log('🚀 Iniciando contenedor de dependencias...');

            // Inicializar Redis
            if (config.redisConfig) {
                const redisConnection = await RedisConnectionFactory.createConnection(config.redisConfig, this.services.logger);
                this.services.cache = new RedisAdapter(redisConnection, this.services.logger);
            }

            // Inicializar adaptadores
            this.services.persistence = new MongoDBAdapter(config.mongoUri || 'mongodb://localhost:27017/theguardian', this.services.logger);
            this.services.ai = new OpenAIAdapter(config.openAiKey);
            this.services.messaging = new SlackAdapter(this.services.logger, this.services.cache);

            // Inicializar casos de uso
            this.useCases.processMessage = new ProcessMessageUseCase(
                this.services.messaging,
                this.services.ai,
                this.services.persistence,
                this.services.cache,
                this.services.logger
            );

            // Iniciar servicios que requieren conexión
            await this.services.messaging.start(config.slackPort || 3000);
            console.log('⚡️ Servicio de mensajería inicializado');

            // Verificar conexiones
            await this.checkConnections();

            console.log('✅ Contenedor de dependencias inicializado correctamente');
        } catch (error) {
            console.error('❌ Error durante la inicialización:', error);
            throw error;
        }
    }

    private async checkConnections(): Promise<void> {
        try {
            // Verificar MongoDB
            if ('healthCheck' in this.services.persistence) {
                const mongoHealth = await (this.services.persistence as MongoDBAdapter).healthCheck();
                console.log('💾 MongoDB health check:', mongoHealth ? '✅' : '❌');
            }

            // No necesitamos verificar Slack porque ya se verifica en el start()
            console.log('🤖 Slack está listo para recibir mensajes');

        } catch (error) {
            console.error('❌ Error en health check:', error);
            throw error;
        }
    }

    // Getters para acceder a los servicios
    getPersistenceAdapter(): PersistencePort {
        return this.services.persistence;
    }

    getAIAdapter(): AIAdapter {
        return this.services.ai;
    }

    getMessageAdapter(): MessagePort {
        return this.services.messaging;
    }

    getCacheAdapter(): CachePort {
        return this.services.cache;
    }

    getLogger(): Logger {
        return this.services.logger;
    }

    getProcessMessageUseCase(): ProcessMessageUseCase {
        return this.useCases.processMessage;
    }
}

// Exportar una instancia única del contenedor
export const container = DependencyContainer.getInstance();

export async function initializeContainer(config: AppConfig): Promise<DependencyContainer> {
    const redisConfig: RedisConfig = {
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
        db: config.redis.db || 0
    };

    const instance = DependencyContainer.getInstance();
    await instance.initialize({ redisConfig });
    return instance;
} 