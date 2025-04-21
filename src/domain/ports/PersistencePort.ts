import { Message } from '../models/Message';
import { User } from '../models/User';
import { Document } from '../models/ConfluenceDocument';

export interface PersistencePort {
  // Gestión de mensajes
  saveMessage(message: Message): Promise<void>;
  getMessageHistory(channel: string, limit?: number): Promise<Message[]>;
  deleteOldMessages(daysToKeep?: number): Promise<void>;

  // Gestión de usuarios
  saveUser(user: User): Promise<void>;
  getUser(userId: string): Promise<User | null>;
  updateUser(userId: string, updates: Partial<User>): Promise<void>;
  deleteUser(userId: string): Promise<void>;

  // Gestión de documentos
  saveDocument(document: Document): Promise<void>;
  getDocument(documentId: string): Promise<Document | null>;
  searchDocuments(query: string): Promise<Document[]>;
  updateDocument(documentId: string, updates: Partial<Document>): Promise<void>;
  deleteDocument(documentId: string): Promise<void>;

  // Métodos de utilidad
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  healthCheck(): Promise<boolean>;
} 