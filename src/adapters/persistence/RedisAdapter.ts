import { createClient, RedisClientType } from 'redis';
import { CachePort } from '../../domain/ports/CachePort';
import { ConversationContext } from '../../application/use-cases/ManageConversationContextUseCase';

export class RedisAdapter implements CachePort {
  private client: RedisClientType;

  constructor(redisUrl?: string) {
    this.client = createClient({
      url: redisUrl || process.env.REDIS_URL || 'redis://localhost:6379'
    });

    this.client.on('error', (err: Error) => console.error('Redis Client Error:', err));
  }

  async saveContext(channelId: string, context: ConversationContext): Promise<void> {
    try {
      await this.ensureConnection();
      await this.client.set(
        `context:${channelId}`,
        JSON.stringify(context),
        {
          EX: 1800 // 30 minutos de expiración
        }
      );
    } catch (error) {
      console.error('Error al guardar contexto en Redis:', error);
      throw error;
    }
  }

  async getContext(channelId: string): Promise<ConversationContext | null> {
    try {
      await this.ensureConnection();
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
      console.error('Error al obtener contexto de Redis:', error);
      throw error;
    }
  }

  async deleteContext(channelId: string): Promise<void> {
    try {
      await this.ensureConnection();
      await this.client.del(`context:${channelId}`);
    } catch (error) {
      console.error('Error al eliminar contexto de Redis:', error);
      throw error;
    }
  }

  async cacheSearchResults(query: string, results: any[], ttlSeconds: number = 300): Promise<void> {
    try {
      await this.ensureConnection();
      await this.client.set(
        `search:${query}`,
        JSON.stringify(results),
        {
          EX: ttlSeconds
        }
      );
    } catch (error) {
      console.error('Error al cachear resultados de búsqueda en Redis:', error);
      throw error;
    }
  }

  async getCachedSearchResults(query: string): Promise<any[] | null> {
    try {
      await this.ensureConnection();
      const data = await this.client.get(`search:${query}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error al obtener resultados cacheados de Redis:', error);
      throw error;
    }
  }

  private async ensureConnection(): Promise<void> {
    if (!this.client.isOpen) {
      await this.client.connect();
    }
  }
} 