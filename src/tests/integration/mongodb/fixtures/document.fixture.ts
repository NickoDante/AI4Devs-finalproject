import { Document } from '../../../../domain/models/ConfluenceDocument';
import { ObjectId } from 'mongodb';

/**
 * Genera un documento de prueba con valores predeterminados
 */
export function createTestDocument(overrides: Partial<Document> = {}): Document {
  return {
    documentId: `doc_${Date.now()}`,
    title: 'Test Document',
    content: 'This is a test document content',
    url: 'https://confluence.example.com/test-document',
    spaceKey: 'TST',
    plainText: 'This is a test document plain text content for searching',
    contentHash: `hash_${Date.now()}`,
    active: true,
    lastUpdated: new Date(),
    createdAt: new Date(),
    createdBy: 'system',
    lastUpdatedBy: 'system',
    ...overrides
  };
}

/**
 * Genera varios documentos de prueba
 */
export function createTestDocuments(count: number): Document[] {
  return Array.from({ length: count }).map((_, index) => {
    return createTestDocument({
      documentId: `doc_${index}`,
      title: `Test Document ${index}`,
      contentHash: `hash_${index}`
    });
  });
} 