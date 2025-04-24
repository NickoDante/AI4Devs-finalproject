import { RedisConfig } from '../infrastructure/cache/RedisConnectionFactory';
import { slackConfig, validateSlackConfig } from './slack.config';

export interface AppConfig {
  // MongoDB
  mongoDbUri: string;
  
  // Redis
  redis: RedisConfig;
  
  // OpenAI
  openAiApiKey?: string;
  
  // Slack
  slackPort: number;
  slack: typeof slackConfig;
  
  // Logging
  logLevel: string;
}

const appConfig: AppConfig = {
  // MongoDB
  mongoDbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/theguardian',
  
  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0')
  },
  
  // OpenAI
  openAiApiKey: process.env.OPENAI_API_KEY,
  
  // Slack
  slackPort: parseInt(process.env.SLACK_PORT || '3001'),
  slack: slackConfig,
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info'
};

// Función para validar la configuración
export const validateConfig = (): void => {
  // Validar MongoDB
  if (!appConfig.mongoDbUri) {
    throw new Error('MONGODB_URI no está configurado');
  }
  
  // Validar Redis (opcional, dependiendo de requisitos)
  
  // Validar OpenAI (opcional, dependiendo de requisitos)
  if (!appConfig.openAiApiKey) {
    console.warn('OPENAI_API_KEY no está configurado. Algunas funcionalidades de IA podrían no estar disponibles.');
  }
  
  // Validar Slack
  validateSlackConfig();
};

export default appConfig; 