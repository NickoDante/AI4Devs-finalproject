import { MongoClient, Db } from 'mongodb';
import { MessagePort } from '../../domain/ports/MessagePort';
import { Message } from '../../domain/models/Message';
import { BotResponse } from '../../domain/models/BotResponse';

export class MongoDBAdapter implements MessagePort {
  private client: MongoClient;
  private db: Db | null = null;

  constructor() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tg-guardian';
    this.client = new MongoClient(uri);
  }

  async processMessage(message: Message): Promise<BotResponse> {
    try {
      await this.saveMessage(message);
      return {
        content: 'Mensaje guardado correctamente',
        type: 'text'
      };
    } catch (error) {
      console.error('Error processing message with MongoDB:', error);
      return {
        content: 'Error al guardar el mensaje',
        type: 'error',
        metadata: {
          error: error instanceof Error ? error.message : 'Error desconocido'
        }
      };
    }
  }

  private async saveMessage(message: Message): Promise<void> {
    await this.ensureConnection();
    const db = this.db!;
    
    await db.collection<Message>('messages').insertOne({
      ...message,
      timestamp: new Date()
    });
  }

  async sendMessage(channel: string, text: string): Promise<void> {
    await this.ensureConnection();
    const db = this.db!;

    const message: Message = {
      content: text,
      channel,
      userId: 'bot',
      username: 'TG Guardian',
      timestamp: new Date(),
      type: 'bot_message'
    };

    await db.collection<Message>('messages').insertOne(message);
  }

  private async ensureConnection(): Promise<void> {
    if (!this.db) {
      await this.client.connect();
      this.db = this.client.db();
    }
  }

  async start(port: number): Promise<void> {
    try {
      await this.ensureConnection();
      console.log('MongoDB connected successfully');
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      throw error;
    }
  }

  async getMessageHistory(channel: string, limit: number = 10): Promise<Message[]> {
    await this.ensureConnection();
    const db = this.db!;

    try {
      const messages = await db.collection('messages')
        .find({ channel })
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray();

      return messages.map(msg => ({
        userId: msg.userId,
        username: msg.username || 'Unknown User',
        content: msg.content,
        channel: msg.channel,
        timestamp: new Date(msg.timestamp),
        type: msg.type,
        threadId: msg.threadId,
        metadata: msg.metadata
      }));
    } catch (error) {
      console.error('Error getting message history from MongoDB:', error);
      throw error;
    }
  }

  async deleteOldMessages(daysToKeep: number = 30): Promise<void> {
    await this.ensureConnection();
    const db = this.db!;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    try {
      await db.collection('messages').deleteMany({
        timestamp: { $lt: cutoffDate }
      });
    } catch (error) {
      console.error('Error deleting old messages from MongoDB:', error);
      throw error;
    }
  }
} 