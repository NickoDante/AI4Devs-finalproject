import { Message } from '../../../domain/models/Message';
import { BotResponse } from '../../../domain/models/BotResponse';
import { MessagePort } from '../../../domain/ports/MessagePort';
import { AIAdapter } from '../../../domain/ports/AIAdapter';
import { PersistencePort } from '../../../domain/ports/PersistencePort';
import { CachePort } from '../../../domain/ports/CachePort';
import { KnowledgePort, SearchResult } from '../../../domain/ports/KnowledgePort';
import { Logger } from 'winston';
import { SearchCommand } from '../../commands/search.command';

export class ProcessMessageUseCase {
  private readonly CACHE_NAMESPACE = 'search-results';
  private readonly CACHE_TTL = 3600; // 1 hora
  private readonly searchCommand: SearchCommand;

  constructor(
    private readonly messagePort: MessagePort,
    private readonly aiAdapter: AIAdapter,
    private readonly persistencePort: PersistencePort,
    private readonly cachePort: CachePort,
    private readonly knowledgePort: KnowledgePort,
    private readonly logger: Logger
  ) {
    this.searchCommand = new SearchCommand(logger);
  }

  async execute(message: Message): Promise<BotResponse> {
    try {
      if (message.type === 'command' && message.metadata?.command === 'search') {
        return await this.handleSearchCommand(message);
      }

      // Respuesta por defecto para otros tipos de mensajes
      return {
        content: `¡Hola! 👋 Soy *TG: The Guardian, el asistente IA* de Teravision Games a tu servicio 👁️.

Estos son los comandos disponibles:

BUSQUEDA:
• \`/tg-search <palabras clave> [-- <espacio>]\` - Buscar en la base de conocimiento

PREGUNTAS:
• \`/tg-question [pregunta]\` - Realiza cualquier pregunta que se te ocurra.

RESUMEN:
🔗 **Para resumir URLs:**
• \`/tg-summary [URL] [Lenguaje]\` - Generar un resumen de una URL (especialmente Confluence)

📎 **Para resumir archivos PDF:**
1. 📤 Sube tu archivo PDF al canal
2. 🏷️ Menciona: \`@TG-TheGuardian resumen\` (o \`summary\` en inglés)

FEEDBACK:
• \`/tg-feedback +1/-1 [comentario]\` - Dar feedback positivo/negativo sobre la última respuesta

💬 **Para dar feedback:**
• \`/tg-feedback +1\` - Marcar respuesta como útil
• \`/tg-feedback -1\` - Marcar respuesta como no útil
• \`/tg-feedback +1 ¡Excelente información!\` - Agregar comentario`,
        type: 'text',
        metadata: {
          source: 'Sistema',
          confidence: 1
        }
      };
    } catch (error) {
      this.logger.error('Error procesando mensaje:', error);
      return {
        content: '❌ Lo siento, ocurrió un error al procesar tu mensaje.',
        type: 'text',
        metadata: {
          source: 'Sistema',
          confidence: 0,
          hasError: true
        }
      };
    }
  }

