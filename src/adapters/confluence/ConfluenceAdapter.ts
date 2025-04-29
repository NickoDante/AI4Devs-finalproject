import axios, { AxiosError } from 'axios';
import { KnowledgePort, SearchResult, KnowledgeContent, Document } from '../../domain/ports/KnowledgePort';
import { Logger } from 'winston';

export class ConfluenceAdapter implements KnowledgePort {
  private readonly baseUrl: string;
  private readonly auth: {
    username: string;
    password: string;
  };
  private readonly spaceKey: string;

  constructor(
    private readonly logger: Logger
  ) {
    this.baseUrl = process.env.CONFLUENCE_HOST || '';
    this.auth = {
      username: process.env.CONFLUENCE_USERNAME || '',
      password: process.env.CONFLUENCE_API_TOKEN || ''
    };
    this.spaceKey = process.env.CONFLUENCE_SPACE_KEY || 'TG';

    this.logger.info('Inicializando ConfluenceAdapter con configuración:', {
      baseUrl: this.baseUrl,
      username: this.auth.username,
      spaceKey: this.spaceKey
    });

    if (!this.baseUrl || !this.auth.username || !this.auth.password) {
      throw new Error('Las variables de entorno CONFLUENCE_HOST, CONFLUENCE_USERNAME y CONFLUENCE_API_TOKEN son requeridas');
    }
  }

  // Implementación de métodos requeridos por KnowledgePort
  async searchDocuments(query: string, limit: number = 10): Promise<SearchResult[]> {
    return this.searchKnowledge(query, this.spaceKey, limit);
  }

  async getDocument(documentId: string): Promise<Document | null> {
    try {
      this.logger.info(`Obteniendo documento de Confluence: ${documentId}`);
      
      const response = await axios.get(
        `${this.baseUrl}/rest/api/content/${documentId}`,
        { 
          auth: this.auth,
          params: {
            expand: 'body.storage,version,space,metadata.labels'
          }
        }
      );

      if (!response.data) {
        this.logger.info(`No se encontró documento con ID: ${documentId}`);
        return null;
      }

      const result = response.data;
      const now = new Date();
      
      const document: Document = {
        id: result.id,
        title: result.title,
        content: result.body.storage.value,
        url: `${this.baseUrl}${result._links.webui}`,
        source: `Confluence: ${result.space.name}`,
        author: result._expandable?.creator || 'Unknown',
        createdAt: result.history?.createdDate ? new Date(result.history.createdDate) : now,
        updatedAt: result.version?.when ? new Date(result.version.when) : now,
        tags: result.metadata?.labels?.results?.map((label: any) => label.name) || [],
        categories: [result.space.name],
        metadata: {
          spaceKey: result.space.key,
          version: result.version.number,
          type: result.type
        }
      };

      return document;
    } catch (error) {
      this.logger.error('Error al obtener documento de Confluence:', error);
      return null;
    }
  }

  async indexDocument(document: Document): Promise<boolean> {
    try {
      // Verificar si el documento ya existe
      if (document.id && document.id !== `doc_${Date.now()}`) {
        // Actualizar documento existente
        await this.updateKnowledgeDocument(document);
      } else {
        // Crear nuevo documento
        await this.createKnowledgeDocument(document);
      }
      return true;
    } catch (error) {
      this.logger.error('Error al indexar documento en Confluence:', error);
      return false;
    }
  }

  async deleteDocument(documentId: string): Promise<boolean> {
    try {
      this.logger.info(`Eliminando documento de Confluence: ${documentId}`);
      
      await axios.delete(
        `${this.baseUrl}/rest/api/content/${documentId}`,
        { auth: this.auth }
      );

      this.logger.info(`Documento eliminado exitosamente de Confluence: ${documentId}`);
      return true;
    } catch (error) {
      this.logger.error('Error al eliminar documento de Confluence:', error);
      return false;
    }
  }

