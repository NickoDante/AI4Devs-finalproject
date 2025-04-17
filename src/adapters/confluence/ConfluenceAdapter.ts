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
  }

  async searchKnowledge(query: string): Promise<SearchResult[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/rest/api/content/search`, {
        auth: this.auth,
        params: {
          cql: `text ~ "${query}"`,
          expand: 'body.storage,version'
        }
      });

      return response.data.results.map((result: any) => ({
        id: result.id,
        content: result.body.storage.value,
        relevance: this.calculateRelevance(result, query),
        source: `${result.title} (Confluence)`,
        lastUpdated: new Date(result.version.when)
      }));
    } catch (error) {
      console.error('Error searching in Confluence:', error);
      return [];
    }
  }

  async saveKnowledge(content: KnowledgeContent): Promise<void> {
    try {
      await axios.post(
        `${this.baseUrl}/rest/api/content`,
        {
          type: 'page',
          title: content.title,
          space: {
            key: 'TG' // Espacio de Teravision Games
          },
          body: {
            storage: {
              value: content.content,
              representation: 'storage'
            }
          },
          metadata: {
            labels: content.tags?.map(tag => ({ name: tag }))
          }
        },
        { auth: this.auth }
      );
    } catch (error) {
      console.error('Error saving to Confluence:', error);
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
          body: {
            storage: {
              value: content.content,
              representation: 'storage'
            }
          },
          metadata: {
            labels: content.tags?.map(tag => ({ name: tag }))
          }
        },
        { auth: this.auth }
      );
    } catch (error) {
      console.error('Error updating in Confluence:', error);
      throw error;
    }
  }

  private async getCurrentVersion(id: string): Promise<number> {
    const response = await axios.get(`${this.baseUrl}/rest/api/content/${id}`, {
      auth: this.auth
    });
    return response.data.version.number;
  }

  private calculateRelevance(result: any, query: string): number {
    // Implementación básica de relevancia basada en coincidencia de texto
    const content = result.body.storage.value.toLowerCase();
    const searchTerms = query.toLowerCase().split(' ');
    
    return searchTerms.reduce((relevance: number, term: string) => {
      const matches = content.split(term).length - 1;
      return relevance + matches;
    }, 0) / searchTerms.length;
  }
} 