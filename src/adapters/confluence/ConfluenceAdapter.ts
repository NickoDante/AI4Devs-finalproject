import axios from 'axios';
import { KnowledgePort, SearchResult, KnowledgeContent } from '../../domain/ports/KnowledgePort';

export class ConfluenceAdapter implements KnowledgePort {
  private readonly baseUrl: string;
  private readonly auth: {
    username: string;
    password: string;
  };

  constructor() {
    this.baseUrl = process.env.CONFLUENCE_HOST || '';
    this.auth = {
      username: process.env.CONFLUENCE_USERNAME || '',
      password: process.env.CONFLUENCE_API_TOKEN || ''
    };

    if (!this.baseUrl || !this.auth.username || !this.auth.password) {
      throw new Error('Las variables de entorno CONFLUENCE_HOST, CONFLUENCE_USERNAME y CONFLUENCE_API_TOKEN son requeridas');
    }
  }

  async searchKnowledge(query: string): Promise<SearchResult[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/rest/api/content/search`, {
        auth: this.auth,
        params: {
          cql: `text ~ "${query}" AND space = "TG"`,
          expand: 'body.storage,version,space,metadata.labels',
          limit: 10
        }
      });

      return response.data.results.map((result: any) => ({
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
    } catch (error) {
      console.error('Error buscando en Confluence:', error);
      throw error;
    }
  }

  async saveKnowledge(content: KnowledgeContent): Promise<void> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/rest/api/content`,
        {
          type: 'page',
          title: content.title,
          space: { key: 'TG' },
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
    } catch (error) {
      console.error('Error guardando en Confluence:', error);
      throw error;
    }
  }

  async updateKnowledge(id: string, content: KnowledgeContent): Promise<void> {
    try {
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
    } catch (error) {
      console.error('Error actualizando en Confluence:', error);
      throw error;
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
      console.error('Error obteniendo versión del documento:', error);
      throw error;
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