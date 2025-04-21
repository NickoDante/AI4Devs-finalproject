import { MongoDBAdapter } from '../../adapters/persistence/MongoDBAdapter';
import { OpenAIAdapter } from '../../adapters/llm/OpenAIAdapter';
import { SlackAdapter } from '../../adapters/slack/SlackAdapter';
import { RedisAdapter } from '../../adapters/persistence/RedisAdapter';
import { ProcessMessageUseCase } from '../../application/use-cases/ProcessMessageUseCase';
import { MessagePort } from '../../domain/ports/MessagePort';
import { AIAdapter } from '../../domain/ports/AIAdapter';
import { PersistencePort } from '../../domain/ports/PersistencePort';
import { CachePort } from '../../domain/ports/CachePort';

export class Container {
  private static instance: Container;
  
  private services: {
    persistence: PersistencePort;
    ai: AIAdapter;
    messaging: MessagePort;
    cache: CachePort;
  };

  private useCases: {
    processMessage: ProcessMessageUseCase;
  };

  private constructor() {
    // Inicializar servicios con valores null
    this.services = {
      persistence: {} as PersistencePort,
      ai: {} as AIAdapter,
      messaging: {} as MessagePort,
      cache: {} as CachePort
    };

    this.useCases = {
      processMessage: {} as ProcessMessageUseCase
    };
  }

  public static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  async initialize(config: {
    mongoUri?: string;
    redisUrl?: string;
    openAiKey?: string;
    slackPort?: number;
  } = {}): Promise<void> {
    try {
      console.log('🚀 Iniciando contenedor de dependencias...');

      // Inicializar adaptadores
      this.services.persistence = new MongoDBAdapter(config.mongoUri);
      this.services.cache = new RedisAdapter(config.redisUrl);
      this.services.ai = new OpenAIAdapter(config.openAiKey);
      this.services.messaging = new SlackAdapter();

      // Inicializar casos de uso
      this.useCases.processMessage = new ProcessMessageUseCase(
        this.services.messaging,
        this.services.ai,
        this.services.persistence,
        this.services.cache
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

  getProcessMessageUseCase(): ProcessMessageUseCase {
    return this.useCases.processMessage;
  }
}

// Exportar una instancia única del contenedor
export const container = Container.getInstance(); 