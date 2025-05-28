import { Logger } from 'winston';
import { Message } from '../../domain/models/Message';

export interface SummaryValidationResult {
    isValid: boolean;
    error?: string;
    type?: 'url' | 'pdf' | 'file_attachment';
    content?: string;
    fileInfo?: {
        id: string;
        name: string;
        url: string;
        size: number;
        mimetype: string;
    };
    metadata?: {
        isConfluence?: boolean;
        domain?: string;
        requestedLanguage?: 'es' | 'en';
        hasLanguageParam?: boolean;
    };
}

export class SummaryCommand {
    private readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    private readonly SUPPORTED_MIME_TYPES = [
        'application/pdf',
        'text/plain',
        'text/html',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    private readonly CONFLUENCE_DOMAINS = [
        'atlassian.net',
        'confluence.com',
        'jira.com'
    ];

    constructor(private readonly logger: Logger) {}

    async validate(message: Message): Promise<SummaryValidationResult> {
        try {
            const content = message.content?.trim() || '';
            
            this.logger.info('Iniciando validación de comando summary:', {
                hasContent: !!content,
                contentLength: content.length,
                hasMetadata: !!message.metadata,
                userId: message.userId
            });
            
            // PRIORIDAD 1: Verificar si hay archivos adjuntos PRIMERO
            const fileInfo = this.extractFileInfo(message);
            
            if (fileInfo) {
                this.logger.info('Archivo detectado - procesando con prioridad alta:', {
                    fileName: fileInfo.name,
                    fileSize: fileInfo.size,
                    mimetype: fileInfo.mimetype,
                    priority: 'file_over_url'
                });
                
                // Validar el archivo
                const fileValidation = this.validateFile(fileInfo);
                if (!fileValidation.isValid) {
                    this.logger.warn('Archivo detectado pero no válido:', {
                        fileName: fileInfo.name,
                        error: fileValidation.error
                    });
                    return fileValidation;
                }
                
                this.logger.info('Archivo válido - comando tg-summary exitoso:', {
                    fileName: fileInfo.name,
                    fileSize: fileInfo.size,
                    mimetype: fileInfo.mimetype
                });
                
                return {
                    isValid: true,
                    type: 'file_attachment',
                    fileInfo: fileInfo,
                    content: fileInfo.url,
                    metadata: {
                        isConfluence: false, // Los archivos no son Confluence
                        domain: 'file_attachment',
                        requestedLanguage: (message.metadata?.requestedLanguage as 'es' | 'en') || 'es',
                        hasLanguageParam: message.metadata?.hasLanguageParam || false
                    }
                };
            }
            
            // PRIORIDAD 2: Si no hay archivos válidos, procesar URLs
            this.logger.info('No se encontraron archivos válidos - procesando contenido de texto/URL');
            
            // Extraer URL real si viene en formato de hipervínculo de Slack <URL|texto>
            const extractedUrl = this.extractUrlFromSlackLink(content);
            const urlToValidate = extractedUrl || content;
            
            // Caso 1: Se proporcionó una URL (directa o extraída de hipervínculo)
            if (urlToValidate && this.isValidUrl(urlToValidate)) {
                const isConfluence = this.isConfluenceUrl(urlToValidate);
                
                this.logger.info('Comando tg-summary válido con URL:', { 
                    originalContent: content,
                    extractedUrl: urlToValidate,
                    user: message.userId,
                    isConfluence 
                });
                
                return {
                    isValid: true,
                    type: 'url',
                    content: urlToValidate,
                    metadata: {
                        isConfluence,
                        domain: this.extractDomain(urlToValidate),
                        requestedLanguage: (message.metadata?.requestedLanguage as 'es' | 'en') || 'es',
                        hasLanguageParam: message.metadata?.hasLanguageParam || false
                    }
                };
            }

            // Caso 2: Se proporcionó texto pero no es una URL válida ni contiene hipervínculo
            if (content && !this.isValidUrl(content) && !extractedUrl) {
                return {
                    isValid: false,
                    error: '❌ *URL no válida*\n\nPor favor proporciona una URL válida (debe comenzar con http:// o https://) o sube un archivo y usa el comando inmediatamente después.\n\n*Ejemplos válidos:*\n• `/tg-summary https://confluence.empresa.com/display/DOC/page`\n• *Subir archivo → usar `/tg-summary` sin texto*\n• *Pegar enlace de Confluence directamente*'
                };
            }

            // Caso 3: No se proporcionó texto ni archivos
            if (!content) {
                return {
                    isValid: false,
                    error: '📄 *Para generar un resumen, debes proporcionar:*\n\n*Una URL válida (especialmente de Confluence):*\n• `/tg-summary https://confluence.empresa.com/display/DOC/page`\n• *Pegar enlace de Confluence directamente*\n\n*O un archivo:*\n1. Sube un archivo PDF, Word o texto al canal\n2. Usa `/tg-summary` inmediatamente después\n\n*Formatos soportados:* PDF, Word (.docx), Texto (.txt), HTML'
                };
            }

            return {
                isValid: false,
                error: 'Formato de entrada no reconocido. Por favor, proporciona una URL válida o sube un archivo.'
            };

        } catch (error) {
            this.logger.error('Error en validación de comando summary:', error);
            return {
                isValid: false,
                error: 'Lo siento, hubo un error al validar tu solicitud. Por favor, inténtalo de nuevo.'
            };
        }
    }

    private isValidUrl(text: string): boolean {
        try {
            const url = new URL(text);
            return ['http:', 'https:'].includes(url.protocol);
        } catch {
            return false;
        }
    }

    private isConfluenceUrl(text: string): boolean {
        try {
            const url = new URL(text);
            return this.CONFLUENCE_DOMAINS.some(domain => 
                url.hostname.includes(domain) || url.hostname.endsWith(domain)
            );
        } catch {
            return false;
        }
    }

    private extractDomain(url: string): string {
        try {
            return new URL(url).hostname;
        } catch {
            return 'unknown';
        }
    }

    private extractFileInfo(message: Message): any {
        // Intentar extraer información de archivos desde diferentes fuentes
        
        // 1. Desde metadatos del mensaje
        if (message.metadata?.files && Array.isArray(message.metadata.files) && message.metadata.files.length > 0) {
            return message.metadata.files[0];
        }
        
        // 2. Desde metadatos de Slack (si están disponibles)
        if (message.metadata?.slackFiles && Array.isArray(message.metadata.slackFiles) && message.metadata.slackFiles.length > 0) {
            const slackFile = message.metadata.slackFiles[0];
            return {
                id: slackFile.id,
                name: slackFile.name,
                url: slackFile.url_private || slackFile.permalink,
                size: slackFile.size,
                mimetype: slackFile.mimetype
            };
        }

        // NOTA: Eliminamos la detección de URLs de Slack como archivos
        // ya que interfiere con el procesamiento normal de URLs
        // Las URLs de Slack deben procesarse como URLs, no como archivos

        return null;
    }

    private validateFile(fileInfo: any): SummaryValidationResult {
        // Validar tamaño del archivo
        if (fileInfo.size && fileInfo.size > this.MAX_FILE_SIZE) {
            return {
                isValid: false,
                error: `❌ *Archivo demasiado grande*\n\nEl archivo "${fileInfo.name}" es demasiado grande. Tamaño máximo permitido: ${this.MAX_FILE_SIZE / (1024 * 1024)}MB\n\nTamaño actual: ${(fileInfo.size / (1024 * 1024)).toFixed(2)}MB`
            };
        }

        // Validar tipo de archivo
        if (fileInfo.mimetype && !this.SUPPORTED_MIME_TYPES.includes(fileInfo.mimetype)) {
            return {
                isValid: false,
                error: `❌ *Tipo de archivo no soportado*\n\nEl archivo "${fileInfo.name}" tiene un formato no soportado.\n\n*Formatos soportados:*\n• PDF (.pdf)\n• Word (.docx)\n• Texto (.txt)\n• HTML (.html)\n\n*Formato detectado:* ${fileInfo.mimetype}`
            };
        }

        // Validar por extensión si no hay mimetype
        if (!fileInfo.mimetype && fileInfo.name) {
            const extension = fileInfo.name.toLowerCase().split('.').pop();
            const supportedExtensions = ['pdf', 'docx', 'doc', 'txt', 'html', 'htm'];
            
            if (!extension || !supportedExtensions.includes(extension)) {
                return {
                    isValid: false,
                    error: `❌ *Extensión de archivo no soportada*\n\nEl archivo "${fileInfo.name}" no tiene una extensión reconocida.\n\n*Extensiones soportadas:* ${supportedExtensions.join(', ')}`
                };
            }
        }

        return { isValid: true };
    }

    private extractUrlFromSlackLink(text: string): string | null {
        this.logger.info('Analizando texto para extraer URL:', { text });
        
        // Método 1: Detectar formato de hipervínculo de Slack: <URL|texto> o <URL>
        const slackLinkPattern = /<(https?:\/\/[^|>]+)(?:\|[^>]+)?>/;
        const slackMatch = text.match(slackLinkPattern);
        
        if (slackMatch && slackMatch[1]) {
            this.logger.info('URL extraída de hipervínculo de Slack:', {
                originalText: text,
                extractedUrl: slackMatch[1],
                method: 'slack_hyperlink'
            });
            return slackMatch[1];
        }
        
        // Método 2: WORKAROUND - Buscar URLs directamente en el texto plano
        // Esto maneja el caso donde Slack convierte hipervínculos a texto plano
        const urlPattern = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi;
        const urlMatches = text.match(urlPattern);
        
        if (urlMatches && urlMatches.length > 0) {
            const foundUrl = urlMatches[0]; // Tomar la primera URL encontrada
            this.logger.info('URL extraída de texto plano:', {
                originalText: text,
                extractedUrl: foundUrl,
                method: 'text_extraction',
                allMatches: urlMatches
            });
            return foundUrl;
        }
        
        // Método 3: WORKAROUND ADICIONAL - Buscar patrones específicos de Confluence
        // Buscar texto que contenga dominios conocidos de Confluence
        const confluenceDomainPattern = /([a-zA-Z0-9.-]+\.(?:atlassian\.net|confluence\.com|jira\.com)[^\s]*)/gi;
        const domainMatches = text.match(confluenceDomainPattern);
        
        if (domainMatches && domainMatches.length > 0) {
            // Construir URL completa si no tiene protocolo
            let potentialUrl = domainMatches[0];
            if (!potentialUrl.startsWith('http')) {
                potentialUrl = 'https://' + potentialUrl;
            }
            
            this.logger.info('URL de Confluence extraída por dominio:', {
                originalText: text,
                extractedUrl: potentialUrl,
                method: 'domain_extraction',
                allMatches: domainMatches
            });
            return potentialUrl;
        }
        
        this.logger.info('No se encontró URL en el texto:', { text });
        return null;
    }
} 