  private async handleSearchCommand(message: Message): Promise<BotResponse> {
    // 1. Validar la búsqueda usando SearchCommand
    const validation = await this.searchCommand.validate(message);
    if (!validation.isValid) {
      return {
        content: validation.error || '❌ Error en la búsqueda',
        type: 'text',
        metadata: {
          source: 'Sistema',
          confidence: 0,
          hasError: true
        }
      };
    }

    const searchQuery = validation.keywords?.join(' ') || '';
    
    // 2. Verificar caché
    const cacheKey = `${this.CACHE_NAMESPACE}:${validation.spaceKey || 'default'}:${searchQuery}`;
    const cachedResults = await this.cachePort.get<SearchResult[]>(cacheKey);
    if (cachedResults) {
      const hasResults = cachedResults.length > 0;
      return {
        content: this.formatSearchResults(cachedResults, searchQuery, validation.spaceKey, validation.spaceName),
        type: 'text',
        metadata: hasResults ? {
          source: `Confluence - ${validation.spaceName || validation.spaceKey}`,
          confidence: this.calculateConfidence(cachedResults, searchQuery),
          keywords: searchQuery,
          spaceKey: validation.spaceKey
        } : {
          keywords: searchQuery,
          spaceKey: validation.spaceKey,
          emptyResults: true
        }
      };
    }

    // 3. Realizar la búsqueda
    try {
      const results = await this.knowledgePort.searchKnowledge(searchQuery, validation.spaceKey);
      
      // 4. Cachear resultados
      if (results.length > 0) {
        await this.cachePort.set(cacheKey, results, { ttl: this.CACHE_TTL });
      }

      // 5. Formatear y devolver resultados
      const hasResults = results.length > 0;
      return {
        content: this.formatSearchResults(results, searchQuery, validation.spaceKey, validation.spaceName),
        type: 'text',
        metadata: hasResults ? {
          source: `Confluence - ${validation.spaceName || validation.spaceKey}`,
          confidence: this.calculateConfidence(results, searchQuery),
          keywords: searchQuery,
          spaceKey: validation.spaceKey
        } : {
          keywords: searchQuery,
          spaceKey: validation.spaceKey,
          emptyResults: true
        }
      };
    } catch (error) {
      this.logger.error('Error en búsqueda:', error);
      return {
        content: '❌ Lo siento, ocurrió un error al realizar la búsqueda.',
        type: 'text',
        metadata: {
          source: 'Sistema',
          confidence: 0,
          hasError: true
        }
      };
    }
  }

  private formatSearchResults(results: SearchResult[], query: string, spaceKey?: string, spaceName?: string): string {
    if (!results.length) {
      return `👀 Ups, con todos mis ojos la verdad no encontré nada sobre "${query}" en ${spaceName || spaceKey || 'la base de conocimiento'}.`;
    }

    const header = `🔍 *Aquí tienes lo que encontré sobre tu búsqueda "${query}" en ${spaceName || spaceKey}:*\n`;
    
    // Ordenar resultados por relevancia
    const sortedResults = results.sort((a, b) => b.relevance - a.relevance);
    
    // Determinar si hay más de 4 resultados
    const hasMoreResults = sortedResults.length > 4;
    
    // Limitar a 4 resultados
    const limitedResults = sortedResults.slice(0, 4);
    
    const formattedResults = limitedResults.map(result => {
        // Limpiar el contenido de tags HTML y caracteres especiales
        const cleanContent = result.content
          .replace(/<[^>]*>/g, '') // Remover tags HTML
          .replace(/&[^;]+;/g, '') // Remover entidades HTML
          .replace(/\s+/g, ' ') // Normalizar espacios
          .trim();

        // Formatear el contenido para mostrar solo las primeras 200 caracteres
        const contentPreview = cleanContent.length > 200 
          ? cleanContent.substring(0, 200) + '...'
          : cleanContent;

        // Formatear las etiquetas o mostrar mensaje si no hay
      const labels = result.metadata && result.metadata.labels && result.metadata.labels.length > 0
          ? result.metadata.labels.join(', ')
          : 'Sin etiquetas';

      // Obtener la URL del documento primero de metadata.url y luego de result.url
      const documentUrl = result.metadata?.url || result.url || '';

        return `📄 *${result.source}*\n` +
             `🔗 <${documentUrl}|Ver documento>\n` +
               `📝 ${contentPreview}\n` +
               `🏷️ ${labels}`;
      }).join('\n\n');

    // Agregar mensaje cuando hay más resultados
    const moreResultsMessage = hasMoreResults 
      ? `\n\n👀 *¡Hey! ¡Necesito más ojos!* Encontré ${results.length} resultados pero solo te estoy mostrando 4. ¿No encontraste lo que buscabas? Hay más información en Confluence esperándote. ¡Ingresa directamente y explora más a fondo!`
      : '';

    return `${header}\n${formattedResults}${moreResultsMessage}`;
  }

  // Método para calcular la confianza basada en la relevancia de los resultados
  private calculateConfidence(results: SearchResult[], query: string): number {
    if (!results.length) return 0;
    
    // Obtener los primeros 3 resultados más relevantes
    const topResults = results
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 3);
    
    // Calcular la confianza como el promedio de relevancia de los top resultados
    const averageRelevance = topResults.reduce((sum, result) => sum + result.relevance, 0) / topResults.length;
    
    // Normalizar entre 0 y 1, y redondear a 2 decimales
    return Math.round(averageRelevance * 100) / 100;
  }
} 