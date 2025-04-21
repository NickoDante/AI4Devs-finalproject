import { Message } from '../models/Message';
import { User } from '../models/User';
import { Document } from '../models/ConfluenceDocument';

export interface PersistencePort {
  // Métodos para mensajes
  saveMessage(message: Message): Promise<Message>;
  getMessagesByChannel(channelId: string, limit?: number): Promise<Message[]>;
  getMessagesByUser(userId: string, limit?: number): Promise<Message[]>;
  getMessageById(messageId: string): Promise<Message | null>;
  deleteMessage(messageId: string): Promise<boolean>;

  // Métodos para documentos
  saveDocument(document: Document): Promise<Document>;
  getDocumentById(documentId: string): Promise<Document | null>;
  getDocuments(filter?: Partial<Document>): Promise<Document[]>;
  deleteDocument(documentId: string): Promise<boolean>;

  // Métodos para usuarios
  saveUser(user: User): Promise<User>;
  findUserById(userId: string): Promise<User | null>;
  getUsers(filter?: Partial<User>): Promise<User[]>;
  deleteUser(userId: string): Promise<boolean>;
  updateUser(userId: string, updates: Partial<User>): Promise<User | null>;

  // Métodos de utilidad
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  healthCheck(): Promise<boolean>;
} 