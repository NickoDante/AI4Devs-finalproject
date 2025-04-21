import { MongoClient, Db } from 'mongodb';
import { PersistencePort } from '../../domain/ports/PersistencePort';
import { Message } from '../../domain/models/Message';
import { User } from '../../domain/models/User';
import { Document } from '../../domain/models/ConfluenceDocument';

export class MongoDBAdapter implements PersistencePort {
  private client: MongoClient;
  private db: Db | null = null;

  constructor(uri?: string) {
    this.client = new MongoClient(uri || process.env.MONGODB_URI || 'mongodb://localhost:27017/tg-guardian');
  }

  // Gestión de mensajes
  async saveMessage(message: Message): Promise<void> {
    await this.ensureConnection();
    await this.db!.collection<Message>('messages').insertOne({
      ...message,
      timestamp: new Date()
    });
  }

  async getMessageHistory(channel: string, limit: number = 10): Promise<Message[]> {
    await this.ensureConnection();
    const messages = await this.db!.collection<Message>('messages')
      .find({ channel })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();

    return messages;
  }

  async deleteOldMessages(daysToKeep: number = 30): Promise<void> {
    await this.ensureConnection();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    await this.db!.collection('messages').deleteMany({
      timestamp: { $lt: cutoffDate }
    });
  }

  // Gestión de usuarios
  async saveUser(user: User): Promise<void> {
    await this.ensureConnection();
    const now = new Date();
    await this.db!.collection<User>('users').insertOne({
      ...user,
      createdAt: now,
      updatedAt: now,
      active: true,
      isAdmin: false,
      language: 'es'
    });
  }

  async getUser(userId: string): Promise<User | null> {
    await this.ensureConnection();
    return this.db!.collection<User>('users').findOne({ 
      id: userId,
      active: true 
    });
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    await this.ensureConnection();
    await this.db!.collection<User>('users').updateOne(
      { id: userId },
      { 
        $set: {
          ...updates,
          updatedAt: new Date()
        }
      }
    );
  }

  async deleteUser(userId: string): Promise<void> {
    await this.ensureConnection();
    await this.db!.collection<User>('users').updateOne(
      { id: userId },
      { 
        $set: { 
          active: false,
          updatedAt: new Date()
        }
      }
    );
  }

  // Gestión de documentos
  async saveDocument(document: Document): Promise<void> {
    await this.ensureConnection();
    const now = new Date();
    await this.db!.collection<Document>('documents').insertOne({
      ...document,
      createdAt: now,
      lastUpdated: now,
      active: true
    });
  }

  async getDocument(documentId: string): Promise<Document | null> {
    await this.ensureConnection();
    return this.db!.collection<Document>('documents').findOne({ 
      documentId,
      active: true 
    });
  }

  async searchDocuments(query: string): Promise<Document[]> {
    await this.ensureConnection();
    return this.db!.collection<Document>('documents')
      .find({
        $and: [
          { active: true },
          { $text: { $search: query } }
        ]
      })
      .sort({ score: { $meta: "textScore" } })
      .toArray();
  }

  async updateDocument(documentId: string, updates: Partial<Document>): Promise<void> {
    await this.ensureConnection();
    await this.db!.collection<Document>('documents').updateOne(
      { documentId },
      { 
        $set: {
          ...updates,
          lastUpdated: new Date()
        }
      }
    );
  }

  async deleteDocument(documentId: string): Promise<void> {
    await this.ensureConnection();
    await this.db!.collection<Document>('documents').updateOne(
      { documentId },
      { 
        $set: { 
          active: false,
          lastUpdated: new Date()
        }
      }
    );
  }

  // Métodos de utilidad
  async connect(): Promise<void> {
    if (!this.db) {
      await this.client.connect();
      this.db = this.client.db();
      
      // Crear índices necesarios
      await this.createIndices();
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.db = null;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.ensureConnection();
      await this.db!.command({ ping: 1 });
      return true;
    } catch (error) {
      console.error('MongoDB health check failed:', error);
      return false;
    }
  }

  private async ensureConnection(): Promise<void> {
    if (!this.db) {
      await this.connect();
    }
  }

  private async createIndices(): Promise<void> {
    // Índices esenciales para documentos
    await this.db!.collection('documents').createIndex(
      { 
        title: 'text',
        content: 'text',
        plainText: 'text'
      }
    );

    await this.db!.collection('documents').createIndex(
      { documentId: 1 },
      { unique: true }
    );

    // Índices esenciales para usuarios
    await this.db!.collection('users').createIndex(
      { id: 1 },
      { unique: true }
    );
    await this.db!.collection('users').createIndex(
      { slackId: 1 },
      { unique: true }
    );

    // Índices esenciales para mensajes
    await this.db!.collection('messages').createIndex(
      { channel: 1, timestamp: -1 }
    );
  }
} 