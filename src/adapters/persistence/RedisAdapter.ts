import { createClient, RedisClientType, RedisDefaultModules, RedisModules, RedisFunctions, RedisScripts } from 'redis';
import { ConversationContext } from '../../application/use-cases/ManageConversationContextUseCase';

export class RedisAdapter {
  constructor(
    private readonly client: RedisClientType<RedisDefaultModules & RedisModules, RedisFunctions, RedisScripts>
  ) {}

  async saveContext(channelId: string, context: ConversationContext): Promise<void> {
    try {
      await this.client.set(
        `context:${channelId}`,
        JSON.stringify(context),
        {
          EX: 1800 // 30 minutos de expiración
        }
      );
    } catch (error) {
      console.error('Error saving context to Redis:', error);
      throw error;
    }
  }

  async getContext(channelId: string): Promise<ConversationContext | null> {
    try {
      const data = await this.client.get(`context:${channelId}`);
      if (!data) return null;

      const context = JSON.parse(data);
      // Convertir las fechas de string a Date
      context.metadata.startTime = new Date(context.metadata.startTime);
      context.metadata.lastUpdateTime = new Date(context.metadata.lastUpdateTime);
      context.lastMessages = context.lastMessages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));

      return context;
    } catch (error) {
      console.error('Error getting context from Redis:', error);
      throw error;
    }
  }

  async deleteContext(channelId: string): Promise<void> {
    try {
      await this.client.del(`context:${channelId}`);
    } catch (error) {
      console.error('Error deleting context from Redis:', error);
      throw error;
    }
  }

  async cacheSearchResults(query: string, results: any[], ttlSeconds: number = 300): Promise<void> {
    try {
      await this.client.set(
        `search:${query}`,
        JSON.stringify(results),
        {
          EX: ttlSeconds
        }
      );
    } catch (error) {
      console.error('Error caching search results in Redis:', error);
      throw error;
    }
  }

  async getCachedSearchResults(query: string): Promise<any[] | null> {
    try {
      const data = await this.client.get(`search:${query}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting cached search results from Redis:', error);
      throw error;
    }
  }
} 