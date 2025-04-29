import { KnowledgePort, SearchResult, Document as KnowledgeDocument } from '../../../domain/ports/KnowledgePort';
import { Document as ConfluenceDocument } from '../../../domain/models/ConfluenceDocument';
import { Logger } from 'winston';
import { PersistencePort } from '../../../domain/ports/PersistencePort';

export class ManageKnowledgeUseCase {
  constructor(
    private readonly knowledgePort: KnowledgePort,
    private readonly persistencePort: PersistencePort,
    private readonly logger: Logger
  ) {}

  async searchDocuments(query: string, limit: number = 5): Promise<SearchResult[]> {
    try {
      // Buscar documentos en la base de conocimiento
      const results = await this.knowledgePort.searchDocuments(query, limit);
      
      this.logger.info('Búsqueda de documentos realizada', {
        query,
        resultsCount: results.length
      });
      
      return results;
    } catch (error) {
      this.logger.error('Error al buscar documentos:', error);
      throw error;
    }
  }

  async getDocument(documentId: string): Promise<ConfluenceDocument | null> {
    try {
      // Intentar obtener desde persistencia
      const document = await this.persistencePort.getDocumentById(documentId);
      
      if (document) {
        return document;
      }
      
      // Si no está en persistencia, buscarlo en la fuente externa
      const externalDocument = await this.knowledgePort.getDocument(documentId);
      
      if (externalDocument) {
        // Convertir al formato de ConfluenceDocument
        const confluenceDocument: ConfluenceDocument = this.mapToConfluenceDocument(externalDocument);
        // Guardar en la base de datos local para futuras consultas
        await this.persistencePort.saveDocument(confluenceDocument);
        return confluenceDocument;
      }
      
      return null;
    } catch (error) {
      this.logger.error('Error al obtener documento:', error);
      return null;
    }
  }

  async indexDocument(document: ConfluenceDocument): Promise<boolean> {
    try {
      // Convertir al formato KnowledgeDocument
      const knowledgeDocument: KnowledgeDocument = this.mapToKnowledgeDocument(document);
      
      // Indexar documento en la base de conocimiento
      const success = await this.knowledgePort.indexDocument(knowledgeDocument);
      
      if (success) {
        // Guardar referencia en la base de datos local
        await this.persistencePort.saveDocument(document);
        
        this.logger.info('Documento indexado correctamente', {
          documentId: document.documentId,
          title: document.title
        });
      }
      
      return success;
    } catch (error) {
      this.logger.error('Error al indexar documento:', error);
      return false;
    }
  }
  
  // Método para convertir de KnowledgeDocument a ConfluenceDocument
  private mapToConfluenceDocument(doc: KnowledgeDocument): ConfluenceDocument {
    return {
      documentId: doc.id,
      title: doc.title,
      content: doc.content,
      url: doc.url || '',
      spaceKey: doc.metadata?.spaceKey || 'DEFAULT',
      plainText: doc.content.replace(/<[^>]*>/g, ''), // Eliminar HTML
      contentHash: `hash_${Date.now()}`, // Generar un hash temporal
      active: true,
      lastUpdated: doc.updatedAt,
      createdAt: doc.createdAt,
      createdBy: doc.author || 'unknown',
      lastUpdatedBy: doc.author || 'unknown'
    };
  }
  
  // Método para convertir de ConfluenceDocument a KnowledgeDocument
  private mapToKnowledgeDocument(doc: ConfluenceDocument): KnowledgeDocument {
    return {
      id: doc.documentId,
      title: doc.title,
      content: doc.content,
      url: doc.url,
      source: 'Confluence',
      author: doc.createdBy,
      createdAt: doc.createdAt,
      updatedAt: doc.lastUpdated,
      tags: [],
      categories: [doc.spaceKey],
      metadata: {
        spaceKey: doc.spaceKey,
        documentId: doc.documentId
      }
    };
  }
} 