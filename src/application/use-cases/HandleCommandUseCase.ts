import { Message } from '../../domain/models/Message';
import { BotResponse } from '../../domain/models/BotResponse';
import { KnowledgePort, Document, SearchResult } from '../../domain/ports/KnowledgePort';

export enum CommandType {
  HELP = 'help',
  SEARCH = 'search',
  ADD = 'add',
  UPDATE = 'update',
  UNKNOWN = 'unknown'
}

interface Command {
  type: CommandType;
  args: string[];
}

export class HandleCommandUseCase {
  constructor(
    private readonly knowledgePort: KnowledgePort
  ) {}

  async execute(message: Message): Promise<BotResponse> {
    const command = this.parseCommand(message.content);

    try {
      switch (command.type) {
        case CommandType.HELP:
          return this.handleHelp();
        case CommandType.SEARCH:
          return this.handleSearch(command.args);
        case CommandType.ADD:
          return this.handleAdd(command.args);
        case CommandType.UPDATE:
          return this.handleUpdate(command.args);
        default:
          return {
            content: 'Comando no reconocido. Usa "help" para ver los comandos disponibles.',
            type: 'error',
            metadata: { error: true }
          };
      }
    } catch (error) {
      return {
        content: `Error ejecutando el comando: ${(error as Error).message}`,
        type: 'error',
        metadata: { error: true }
      };
    }
  }

  private parseCommand(content: string): Command {
    const parts = content.trim().split(' ');
    const commandStr = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (commandStr) {
      case '/help':
        return { type: CommandType.HELP, args };
      case '/search':
        return { type: CommandType.SEARCH, args };
      case '/add':
        return { type: CommandType.ADD, args };
      case '/update':
        return { type: CommandType.UPDATE, args };
      default:
        return { type: CommandType.UNKNOWN, args };
    }
  }

  private handleHelp(): BotResponse {
    return {
      content: `Comandos disponibles:
• /help - Muestra esta ayuda
• /search <término> - Busca información
• /add <título> | <contenido> | <fuente> [| tags] - Agrega nuevo conocimiento
• /update <id> | <título> | <contenido> | <fuente> [| tags] - Actualiza conocimiento existente`,
      type: 'text',
      metadata: { confidence: 1 }
    };
  }

  private async handleSearch(args: string[]): Promise<BotResponse> {
    if (args.length === 0) {
      return {
        content: 'Por favor, especifica un término de búsqueda.',
        type: 'error',
        metadata: { error: true }
      };
    }

    const query = args.join(' ');
    const results = await this.knowledgePort.searchDocuments(query);

    if (results.length === 0) {
      return {
        content: 'No se encontraron resultados para tu búsqueda.',
        type: 'text',
        metadata: { confidence: 0 }
      };
    }

    const content = results
      .slice(0, 3)
      .map((r: SearchResult) => `• ${r.content.substring(0, 200)}... \n_Fuente: ${r.source || 'Desconocido'}_`)
      .join('\n\n');

    return {
      content,
      type: 'text',
      metadata: {
        confidence: Math.max(...results.slice(0, 3).map((r: SearchResult) => r.relevance)),
        source: results[0].source || 'Base de Conocimiento'
      }
    };
  }

  private async handleAdd(args: string[]): Promise<BotResponse> {
    const content = args.join(' ').split('|').map(s => s.trim());
    if (content.length < 3) {
      return {
        content: 'Formato incorrecto. Uso: /add <título> | <contenido> | <fuente> [| tags]',
        type: 'error',
        metadata: { error: true }
      };
    }

    const now = new Date();
    const document: Document = {
      id: `doc_${Date.now()}`,
      title: content[0],
      content: content[1],
      source: content[2],
      tags: content[3]?.split(',').map(t => t.trim()),
      createdAt: now,
      updatedAt: now
    };

    const success = await this.knowledgePort.indexDocument(document);

    return {
      content: success 
        ? 'Conocimiento agregado exitosamente.' 
        : 'Error al agregar conocimiento.',
      type: 'text',
      metadata: { confidence: 1 }
    };
  }

  private async handleUpdate(args: string[]): Promise<BotResponse> {
    const content = args.join(' ').split('|').map(s => s.trim());
    if (content.length < 4) {
      return {
        content: 'Formato incorrecto. Uso: /update <id> | <título> | <contenido> | <fuente> [| tags]',
        type: 'error',
        metadata: { error: true }
      };
    }

    const id = content[0];
    const existingDoc = await this.knowledgePort.getDocument(id);
    
    if (!existingDoc) {
      return {
        content: `No se encontró un documento con ID: ${id}`,
        type: 'error',
        metadata: { error: true }
      };
    }

    const document: Document = {
      ...existingDoc,
      title: content[1],
      content: content[2],
      source: content[3],
      tags: content[4]?.split(',').map(t => t.trim()),
      updatedAt: new Date()
    };

    const success = await this.knowledgePort.indexDocument(document);

    return {
      content: success 
        ? 'Conocimiento actualizado exitosamente.' 
        : 'Error al actualizar conocimiento.',
      type: 'text',
      metadata: { confidence: 1 }
    };
  }
} 