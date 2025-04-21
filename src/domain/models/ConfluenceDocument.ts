import { ObjectId } from 'mongodb';

export interface ConfluenceDocument {
  // Campos esenciales
  documentId: string;
  title: string;
  content: string;
  url: string;
  spaceKey: string;
  plainText: string;
  contentHash: string;
  active: boolean;
  lastUpdated: Date;
  createdAt: Date;
  createdBy: string;
  lastUpdatedBy: string;
}

// Alias para mantener compatibilidad
export type Document = ConfluenceDocument & { _id?: ObjectId }; 