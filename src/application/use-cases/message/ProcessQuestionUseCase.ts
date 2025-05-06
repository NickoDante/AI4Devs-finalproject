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
  private readonly MAX_RELEVANT_DOCS = 5;
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

      // 9. Calcular confianza basada en la calidad de los resultados
      const confidence = this.calculateConfidence(searchResults, llmResponse);
      
      // 10. Obtener fuentes para la respuesta
      const sources = this.extractSources(searchResults);

      // 11. Formatear y devolver respuesta
      return {
        content: llmResponse.content,
        type: 'text',
        threadId: message.threadId,
        metadata: {
          ...llmResponse.metadata,
          source: sources.mainSource,
          sourceUrl: sources.sourceUrl,
          conversationId,
          docsFound: searchResults.length,
          confidence: confidence,
          contextSources: sources.additionalSources
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
    
    // Detectar el idioma de la pregunta
    const language = this.detectLanguage(message.content);
    
    // Construir las diferentes partes del prompt
    const documentsContext = this.getDocumentsContext(message.content, searchResults);
    const conversationHistory = this.getConversationHistory(message.content, context, searchResults.length > 0);
    const promptBase = this.getBasePrompt(message.content, language);
    
    // Usar el contexto más completo disponible 
    let enhancedContent = promptBase;
    if (documentsContext) {
      enhancedContent = documentsContext;
    }
    if (conversationHistory) {
      enhancedContent = conversationHistory;
    }
    
    enhancedMessage.content = enhancedContent;
    return enhancedMessage;
  }
  
  // Detectar el idioma de la pregunta
  private detectLanguage(text: string): string {
    // Detección simple basada en caracteres y palabras comunes
    const spanishPattern = /([áéíóúüñ¿¡]|(\bde\b|\bla\b|\bel\b|\ben\b|\bcon\b|\bpor\b|\bpara\b|\bcomo\b|\bquien\b|\bcual\b|\bcuando\b|\bdonde\b))/i;
    const englishPattern = /(\bthe\b|\bis\b|\bare\b|\bwas\b|\bwere\b|\bwill\b|\bcan\b|\bcould\b|\bshould\b|\bwould\b|\bhow\b|\bwhen\b|\bwhere\b|\bwhy\b|\bwhat\b)/i;
    
    if (spanishPattern.test(text)) return 'es';
    if (englishPattern.test(text)) return 'en';
    
    // Por defecto, devolver español
    return 'es';
  }
  
  // Obtener instrucciones según el idioma
  private getLanguageInstructions(language: string): string {
    switch (language) {
      case 'en':
        return `
IMPORTANT: Your answer should be in ENGLISH, matching the language of the question. Make sure your response is clear, direct, and complete.`;
      case 'es':
      default:
        return `
IMPORTANTE: Tu respuesta DEBE ser en ESPAÑOL, coincidiendo con el idioma de la pregunta. Asegúrate de que tu respuesta sea clara, directa y completa.`;
    }
  }
  
  // Obtener el prompt base según el idioma
  private getBasePrompt(question: string, language: string): string {
    const languageInstructions = this.getLanguageInstructions(language);
    
    if (language === 'en') {
      return `
Question: ${question}

Please answer this question concisely and accurately based on your general knowledge.${languageInstructions}`;
    }
    
    // Español por defecto
    return `
Pregunta: ${question}

Por favor, responde a esta pregunta de manera concisa y precisa, basándote en tu conocimiento general.${languageInstructions}`;
  }
  
  // Preparar contexto de documentos relevantes
  private getDocumentsContext(question: string, searchResults: SearchResult[]): string | null {
    if (!searchResults || searchResults.length === 0) {
      return null;
    }
    
    const language = this.detectLanguage(question);
    const languageInstructions = this.getLanguageInstructions(language);
    
    // Construir instrucciones específicas para priorizar Confluence
    const priorityInstructions = language === 'en' 
      ? `
IMPORTANT INSTRUCTIONS:
1. Your answer MUST be based primarily on the provided document content from Confluence.
2. ONLY use your general knowledge when the documents don't contain relevant information.
3. When using information from the documents, include the document number as a reference (e.g., "According to Document 1...").
4. If the documents don't contain information relevant to the question, clearly state this before providing a general answer.
5. Keep your answers concise and directly address the question.`
      : `
INSTRUCCIONES IMPORTANTES:
1. Tu respuesta DEBE basarse principalmente en el contenido de los documentos de Confluence proporcionados.
2. SOLO usa tu conocimiento general cuando los documentos no contengan información relevante.
3. Cuando uses información de los documentos, incluye el número del documento como referencia (ej. "Según el Documento 1...").
4. Si los documentos no contienen información relevante para la pregunta, indica esto claramente antes de proporcionar una respuesta general.
5. Mantén tus respuestas concisas y aborda directamente la pregunta.`;
    
    if (language === 'en') {
      return `
Question: ${question}

Context based on related Confluence documents:
${searchResults.map((doc, index) => 
  `Document ${index + 1} - "${doc.title}" (URL: ${doc.url || 'N/A'}):
  ${doc.content.substring(0, 500)}...
  `
).join('\n')}

${priorityInstructions}

Based on the provided Confluence documents and following the instructions above, answer the following question concisely and accurately:
${question}${languageInstructions}`;
    }
    
    // Español por defecto
    return `
Pregunta: ${question}

Contexto basado en documentos de Confluence relacionados:
${searchResults.map((doc, index) => 
  `Documento ${index + 1} - "${doc.title}" (URL: ${doc.url || 'N/A'}):
  ${doc.content.substring(0, 500)}...
  `
).join('\n')}

${priorityInstructions}

Basándote en los documentos de Confluence proporcionados y siguiendo las instrucciones anteriores, responde a la siguiente pregunta de manera concisa y precisa:
${question}${languageInstructions}`;
  }
  
  // Preparar contexto de conversación previa
  private getConversationHistory(question: string, context: ConversationContext, hasDocuments: boolean): string | null {
    if (!context?.messages?.length) {
      return null;
    }
    
    // Obtener los últimos 5 mensajes (o menos si no hay tantos)
    const recentMessages = context.messages.slice(-5);
    if (recentMessages.length === 0) {
      return null;
    }
    
    const language = this.detectLanguage(question);
    const languageInstructions = this.getLanguageInstructions(language);
    
    // Construir instrucciones específicas para priorizar Confluence también en el historial
    const priorityInstructions = language === 'en' 
      ? `
IMPORTANT: When documents from Confluence are provided, base your answer primarily on those documents. Only use general knowledge when necessary and clearly indicate when you do so.`
      : `
IMPORTANTE: Cuando se proporcionen documentos de Confluence, basa tu respuesta principalmente en esos documentos. Solo usa conocimiento general cuando sea necesario e indica claramente cuando lo hagas.`;
    
    if (language === 'en') {
      return `
Conversation history:
${recentMessages.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n')}

New question: ${question}

${hasDocuments ? 'Based on the conversation context, the provided Confluence documents, and only when necessary your general knowledge, ' : 'Based on the conversation context and your general knowledge, '}answer the question concisely and accurately.

${hasDocuments ? priorityInstructions : ''}${languageInstructions}`;
    }
    
    // Español por defecto
    return `
Historial de conversación:
${recentMessages.map(msg => `${msg.role === 'user' ? 'Usuario' : 'Asistente'}: ${msg.content}`).join('\n')}

Nueva pregunta: ${question}

${hasDocuments ? 'Basándote en el contexto de la conversación, los documentos de Confluence proporcionados, y solo cuando sea necesario tu conocimiento general, ' : 'Basándote en el contexto de la conversación y tu conocimiento general, '}responde a la pregunta de manera concisa y precisa.

${hasDocuments ? priorityInstructions : ''}${languageInstructions}`;
  }

  // Método para calcular la confianza basada en los resultados de búsqueda y la respuesta del LLM
  private calculateConfidence(searchResults: SearchResult[], llmResponse: BotResponse): number {
    // Si no hay resultados de búsqueda, confianza base de 0.5 (conocimiento general)
    if (!searchResults || searchResults.length === 0) {
      return 0.5;
    }
    
    // Verificar si la respuesta cita explícitamente los documentos
    const responseText = llmResponse.content.toLowerCase();
    const containsDocumentReferences = searchResults.some((doc, index) => {
      const docNumber = index + 1;
      return responseText.includes(`documento ${docNumber}`) || 
             responseText.includes(`document ${docNumber}`) ||
             responseText.includes(doc.title.toLowerCase()) ||
             (doc.url && responseText.includes(doc.url.toLowerCase()));
    });
    
    // Aumentar la confianza si la respuesta cita los documentos
    const citationBonus = containsDocumentReferences ? 0.2 : 0;
    
    // Calcular la relevancia promedio de los documentos encontrados (0-1)
    const avgRelevance = searchResults.reduce(
      (sum, doc) => sum + doc.relevance, 
      0
    ) / searchResults.length;
    
    // Factores que consideramos para la confianza:
    // 1. Cantidad de documentos relevantes (más es mejor, hasta cierto punto)
    const docCountFactor = Math.min(searchResults.length / this.MAX_RELEVANT_DOCS, 1) * 0.2;
    
    // 2. Relevancia promedio de los documentos (0-1)
    const relevanceFactor = avgRelevance * 0.4;
    
    // 3. Confianza reportada por el LLM si está disponible
    const llmConfidence = (llmResponse.metadata?.confidence || 0.7) * 0.2;
    
    // Combinar factores (ponderados) y redondear a 2 decimales
    const combinedConfidence = docCountFactor + relevanceFactor + llmConfidence + citationBonus;
    
    // Asegurar que el resultado esté entre 0.5 y 0.99
    return Math.min(Math.max(Math.round(combinedConfidence * 100) / 100, 0.5), 0.99);
  }
  
  // Extraer fuentes de los resultados para mostrarlas en la respuesta
  private extractSources(searchResults: SearchResult[]): { 
    mainSource: string; 
    sourceUrl?: string;
    additionalSources: Array<{ title: string; url: string }> 
  } {
    if (!searchResults || searchResults.length === 0) {
      return {
        mainSource: 'Conocimiento general',
        additionalSources: []
      };
    }
    
    // Ordenar resultados por relevancia (aunque ya deberían estarlo)
    const sortedResults = [...searchResults].sort((a, b) => b.relevance - a.relevance);
    
    // Obtener la fuente principal (el documento más relevante)
    const mainResult = sortedResults[0];
    const mainSource = mainResult.title || mainResult.source || 'Documento de Confluence';
    const sourceUrl = mainResult.metadata?.url || mainResult.url;
    
    // Preparar fuentes adicionales para metadata
    const additionalSources = sortedResults.map(result => ({
      title: result.title || result.source || 'Documento',
      url: result.metadata?.url || result.url || '#'
    }));
    
    return {
      mainSource,
      sourceUrl,
      additionalSources
    };
  }
} 