  async updateDocument(document: Document): Promise<boolean> {
    return this.indexDocument(document);
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/rest/api/space/${this.spaceKey}`, {
        auth: this.auth
      });
      return response.status === 200;
    } catch (error) {
      this.logger.error('Error en health check de Confluence:', error);
      return false;
    }
  }

  // Implementaciones existentes y métodos auxiliares
  async searchKnowledge(query: string, spaceKey?: string, limit: number = 10): Promise<SearchResult[]> {
    try {
      const targetSpaceKey = spaceKey || this.spaceKey;
      this.logger.info(`Iniciando búsqueda en Confluence:`, {
        query,
        spaceKey: targetSpaceKey,
        baseUrl: this.baseUrl
      });

      // Verificar conexión con Confluence
      try {
        const testResponse = await axios.get(`${this.baseUrl}/rest/api/space/${targetSpaceKey}`, {
          auth: this.auth
        });
        this.logger.info('Conexión con Confluence exitosa:', {
          status: testResponse.status,
          spaceName: testResponse.data.name
        });
      } catch (error) {
        this.logger.error('Error al verificar conexión con Confluence:', error);
        throw new Error('No se pudo conectar con Confluence. Verifica las credenciales y la URL.');
      }

      const response = await axios.get(`${this.baseUrl}/rest/api/content/search`, {
        auth: this.auth,
        params: {
          cql: `text ~ "${query}" AND space = "${targetSpaceKey}"`,
          expand: 'body.storage,version,space,metadata.labels',
          limit: limit
        }
      });

      this.logger.info('Respuesta de búsqueda en Confluence:', {
        status: response.status,
        resultsCount: response.data.results?.length || 0
      });

      if (!response.data.results || response.data.results.length === 0) {
        this.logger.info('No se encontraron resultados en Confluence');
        return [];
      }

      const results = response.data.results.map((result: any) => ({
        documentId: result.id,
        title: result.title,
        content: result.body.storage.value,
        url: `${this.baseUrl}${result._links.webui}`,
        relevance: this.calculateRelevance(result, query),
        source: `${result.space.name} > ${result.title}`,
        snippet: this.generateSnippet(result.body.storage.value, query),
        metadata: {
          spaceKey: result.space.key,
          version: result.version.number,
          labels: result.metadata?.labels?.results?.map((label: any) => label.name) || []
        }
      }));

      this.logger.info(`Búsqueda completada. Resultados encontrados: ${results.length}`);
      return results;

    } catch (error) {
      if (error instanceof AxiosError) {
        this.logger.error('Error de API de Confluence:', {
          status: error.response?.status,
          message: error.message,
          data: error.response?.data,
          url: error.config?.url
        });
      } else {
        this.logger.error('Error inesperado en Confluence:', error);
      }
      throw new Error('Error al buscar en Confluence. Por favor, intenta más tarde.');
    }
  }

  private async createKnowledgeDocument(document: Document): Promise<string> {
    this.logger.info(`Creando documento en Confluence: ${document.title}`);
      
    const response = await axios.post(
      `${this.baseUrl}/rest/api/content`,
      {
        type: 'page',
        title: document.title,
        space: { key: document.metadata?.spaceKey || this.spaceKey },
        body: {
          storage: {
            value: document.content,
            representation: 'storage'
          }
        },
        metadata: {
          labels: document.tags?.map(tag => ({ name: tag })) || []
        }
      },
      { auth: this.auth }
    );

    if (!response.data.id) {
      throw new Error('Error al crear la página en Confluence');
    }

    this.logger.info(`Documento creado exitosamente en Confluence con ID: ${response.data.id}`);
    return response.data.id;
  }

  private async updateKnowledgeDocument(document: Document): Promise<void> {
    this.logger.info(`Actualizando documento en Confluence: ${document.id}`);
    
    const currentVersion = await this.getCurrentVersion(document.id);
    
    await axios.put(
      `${this.baseUrl}/rest/api/content/${document.id}`,
      {
        version: {
          number: currentVersion + 1
        },
        title: document.title,
        type: 'page',
        body: {
          storage: {
            value: document.content,
            representation: 'storage'
          }
        },
        metadata: {
          labels: document.tags?.map(tag => ({ name: tag })) || []
        }
      },
      { auth: this.auth }
    );

    this.logger.info(`Documento actualizado exitosamente en Confluence: ${document.id}`);
  }

  async saveKnowledge(content: KnowledgeContent): Promise<void> {
    const document: Document = {
      id: `doc_${Date.now()}`,
      title: content.title,
      content: content.content,
      tags: content.tags,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await this.indexDocument(document);
  }

  async updateKnowledge(id: string, content: KnowledgeContent): Promise<void> {
    const existingDoc = await this.getDocument(id);
    if (!existingDoc) {
      throw new Error(`No se encontró el documento con ID: ${id}`);
    }
    
    const document: Document = {
      ...existingDoc,
      title: content.title,
      content: content.content,
      tags: content.tags,
      updatedAt: new Date()
    };
    
    await this.indexDocument(document);
  }

  private async getCurrentVersion(id: string): Promise<number> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/rest/api/content/${id}`,
        { auth: this.auth }
      );
      return response.data.version.number;
    } catch (error) {
      if (error instanceof AxiosError) {
        this.logger.error('Error de API de Confluence al obtener versión:', {
          status: error.response?.status,
          message: error.message,
          data: error.response?.data
        });
      } else {
        this.logger.error('Error inesperado al obtener versión de Confluence:', error);
      }
      throw new Error('Error al obtener la versión del documento. Por favor, intenta más tarde.');
    }
  }

  private calculateRelevance(result: any, query: string): number {
    const textToSearch = [
      result.title,
      result.body?.storage?.value || '',
      ...(result.metadata?.labels?.results?.map((label: any) => label.name) || [])
    ].join(' ').toLowerCase();
    
    const queryTerms = query.toLowerCase().split(/\s+/);
    const matches = queryTerms.reduce((count, term) => {
      const regex = new RegExp(term, 'g');
      return count + (textToSearch.match(regex)?.length || 0);
    }, 0);

    // Normalizar relevancia entre 0 y 1
    return Math.min(matches / (queryTerms.length * 2), 1);
  }

  private generateSnippet(content: string, query: string): string {
    try {
      // Eliminar etiquetas HTML
      const plainText = content.replace(/<[^>]*>/g, ' ').trim();
      
      // Encontrar contexto alrededor de la primera aparición de la consulta
      const queryLower = query.toLowerCase();
      const textLower = plainText.toLowerCase();
      const index = textLower.indexOf(queryLower);
      
      if (index === -1) {
        // Si no se encuentra exactamente, devolver el principio del texto
        return plainText.substring(0, 150) + '...';
      }
      
      // Calcular el rango para el snippet
      const start = Math.max(0, index - 75);
      const end = Math.min(plainText.length, index + queryLower.length + 75);
      
      // Añadir puntos suspensivos si es necesario
      const prefix = start > 0 ? '...' : '';
      const suffix = end < plainText.length ? '...' : '';
      
      return prefix + plainText.substring(start, end) + suffix;
    } catch (error) {
      return content.substring(0, 150) + '...';
    }
  }
} 