import { KnowledgePort, Document, SearchResult } from '../../domain/ports/KnowledgePort';

export interface KnowledgeContent {
  title: string;
  content: string;
  url?: string;
  relevance: number;
  source?: string;
}

export class ManageKnowledgeUseCase {
  constructor(private readonly knowledgePort: KnowledgePort) {}

  /**
   * Busca documentos que coincidan con la consulta
   */
  async searchDocuments(query: string, limit: number = 5): Promise<SearchResult[]> {
    return await this.knowledgePort.searchDocuments(query, limit);
  }

  /**
   * Genera una respuesta basada en los documentos encontrados
   */
  async generateKnowledgeResponse(query: string, documentIds?: string[]): Promise<KnowledgeContent[]> {
    try {
      // Si no hay IDs específicos, buscar documentos relevantes
      let searchResults: SearchResult[] = [];
      
      if (!documentIds || documentIds.length === 0) {
        searchResults = await this.searchDocuments(query);
      } else {
        // Obtener documentos específicos por ID
        for (const id of documentIds) {
          const doc = await this.getDocumentById(id);
          if (doc) {
            searchResults.push({
              documentId: id,
              title: doc.title,
              content: doc.content,
              url: doc.url,
              relevance: 1.0
            });
          }
        }
      }

      // Transformar resultados en contenido de conocimiento
      return searchResults.map(result => ({
        title: result.title,
        content: result.content,
        url: result.url,
        relevance: result.relevance,
        source: 'Knowledge Base'
      }));
    } catch (error) {
      console.error('Error generando respuesta de conocimiento:', error);
      return [];
    }
  }

  /**
   * Obtiene un documento por su ID
   */
  async getDocumentById(documentId: string): Promise<Document | null> {
    return await this.knowledgePort.getDocument(documentId);
  }

  /**
   * Indexa un nuevo documento
   */
  async indexDocument(document: Document): Promise<boolean> {
    return await this.knowledgePort.indexDocument(document);
  }
} 