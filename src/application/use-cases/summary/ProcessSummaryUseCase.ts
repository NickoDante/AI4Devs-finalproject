import { Message } from '../../../domain/models/Message';
import { BotResponse } from '../../../domain/models/BotResponse';
import { PDFPort } from '../../../domain/ports/PDFPort';
import { AIAdapter } from '../../../domain/ports/AIAdapter';
import { Logger } from 'winston';
import { CachePort } from '../../../domain/ports/CachePort';
import { KnowledgePort } from '../../../domain/ports/KnowledgePort';
import * as https from 'https';
import * as http from 'http';

export interface SummaryRequest {
  type: 'url' | 'pdf_buffer' | 'pdf_url';
  content: string | Buffer;
  metadata?: {
    fileName?: string;
    fileSize?: number;
    userId?: string;
    channel?: string;
  };
}

export interface SummaryOptions {
  maxLength?: number;
  language?: 'es' | 'en';
  includeMetadata?: boolean;
  format?: 'structured' | 'paragraph' | 'bullet_points';
}

export class ProcessSummaryUseCase {
  private readonly DEFAULT_MAX_LENGTH = 500;
  private readonly CACHE_TTL = 3600; // 1 hora en segundos

  constructor(
    private readonly pdfAdapter: PDFPort,
    private readonly aiAdapter: AIAdapter,
    private readonly cache: CachePort,
    private readonly logger: Logger,
    private readonly confluenceAdapter?: KnowledgePort
  ) {}

  async execute(message: Message, summaryRequest: SummaryRequest, options?: SummaryOptions): Promise<BotResponse> {
    const startTime = Date.now();
    
    try {
      this.logger.info('Iniciando procesamiento de resumen:', {
        type: summaryRequest.type,
        userId: message.userId,
        options
      });

      // Detectar idioma basado en el mensaje y metadata
      const language = this.detectLanguage(message, options?.language);
      const finalOptions = {
        ...options,
        language
      };

      // Generar clave de caché
      const cacheKey = this.generateCacheKey(summaryRequest);
      
      // Verificar caché
      const cachedResult = await this.getCachedSummary(cacheKey);
      if (cachedResult) {
        this.logger.info('Resumen encontrado en caché');
        return this.translateCachedResponse(cachedResult, language);
      }

      // Extraer contenido según el tipo
      let extractedContent: string;
      let metadata: any = {};

      switch (summaryRequest.type) {
        case 'url':
          const urlResult = await this.extractContentFromUrl(summaryRequest.content as string);
          extractedContent = urlResult.content;
          metadata = urlResult.metadata;
          break;

        case 'pdf_buffer':
          const bufferResult = await this.pdfAdapter.extractFromBuffer(summaryRequest.content as Buffer);
          if (!bufferResult.success) {
            throw new Error(bufferResult.error || 'Error procesando PDF');
          }
          extractedContent = bufferResult.content!.text;
          metadata = bufferResult.content!.metadata;
          break;

        case 'pdf_url':
          const pdfUrlResult = await this.pdfAdapter.extractFromUrl(summaryRequest.content as string);
          if (!pdfUrlResult.success) {
            throw new Error(pdfUrlResult.error || 'Error descargando PDF');
          }
          extractedContent = pdfUrlResult.content!.text;
          metadata = pdfUrlResult.content!.metadata;
          break;

        default:
          throw new Error(`Tipo de resumen no soportado: ${summaryRequest.type}`);
      }

      // Validar que hay contenido para resumir
      if (!extractedContent || extractedContent.trim().length < 100) {
        return {
          content: '❌ *Error al generar resumen*\n\nEl documento no contiene suficiente contenido de texto para generar un resumen útil.',
          type: 'text',
          metadata: {
            source: 'Sistema de resúmenes',
            confidence: 0,
            error: true
          }
        };
      }

      // Generar resumen usando IA
      const summary = await this.generateSummary(extractedContent, finalOptions);

      // Crear respuesta
      const response: BotResponse = {
        content: this.formatSummaryResponse(summary, metadata, summaryRequest.type, finalOptions),
        type: 'text',
        metadata: {
          source: this.getSourceDescription(summaryRequest.type, metadata),
          confidence: 0.85,
          processingTime: Date.now() - startTime,
          documentType: summaryRequest.type,
          originalLength: extractedContent.length,
          summaryLength: summary.length,
          language
        }
      };

      // Guardar en caché
      await this.setCachedSummary(cacheKey, response);

      this.logger.info('Resumen generado exitosamente:', {
        type: summaryRequest.type,
        originalLength: extractedContent.length,
        summaryLength: summary.length,
        processingTime: Date.now() - startTime
      });

      return response;

    } catch (error) {
      this.logger.error('Error procesando resumen:', error);
      
      return {
        content: `❌ *Error al generar resumen*\n\n${error instanceof Error ? error.message : 'Error desconocido al procesar el documento.'}`,
        type: 'text',
        metadata: {
          source: 'Sistema de resúmenes',
          confidence: 0,
          error: true,
          processingTime: Date.now() - startTime
        }
      };
    }
  }

