import { MongoDBAdapter } from '../../adapters/persistence/MongoDBAdapter';
import { OpenAIAdapter } from '../../adapters/llm/OpenAIAdapter';
import { SlackAdapter } from '../../adapters/slack/SlackAdapter';
import { ProcessMessageUseCase } from '../../application/use-cases/ProcessMessageUseCase';

export class Container {
  private services = {
    mongodb: null as MongoDBAdapter | null,
    openai: null as OpenAIAdapter | null,
    slack: null as SlackAdapter | null
  };

  private useCases = {
    processMessage: null as ProcessMessageUseCase | null
  };

  async initialize(): Promise<void> {
    // Inicializar adaptadores
    this.services.mongodb = new MongoDBAdapter();
    this.services.openai = new OpenAIAdapter();
    this.services.slack = new SlackAdapter();

    // Inicializar casos de uso
    this.useCases.processMessage = new ProcessMessageUseCase(
      this.services.slack,
      this.services.openai
    );

    // Iniciar servicios
    await this.services.mongodb.start(0);
    await this.services.slack.start(Number(process.env.PORT) || 3000);
  }

  getProcessMessageUseCase(): ProcessMessageUseCase {
    if (!this.useCases.processMessage) {
      throw new Error('Container not initialized');
    }
    return this.useCases.processMessage;
  }

  getSlackAdapter(): SlackAdapter {
    if (!this.services.slack) {
      throw new Error('Container not initialized');
    }
    return this.services.slack;
  }

  getMongoDBAdapter(): MongoDBAdapter {
    if (!this.services.mongodb) {
      throw new Error('Container not initialized');
    }
    return this.services.mongodb;
  }

  getOpenAIAdapter(): OpenAIAdapter {
    if (!this.services.openai) {
      throw new Error('Container not initialized');
    }
    return this.services.openai;
  }
}

export const container = new Container(); 