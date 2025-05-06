import { Message } from '../../../domain/models/Message';
import { BotResponse } from '../../../domain/models/BotResponse';
import { AIAdapter } from '../../../domain/ports/AIAdapter';
import { KnowledgePort, SearchResult } from '../../../domain/ports/KnowledgePort';
import { CachePort, ConversationContext } from '../../../domain/ports/CachePort';
import { Logger } from 'winston';
import { v4 as uuidv4 } from 'uuid';
import { ManageConversationContextUseCase } from '../ManageConversationContextUseCase';

export interface QuestionRequest {
  question: string;
  userId: string;
  username: string;
  conversationId?: string;
  threadId?: string;
}

export class ProcessQuestionUseCase {
  private readonly MAX_RELEVANT_DOCS = 3;
  private readonly contextManager: ManageConversationContextUseCase;

  constructor(
    private readonly aiAdapter: AIAdapter,
    private readonly knowledgePort: KnowledgePort,
    private readonly cachePort: CachePort,
    private readonly logger: Logger
  ) {
    this.contextManager = new ManageConversationContextUseCase(cachePort);
  }

  async execute(message: Message): Promise<BotResponse> {
    try {
      this.logger.info('Procesando pregunta:', {
        content: message.content,
        userId: message.userId,
        threadId: message.threadId
      });

      // 1. Obtener o crear ID de conversación
      const conversationId = message.metadata?.conversationId || uuidv4();

      // 2. Buscar documentos relevantes
      const searchResults = await this.searchRelevantDocuments(message.content);
      this.logger.info(`Encontrados ${searchResults.length} documentos relevantes`);

      // 3. Obtener contexto de la conversación
      let context = await this.contextManager.getContext(message.userId, conversationId);
      
      // Crear contexto si no existe
      if (!context) {
        context = {
          userId: message.userId,
          conversationId,
          messages: [],
          metadata: {
            lastInteraction: new Date(),
            relevantDocuments: []
          }
        };
      }

      // 4. Agregar la pregunta del usuario al contexto
      await this.contextManager.addMessageToContext(
        message.userId,
        conversationId,
        message.content,
        'user'
      );

      // 5. Preparar prompt con contexto y documentos relevantes
      const enhancedMessage = this.enhanceMessageWithContext(message, searchResults, context);

      // 6. Procesar con LLM
      const llmResponse = await this.aiAdapter.processMessage(enhancedMessage);

      // 7. Guardar respuesta en el contexto
      await this.contextManager.addMessageToContext(
        message.userId,
        conversationId,
        llmResponse.content,
        'assistant'
      );

      // 8. Actualizar metadata del contexto
      context.metadata = {
        ...context.metadata,
        lastInteraction: new Date(),
        relevantDocuments: searchResults.map(doc => doc.documentId)
      };
      await this.contextManager.saveContext(context);

      // 9. Formatear y devolver respuesta
      return {
        content: llmResponse.content,
        type: 'text',
        threadId: message.threadId,
        metadata: {
          ...llmResponse.metadata,
          source: 'LLM con contexto',
          conversationId,
          docsFound: searchResults.length,
          confidence: llmResponse.metadata?.confidence || 0.85
        }
      };
    } catch (error) {
      this.logger.error('Error procesando pregunta:', error);
      return {
        content: '❌ Lo siento, ocurrió un error al procesar tu pregunta. Por favor, inténtalo de nuevo.',
        type: 'text',
        metadata: {
          source: 'Sistema',
          confidence: 0,
          hasError: true
        }
      };
    }
  }

  private async searchRelevantDocuments(question: string): Promise<SearchResult[]> {
    try {
      // Buscar en todos los espacios disponibles
      const results = await this.knowledgePort.searchKnowledge(question);
      
      // Ordenar por relevancia y limitar resultados
      return results
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, this.MAX_RELEVANT_DOCS);
    } catch (error) {
      this.logger.error('Error buscando documentos relevantes:', error);
      return [];
    }
  }

  private enhanceMessageWithContext(
    message: Message, 
    searchResults: SearchResult[],
    context: ConversationContext
  ): Message {
    // Crear una copia del mensaje para no modificar el original
    const enhancedMessage: Message = { ...message };
    
    // Construir prompt mejorado con contexto de conversación y documentos relevantes
    let enhancedContent = message.content;
    
    // Agregar documentos relevantes como contexto
    if (searchResults && searchResults.length > 0) {
      enhancedContent = `
Pregunta: ${message.content}

Contexto basado en documentos relacionados:
${searchResults.map((doc, index) => 
  `Documento ${index + 1} - ${doc.title}:
  ${doc.content.substring(0, 300)}...
  `
).join('\n')}

Basándote en el contexto proporcionado y tu conocimiento general, responde a la siguiente pregunta de manera concisa y precisa:
${message.content}`;
    }

    // Si hay contexto de conversación previo, incluirlo en el prompt
    if (context && context.messages && context.messages.length > 0) {
      // Obtener los últimos 5 mensajes (o menos si no hay tantos)
      const recentMessages = context.messages.slice(-5);
      
      // Añadir historial de conversación al prompt si hay mensajes previos
      if (recentMessages.length > 0) {
        enhancedContent = `
Historial de conversación:
${recentMessages.map(msg => `${msg.role === 'user' ? 'Usuario' : 'Asistente'}: ${msg.content}`).join('\n')}

Nueva pregunta: ${message.content}

${searchResults.length > 0 ? 'Basándote en el contexto de la conversación, los documentos proporcionados y tu conocimiento general, ' : 'Basándote en el contexto de la conversación y tu conocimiento general, '}responde a la pregunta de manera concisa y precisa.`;
      }
    }
    
    enhancedMessage.content = enhancedContent;
    return enhancedMessage;
  }
} 