  private async extractContentFromUrl(url: string): Promise<{ content: string; metadata: any }> {
    // NUEVO: Detectar si es una URL de Confluence y usar ConfluenceAdapter
    if (this.isConfluenceUrl(url) && this.confluenceAdapter) {
      this.logger.info('URL de Confluence detectada - usando ConfluenceAdapter autenticado:', { url });
      
      try {
        // Extraer el ID de la página de Confluence desde la URL
        const pageId = this.extractConfluencePageId(url);
        
        if (pageId) {
          this.logger.info('Extrayendo contenido de Confluence con autenticación:', { pageId, url });
          
          // Usar ConfluenceAdapter para obtener el contenido autenticado
          const document = await this.confluenceAdapter.getDocument(pageId);
          
          if (document) {
            // Extraer texto limpio del contenido HTML de Confluence
            const cleanContent = this.extractTextFromHtml(document.content);
            
            return {
              content: cleanContent,
              metadata: {
                url: document.url,
                originalUrl: url,
                title: document.title,
                author: document.author,
                contentLength: cleanContent.length,
                source: document.source,
                spaceKey: document.metadata?.spaceKey,
                version: document.metadata?.version,
                isConfluence: true
              }
            };
          }
        }
        
        // Si no se pudo extraer el ID o no se encontró el documento, continuar con método HTTP
        this.logger.warn('No se pudo extraer contenido usando ConfluenceAdapter, intentando método HTTP:', { url });
      } catch (error) {
        this.logger.error('Error usando ConfluenceAdapter, fallback a método HTTP:', error);
      }
    }

    // Método HTTP original para URLs no-Confluence o como fallback
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https:') ? https : http;
      
      const makeRequest = (requestUrl: string, redirectCount: number = 0): void => {
        // Prevenir redirecciones infinitas
        if (redirectCount > 5) {
          reject(new Error('Demasiadas redirecciones. Verifica la URL.'));
          return;
        }

        const request = client.get(requestUrl, (response) => {
          // Manejar redirecciones (301, 302, 303, 307, 308)
          if (response.statusCode && [301, 302, 303, 307, 308].includes(response.statusCode)) {
            const location = response.headers.location;
            if (location) {
              this.logger.info(`Siguiendo redirección ${response.statusCode} a: ${location}`);
              // Si la location es relativa, construir URL absoluta
              const redirectUrl = location.startsWith('http') ? location : new URL(location, requestUrl).toString();
              makeRequest(redirectUrl, redirectCount + 1);
              return;
            } else {
              reject(new Error(`Redirección ${response.statusCode} sin header Location`));
              return;
            }
          }

          // Verificar códigos de error reales
          if (response.statusCode && response.statusCode >= 400) {
            reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
            return;
          }

          // Códigos de éxito (200-299)
          if (!response.statusCode || response.statusCode < 200 || response.statusCode >= 300) {
            reject(new Error(`Código de estado inesperado: ${response.statusCode}`));
            return;
          }

          let data = '';
          response.on('data', (chunk) => {
            data += chunk;
          });

          response.on('end', () => {
            try {
              // Extraer texto básico del HTML (implementación simplificada)
              const textContent = this.extractTextFromHtml(data);
              
              if (!textContent || textContent.trim().length < 50) {
                reject(new Error('El contenido extraído es demasiado corto o vacío'));
                return;
              }

              resolve({
                content: textContent,
                metadata: {
                  url: requestUrl,
                  originalUrl: url,
                  title: this.extractTitleFromHtml(data),
                  contentLength: textContent.length,
                  redirectCount: redirectCount,
                  isConfluence: false
                }
              });
            } catch (error) {
              reject(new Error(`Error procesando contenido: ${error instanceof Error ? error.message : 'Error desconocido'}`));
            }
          });
        });

        request.on('error', (error) => {
          reject(new Error(`Error de conexión: ${error.message}`));
        });

        request.setTimeout(30000, () => {
          request.destroy();
          reject(new Error('Timeout al descargar contenido (30s)'));
        });
      };

      makeRequest(url);
    });
  }

  private extractTextFromHtml(html: string): string {
    // Implementación básica para extraer texto de HTML
    return html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private extractTitleFromHtml(html: string): string {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    return titleMatch ? titleMatch[1].trim() : 'Documento web';
  }

  private async generateSummary(content: string, options?: SummaryOptions): Promise<string> {
    const maxLength = options?.maxLength || this.DEFAULT_MAX_LENGTH;
    const language = options?.language || 'es';
    const format = options?.format || 'structured';

    const prompt = this.buildSummaryPrompt(content, maxLength, language, format);
    
    try {
      // Crear un mensaje temporal para el AI adapter
      const tempMessage: Message = {
        content: prompt,
        userId: 'system',
        username: 'Sistema de resúmenes',
        channel: 'summary',
        timestamp: new Date(),
        type: 'command',
        metadata: { command: 'summary' }
      };

      const aiResponse = await this.aiAdapter.processMessage(tempMessage);
      return aiResponse.content;
    } catch (error) {
      this.logger.error('Error generando resumen con IA:', error);
      // Fallback: resumen básico por truncamiento
      return this.generateBasicSummary(content, maxLength);
    }
  }

  private buildSummaryPrompt(content: string, maxLength: number, language: string, format: string): string {
    const languageInstructions = language === 'en' 
      ? 'You are TG-TheGuardian, an AI assistant with a friendly and professional personality. Respond in English.' 
      : 'Eres TG-TheGuardian, un asistente de IA con personalidad amigable y profesional. Responde en español.';

    const formatInstructions = {
      'structured': language === 'en' 
        ? 'Create a concise and engaging summary that captures the key points and main message of the document. Focus on what\'s most relevant and impactful.'
        : 'Crea un resumen conciso y atractivo que capture los puntos clave y el mensaje principal del documento. Enfócate en lo más relevante e impactante.',
      'paragraph': language === 'en'
        ? 'Write a fluid and engaging summary that tells the story of the document in a natural way. Focus on the main narrative and key takeaways.'
        : 'Escribe un resumen fluido y atractivo que cuente la historia del documento de manera natural. Enfócate en la narrativa principal y las conclusiones clave.',
      'bullet_points': language === 'en'
        ? 'Extract and present the most important information in clear, impactful bullet points. Focus on actionable insights and key findings.'
        : 'Extrae y presenta la información más importante en puntos clave claros e impactantes. Enfócate en conclusiones accionables y hallazgos clave.'
    };

    const personalityInstructions = language === 'en'
      ? 'Use a professional yet friendly tone. Be clear and direct, but maintain an engaging style that makes the information accessible and interesting.'
      : 'Usa un tono profesional pero amigable. Sé claro y directo, pero mantén un estilo atractivo que haga la información accesible e interesante.';

    return `${languageInstructions}

${personalityInstructions}

${formatInstructions[format as keyof typeof formatInstructions]}

Generate a summary of the following document in no more than ${maxLength} words:

${content.substring(0, 4000)} ${content.length > 4000 ? '...' : ''}`;
  }

  private generateBasicSummary(content: string, maxLength: number): string {
    // Fallback básico: tomar las primeras oraciones hasta el límite de palabras
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    let summary = '';
    let wordCount = 0;

    for (const sentence of sentences) {
      const words = sentence.trim().split(/\s+/);
      if (wordCount + words.length > maxLength) break;
      
      summary += sentence.trim() + '. ';
      wordCount += words.length;
    }

    return summary.trim() || 'No se pudo generar un resumen del contenido.';
  }

  private formatSummaryResponse(summary: string, metadata: any, type: string, options?: SummaryOptions): string {
    const documentType = type === 'url' ? '🌐 Página Web' : '📄 Documento PDF';
    const title = metadata.title || metadata.fileName || 'Documento';
    
    let response = `${documentType} *${title}*\n\n`;
    response += `📝 **Resumen:**\n${summary}\n\n`;
    
    if (options?.includeMetadata && metadata) {
      response += `📊 **Información del documento:**\n`;
      
      if (metadata.pages) {
        response += `• Páginas: ${metadata.pages}\n`;
      }
      
      if (metadata.author) {
        response += `• Autor: ${metadata.author}\n`;
      }
      
      if (metadata.fileSize) {
        const sizeInMB = (metadata.fileSize / (1024 * 1024)).toFixed(2);
        response += `• Tamaño: ${sizeInMB} MB\n`;
      }
      
      if (metadata.url) {
        response += `• URL: ${metadata.url}\n`;
      }
    }

    return response;
  }

  private getSourceDescription(type: string, metadata: any): string {
    switch (type) {
      case 'url':
        return `Página web: ${metadata.url || 'URL proporcionada'}`;
      case 'pdf_buffer':
      case 'pdf_url':
        return `Documento PDF: ${metadata.fileName || metadata.title || 'Archivo PDF'}`;
      default:
        return 'Documento procesado';
    }
  }

  private generateCacheKey(request: SummaryRequest): string {
    if (request.type === 'url') {
      return `summary:url:${Buffer.from(request.content as string).toString('base64')}`;
    } else {
      // Para PDFs, usar hash del contenido si es posible, o metadatos
      const identifier = request.metadata?.fileName || 'pdf';
      return `summary:pdf:${identifier}:${Date.now()}`;
    }
  }

  private async getCachedSummary(cacheKey: string): Promise<BotResponse | null> {
    try {
      const cached = await this.cache.get<string>(cacheKey);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      this.logger.warn('Error obteniendo resumen del caché:', error);
      return null;
    }
  }

  private async setCachedSummary(cacheKey: string, response: BotResponse): Promise<void> {
    try {
      await this.cache.set(cacheKey, JSON.stringify(response), { ttl: this.CACHE_TTL });
    } catch (error) {
      this.logger.warn('Error guardando resumen en caché:', error);
    }
  }

  // NUEVO: Método para detectar URLs de Confluence
  private isConfluenceUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.includes('atlassian.net') || 
             urlObj.hostname.includes('confluence.com') ||
             urlObj.pathname.includes('/wiki/') ||
             urlObj.pathname.includes('/display/');
    } catch {
      return false;
    }
  }

  // NUEVO: Método para extraer ID de página de Confluence desde URL
  private extractConfluencePageId(url: string): string | null {
    try {
      // Patrones comunes de URLs de Confluence:
      // https://domain.atlassian.net/wiki/spaces/SPACE/pages/123456/Page+Title
      // https://domain.atlassian.net/display/SPACE/Page+Title
      
      const pageIdMatch = url.match(/\/pages\/(\d+)/);
      if (pageIdMatch && pageIdMatch[1]) {
        return pageIdMatch[1];
      }
      
      // Si no se encuentra el patrón de ID, intentar buscar por título
      // (esto requeriría una búsqueda adicional en Confluence)
      this.logger.warn('No se pudo extraer ID de página de la URL de Confluence:', { url });
      return null;
    } catch (error) {
      this.logger.error('Error extrayendo ID de página de Confluence:', error);
      return null;
    }
  }

  private detectLanguage(message: Message, defaultLanguage?: string): 'es' | 'en' {
    // Si se especificó un idioma en las opciones, usarlo
    if (defaultLanguage) {
      return defaultLanguage as 'es' | 'en';
    }

    // Detectar por metadata del mensaje
    if (message.metadata?.requestedLanguage) {
      return message.metadata.requestedLanguage as 'es' | 'en';
    }

    // Detectar por el comando usado
    if (message.metadata?.command === 'summary') {
      const content = message.content?.toLowerCase() || '';
      if (content.includes('summary') || content.includes('resume')) {
        return 'en';
      }
      if (content.includes('resumen')) {
        return 'es';
      }
    }

    // Por defecto, español
    return 'es';
  }

  private translateCachedResponse(response: BotResponse, targetLanguage: 'es' | 'en'): BotResponse {
    // Si el idioma coincide, devolver tal cual
    if (response.metadata?.language === targetLanguage) {
      return response;
    }

    // Traducir los encabezados según el idioma
    const headers = {
      'es': {
        webPage: '🌐 Página Web',
        pdfDoc: '📄 Documento PDF',
        docInfo: '📊 Información del documento',
        pages: 'Páginas',
        author: 'Autor',
        size: 'Tamaño',
        url: 'URL'
      },
      'en': {
        webPage: '🌐 Web Page',
        pdfDoc: '📄 PDF Document',
        docInfo: '📊 Document Information',
        pages: 'Pages',
        author: 'Author',
        size: 'Size',
        url: 'URL'
      }
    };

    const h = headers[targetLanguage];
    let content = response.content;

    // Traducir encabezados
    if (targetLanguage === 'en') {
      content = content
        .replace(/🌐 Página Web/g, h.webPage)
        .replace(/📄 Documento PDF/g, h.pdfDoc)
        .replace(/📊 Información del documento/g, h.docInfo)
        .replace(/• Páginas:/g, `• ${h.pages}:`)
        .replace(/• Autor:/g, `• ${h.author}:`)
        .replace(/• Tamaño:/g, `• ${h.size}:`)
        .replace(/• URL:/g, `• ${h.url}:`);
    } else {
      content = content
        .replace(/🌐 Web Page/g, h.webPage)
        .replace(/📄 PDF Document/g, h.pdfDoc)
        .replace(/📊 Document Information/g, h.docInfo)
        .replace(/• Pages:/g, `• ${h.pages}:`)
        .replace(/• Author:/g, `• ${h.author}:`)
        .replace(/• Size:/g, `• ${h.size}:`)
        .replace(/• URL:/g, `• ${h.url}:`);
    }

    return {
      ...response,
      content,
      metadata: {
        ...response.metadata,
        language: targetLanguage
      }
    };
  }
} 