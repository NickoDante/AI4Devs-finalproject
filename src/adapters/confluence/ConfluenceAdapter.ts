import axios, { AxiosError } from 'axios';
import { KnowledgePort, SearchResult, KnowledgeContent } from '../../domain/ports/KnowledgePort';
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

  async searchKnowledge(query: string, spaceKey?: string): Promise<SearchResult[]> {
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
          limit: 10
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
        id: result.id,
        content: result.body.storage.value,
        relevance: this.calculateRelevance(result, query),
        source: `${result.space.name} > ${result.title}`,
        lastUpdated: new Date(result.version.when),
        metadata: {
          spaceKey: result.space.key,
          version: result.version.number,
          labels: result.metadata?.labels?.results?.map((label: any) => label.name) || [],
          url: `${this.baseUrl}${result._links.webui}`
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

  async saveKnowledge(content: KnowledgeContent): Promise<void> {
    try {
      this.logger.info(`Guardando documento en Confluence: ${content.title}`);
      
      const response = await axios.post(
        `${this.baseUrl}/rest/api/content`,
        {
          type: 'page',
          title: content.title,
          space: { key: this.spaceKey },
          body: {
            storage: {
              value: content.content,
              representation: 'storage'
            }
          },
          metadata: {
            labels: content.tags?.map(tag => ({ name: tag })) || []
          }
        },
        { auth: this.auth }
      );

      if (!response.data.id) {
        throw new Error('Error al crear la página en Confluence');
      }

      this.logger.info(`Documento guardado exitosamente en Confluence con ID: ${response.data.id}`);

    } catch (error) {
      if (error instanceof AxiosError) {
        this.logger.error('Error de API de Confluence al guardar:', {
          status: error.response?.status,
          message: error.message,
          data: error.response?.data
        });
      } else {
        this.logger.error('Error inesperado al guardar en Confluence:', error);
      }
      throw new Error('Error al guardar en Confluence. Por favor, intenta más tarde.');
    }
  }

  async updateKnowledge(id: string, content: KnowledgeContent): Promise<void> {
    try {
      this.logger.info(`Actualizando documento en Confluence: ${id}`);
      
      const currentVersion = await this.getCurrentVersion(id);
      
      await axios.put(
        `${this.baseUrl}/rest/api/content/${id}`,
        {
          version: {
            number: currentVersion + 1
          },
          title: content.title,
          type: 'page',
          body: {
            storage: {
              value: content.content,
              representation: 'storage'
            }
          },
          metadata: {
            labels: content.tags?.map(tag => ({ name: tag })) || []
          }
        },
        { auth: this.auth }
      );

      this.logger.info(`Documento actualizado exitosamente en Confluence: ${id}`);

    } catch (error) {
      if (error instanceof AxiosError) {
        this.logger.error('Error de API de Confluence al actualizar:', {
          status: error.response?.status,
          message: error.message,
          data: error.response?.data
        });
      } else {
        this.logger.error('Error inesperado al actualizar en Confluence:', error);
      }
      throw new Error('Error al actualizar en Confluence. Por favor, intenta más tarde.');
    }
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
} 