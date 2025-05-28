import { Collection, MongoClient, WithId, Document as MongoDocument } from 'mongodb';
import { PersistencePort } from '../../domain/ports/PersistencePort';
import { Message } from '../../domain/models/Message';
import { Document } from '../../domain/models/ConfluenceDocument';
import { User } from '../../domain/models/User';
import { Feedback } from '../../domain/models/Feedback';
import { Logger } from 'winston';

export class MongoDBAdapter implements PersistencePort {
  private client: MongoClient;
  private messages!: Collection<Message>;
  private documents!: Collection<Document>;
  private users!: Collection<User>;
  private feedbacks!: Collection<Feedback>;
  private logger: Logger;

  constructor(uri: string, logger: Logger) {
    this.client = new MongoClient(uri);
    this.logger = logger;
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
      this.logger.info('Connected to MongoDB');
      
      const db = this.client.db('theguardian');
      this.messages = db.collection('messages');
      this.documents = db.collection('documents');
      this.users = db.collection('users');
      this.feedbacks = db.collection('feedbacks');

      // Crear índices
      await this.messages.createIndex({ channelId: 1 });
      await this.messages.createIndex({ userId: 1 });
      await this.documents.createIndex({ title: 'text', content: 'text' });
      await this.users.createIndex({ userId: 1 }, { unique: true });
      await this.feedbacks.createIndex({ responseId: 1 });
      await this.feedbacks.createIndex({ userId: 1 });
      await this.feedbacks.createIndex({ createdAt: -1 });
    } catch (error) {
      this.logger.error('Error connecting to MongoDB:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    await this.client.close();
    this.logger.info('Disconnected from MongoDB');
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.client.db().command({ ping: 1 });
      return true;
    } catch (error) {
      this.logger.error('MongoDB health check failed:', error);
      return false;
    }
  }

  // Métodos para mensajes
  async saveMessage(message: Message): Promise<Message> {
    const result = await this.messages.insertOne(message);
    return { ...message, _id: result.insertedId };
  }

  async getMessagesByChannel(channelId: string, limit = 100): Promise<Message[]> {
    return await this.messages
      .find({ channel: channelId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
  }

  async getMessagesByUser(userId: string, limit = 100): Promise<Message[]> {
    return await this.messages
      .find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
  }

  async getMessageById(messageId: string): Promise<Message | null> {
    return await this.messages.findOne({ id: messageId });
  }

  async deleteMessage(messageId: string): Promise<boolean> {
    const result = await this.messages.deleteOne({ id: messageId });
    return result.deletedCount > 0;
  }

  // Métodos para documentos
  async saveDocument(document: Document): Promise<Document> {
    const result = await this.documents.insertOne(document);
    return { ...document, _id: result.insertedId };
  }

  async getDocumentById(documentId: string): Promise<Document | null> {
    return await this.documents.findOne({ id: documentId });
  }

  async getDocuments(filter: Partial<Document> = {}): Promise<Document[]> {
    return await this.documents.find(filter).toArray();
  }

  async deleteDocument(documentId: string): Promise<boolean> {
    const result = await this.documents.deleteOne({ id: documentId });
    return result.deletedCount > 0;
  }

  // Métodos para usuarios
  async saveUser(user: User): Promise<User> {
    const result = await this.users.insertOne(user);
    return { ...user, _id: result.insertedId };
  }

  async findUserById(userId: string): Promise<User | null> {
    return await this.users.findOne({ userId });
  }

  async getUsers(filter: Partial<User> = {}): Promise<User[]> {
    return await this.users.find(filter).toArray();
  }

  async deleteUser(userId: string): Promise<boolean> {
    const result = await this.users.deleteOne({ userId });
    return result.deletedCount > 0;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    const result = await this.users.findOneAndUpdate(
      { userId },
      { $set: updates },
      { returnDocument: 'after' }
    );
    return result ? (result as unknown as MongoDocument).value as User : null;
  }

  // Métodos para feedback
  async saveFeedback(feedback: Feedback): Promise<Feedback> {
    try {
      if (!this.feedbacks) {
        throw new Error('MongoDB feedbacks collection not initialized. Call connect() first.');
      }
      const result = await this.feedbacks.insertOne(feedback);
      this.logger.info('Feedback saved to MongoDB', { feedbackId: feedback.id });
      return feedback;
    } catch (error) {
      this.logger.error('Error saving feedback to MongoDB', { error, feedbackId: feedback.id });
      throw error;
    }
  }

  async getFeedbackById(feedbackId: string): Promise<Feedback | null> {
    try {
      if (!this.feedbacks) {
        this.logger.error('MongoDB feedbacks collection not initialized');
        return null;
      }
      return await this.feedbacks.findOne({ id: feedbackId });
    } catch (error) {
      this.logger.error('Error getting feedback by ID from MongoDB', { error, feedbackId });
      return null;
    }
  }

  async getFeedbackByResponseId(responseId: string): Promise<Feedback[]> {
    try {
      if (!this.feedbacks) {
        this.logger.error('MongoDB feedbacks collection not initialized');
        return [];
      }
      return await this.feedbacks
        .find({ responseId })
        .sort({ createdAt: -1 })
        .toArray();
    } catch (error) {
      this.logger.error('Error getting feedback by response ID from MongoDB', { error, responseId });
      return [];
    }
  }

  async getFeedbackByUserId(userId: string, limit = 50): Promise<Feedback[]> {
    try {
      return await this.feedbacks
        .find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();
    } catch (error) {
      this.logger.error('Error getting feedback by user ID from MongoDB', { error, userId });
      return [];
    }
  }

  async updateFeedback(feedbackId: string, updates: Partial<Feedback>): Promise<Feedback | null> {
    try {
      const result = await this.feedbacks.findOneAndUpdate(
        { id: feedbackId },
        { $set: updates },
        { returnDocument: 'after' }
      );
      
      if (result) {
        this.logger.info('Feedback updated in MongoDB', { feedbackId });
        return result as unknown as Feedback;
      }
      
      return null;
    } catch (error) {
      this.logger.error('Error updating feedback in MongoDB', { error, feedbackId });
      return null;
    }
  }

  async deleteFeedback(feedbackId: string): Promise<boolean> {
    try {
      const result = await this.feedbacks.deleteOne({ id: feedbackId });
      const success = result.deletedCount > 0;
      this.logger.info('Feedback deletion attempt', { feedbackId, success });
      return success;
    } catch (error) {
      this.logger.error('Error deleting feedback from MongoDB', { error, feedbackId });
      return false;
    }
  }
} 