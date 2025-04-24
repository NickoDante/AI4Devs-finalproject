import { KnowledgePort } from '../../../domain/ports/KnowledgePort';
import { Document } from '../../../domain/models/ConfluenceDocument';
import { Logger } from 'winston';
import { PersistencePort } from '../../../domain/ports/PersistencePort';

export class ManageKnowledgeUseCase {
  constructor(
    private readonly knowledgePort: KnowledgePort,
    private readonly persistencePort: PersistencePort,
    private readonly logger: Logger
  ) {}

  async searchDocuments(query: string, limit: number = 5): Promise<Document[]> {
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

  async getDocument(documentId: string): Promise<Document | null> {
    try {
      // Intentar obtener desde persistencia
      const document = await this.persistencePort.getDocumentById(documentId);
      
      if (document) {
        return document;
      }
      
      // Si no está en persistencia, buscarlo en la fuente externa
      const externalDocument = await this.knowledgePort.getDocument(documentId);
      
      if (externalDocument) {
        // Guardar en la base de datos local para futuras consultas
        await this.persistencePort.saveDocument(externalDocument);
      }
      
      return externalDocument;
    } catch (error) {
      this.logger.error('Error al obtener documento:', error);
      return null;
    }
  }

  async indexDocument(document: Document): Promise<boolean> {
    try {
      // Indexar documento en la base de conocimiento
      const success = await this.knowledgePort.indexDocument(document);
      
      if (success) {
        // Guardar referencia en la base de datos local
        await this.persistencePort.saveDocument(document);
        
        this.logger.info('Documento indexado correctamente', {
          documentId: document.id,
          title: document.title
        });
      }
      
      return success;
    } catch (error) {
      this.logger.error('Error al indexar documento:', error);
      return false;
    }
  }
} 