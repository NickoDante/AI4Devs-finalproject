import { MongoDBAdapter } from '../../adapters/persistence/MongoDBAdapter';
import { LlamaAdapter } from '../../adapters/llm/LlamaAdapter';
import { SlackAdapter } from '../../adapters/slack/SlackAdapter';
import { RedisAdapter } from '../../adapters/cache/RedisAdapter';
import { ConfluenceAdapter } from '../../adapters/confluence/ConfluenceAdapter';
import { PDFAdapter } from '../../adapters/pdf/PDFAdapter';
import { ProcessMessageUseCase } from '../../application/use-cases/message/ProcessMessageUseCase';
import { ProcessSummaryUseCase } from '../../application/use-cases/summary/ProcessSummaryUseCase';
import { ProcessFeedbackUseCase } from '../../application/use-cases/feedback/ProcessFeedbackUseCase';
import { ProcessEmbeddingsUseCase } from '../../application/use-cases/embeddings/ProcessEmbeddingsUseCase';
import { MessagePort } from '../../domain/ports/MessagePort';
import { AIAdapter } from '../../domain/ports/AIAdapter';
import { PersistencePort } from '../../domain/ports/PersistencePort';
import { CachePort } from '../../domain/ports/CachePort';
import { KnowledgePort } from '../../domain/ports/KnowledgePort';
import { PDFPort } from '../../domain/ports/PDFPort';
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
        knowledge: KnowledgePort;
        pdf: PDFPort;
        logger: Logger;
    };

    private useCases: {
        processMessage: ProcessMessageUseCase;
        processSummary: ProcessSummaryUseCase;
        processFeedback: ProcessFeedbackUseCase;
        processEmbeddings: ProcessEmbeddingsUseCase;
    };

    private constructor() {
        this.services = {
            persistence: {} as PersistencePort,
            ai: {} as AIAdapter,
            messaging: {} as MessagePort,
            cache: {} as CachePort,
            knowledge: {} as KnowledgePort,
            pdf: {} as PDFPort,
            logger: logger
        };

        this.useCases = {
            processMessage: {} as ProcessMessageUseCase,
            processSummary: {} as ProcessSummaryUseCase,
            processFeedback: {} as ProcessFeedbackUseCase,
            processEmbeddings: {} as ProcessEmbeddingsUseCase
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
        llamaModelPath?: string;
        slackPort?: number;
    } = {}): Promise<void> {
        try {
            this.services.logger.info('🚀 Iniciando contenedor de dependencias...');

            // Inicializar Redis
            if (config.redisConfig) {
                const redisConnection = await RedisConnectionFactory.createConnection(config.redisConfig, this.services.logger);
                this.services.cache = new RedisAdapter(redisConnection, this.services.logger);
            }

            // Inicializar adaptadores
            this.services.persistence = new MongoDBAdapter(config.mongoUri || 'mongodb://localhost:27017/theguardian', this.services.logger);
            
            // Conectar a MongoDB
            await this.services.persistence.connect();
            this.services.logger.info('💾 MongoDB conectado exitosamente');
            
            this.services.ai = new LlamaAdapter();
            this.services.messaging = new SlackAdapter(this.services.logger, this.services.cache);
            this.services.knowledge = new ConfluenceAdapter(this.services.logger);
            this.services.pdf = new PDFAdapter(this.services.logger);

            // Inicializar casos de uso
            this.useCases.processMessage = new ProcessMessageUseCase(
                this.services.messaging,
                this.services.ai,
                this.services.persistence,
                this.services.cache,
                this.services.knowledge,
                this.services.logger
            );

            this.useCases.processSummary = new ProcessSummaryUseCase(
                this.services.pdf,
                this.services.ai,
                this.services.cache,
                this.services.logger,
                this.services.knowledge
            );

            this.useCases.processFeedback = new ProcessFeedbackUseCase(
                this.services.persistence,
                this.services.logger
            );

            this.useCases.processEmbeddings = new ProcessEmbeddingsUseCase(
                this.services.ai,
                this.services.cache,
                this.services.logger
            );

            // Iniciar servicios que requieren conexión
            await this.services.messaging.start(config.slackPort || 3000);
            this.services.logger.info('⚡️ Servicio de mensajería inicializado');

            // Verificar conexiones
            await this.checkConnections();

            this.services.logger.info('✅ Contenedor de dependencias inicializado correctamente');
        } catch (error) {
            this.services.logger.error('❌ Error durante la inicialización:', error);
            throw error;
        }
    }

    private async checkConnections(): Promise<void> {
        try {
            // Verificar MongoDB
            if ('healthCheck' in this.services.persistence) {
                const mongoHealth = await (this.services.persistence as MongoDBAdapter).healthCheck();
                this.services.logger.info('💾 MongoDB health check:', mongoHealth ? '✅' : '❌');
            }

            // Verificar Confluence
            try {
                await this.services.knowledge.searchKnowledge('test');
                this.services.logger.info('📚 Confluence health check: ✅');
            } catch (error) {
                this.services.logger.error('❌ Error en health check de Confluence:', error);
            }

            // No necesitamos verificar Slack porque ya se verifica en el start()
            this.services.logger.info('🤖 Slack está listo para recibir mensajes');

        } catch (error) {
            this.services.logger.error('❌ Error en health check:', error);
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

    getKnowledgeAdapter(): KnowledgePort {
        return this.services.knowledge;
    }

    getPDFAdapter(): PDFPort {
        return this.services.pdf;
    }

    getLogger(): Logger {
        return this.services.logger;
    }

    getProcessMessageUseCase(): ProcessMessageUseCase {
        return this.useCases.processMessage;
    }

    getProcessSummaryUseCase(): ProcessSummaryUseCase {
        return this.useCases.processSummary;
    }

    getProcessFeedbackUseCase(): ProcessFeedbackUseCase {
        return this.useCases.processFeedback;
    }

    getProcessEmbeddingsUseCase(): ProcessEmbeddingsUseCase {
        return this.useCases.processEmbeddings;
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