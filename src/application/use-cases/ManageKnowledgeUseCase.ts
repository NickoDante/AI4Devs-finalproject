import { KnowledgePort, KnowledgeContent, SearchResult } from '../../domain/ports/KnowledgePort';

export class ManageKnowledgeUseCase {
  constructor(private readonly knowledgePort: KnowledgePort) {}

  async searchKnowledge(query: string): Promise<SearchResult[]> {
    try {
      const results = await this.knowledgePort.searchKnowledge(query);
      return this.rankResults(results);
    } catch (error) {
      console.error('Error searching knowledge:', error);
      return [];
    }
  }

  async addKnowledge(content: KnowledgeContent): Promise<void> {
    try {
      // Validar el contenido antes de guardarlo
      this.validateContent(content);
      await this.knowledgePort.saveKnowledge(content);
    } catch (error) {
      console.error('Error adding knowledge:', error);
      throw new Error('No se pudo agregar el conocimiento: ' + (error as Error).message);
    }
  }

  async updateKnowledge(id: string, content: KnowledgeContent): Promise<void> {
    try {
      // Validar el contenido antes de actualizarlo
      this.validateContent(content);
      await this.knowledgePort.updateKnowledge(id, content);
    } catch (error) {
      console.error('Error updating knowledge:', error);
      throw new Error('No se pudo actualizar el conocimiento: ' + (error as Error).message);
    }
  }

  private validateContent(content: KnowledgeContent): void {
    if (!content.title?.trim()) {
      throw new Error('El título es requerido');
    }
    if (!content.content?.trim()) {
      throw new Error('El contenido es requerido');
    }
    if (!content.source?.trim()) {
      throw new Error('La fuente es requerida');
    }
    if (content.tags?.some(tag => !tag.trim())) {
      throw new Error('Las etiquetas no pueden estar vacías');
    }
  }

  private rankResults(results: SearchResult[]): SearchResult[] {
    // Ordenar resultados por relevancia y fecha de actualización
    return results.sort((a, b) => {
      // Priorizar primero por relevancia
      const relevanceDiff = b.relevance - a.relevance;
      if (relevanceDiff !== 0) return relevanceDiff;

      // Si la relevancia es igual, ordenar por fecha de actualización
      return b.lastUpdated.getTime() - a.lastUpdated.getTime();
    });
  }
} 