import { Logger } from 'winston';

export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

interface SlackCommandPayload {
    text?: string;
    command: string;
    user_id: string;
    channel_id: string;
    files?: Array<{
        id: string;
        name: string;
        mimetype: string;
        filetype: string;
        url_private: string;
        size: number;
    }>;
}

interface SlackRequest {
    body: SlackCommandPayload;
}

interface SlackResponse {
    json: (response: any) => Promise<void>;
}

type ValidationNextFunction = () => Promise<void>;

export class ValidationMiddleware {
    private readonly MAX_TEXT_LENGTH = 1000; // Límite razonable para el texto
    private readonly MIN_SEARCH_LENGTH = 3;
    private readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB máximo para PDFs
    private readonly SUPPORTED_PDF_TYPES = ['application/pdf', 'pdf'];
    private readonly CONFLUENCE_DOMAINS = [
        'atlassian.net',
        'confluence.com',
        'jira.com'
    ];

    constructor(
        private readonly logger: Logger
    ) {}

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

    private isPdfFile(file: any): boolean {
        if (!file) return false;
        
        // Verificar por tipo MIME
        if (file.mimetype && this.SUPPORTED_PDF_TYPES.includes(file.mimetype)) {
            return true;
        }
        
        // Verificar por extensión de archivo
        if (file.name && file.name.toLowerCase().endsWith('.pdf')) {
            return true;
        }
        
        // Verificar por tipo de archivo reportado por Slack
        if (file.filetype && file.filetype.toLowerCase() === 'pdf') {
            return true;
        }
        
        return false;
    }

    private validateFileSize(file: any): void {
        if (file.size && file.size > this.MAX_FILE_SIZE) {
            throw new ValidationError(`El archivo PDF es demasiado grande. Tamaño máximo permitido: ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`);
        }
    }

    private validateBaseCommand(text: string | undefined, command: string): void {
        if (text && text.length > this.MAX_TEXT_LENGTH) {
            throw new ValidationError(`El texto excede el límite de ${this.MAX_TEXT_LENGTH} caracteres.`);
        }
    }

    private validateSearchCommand(text: string): void {
        if (!text || text.trim().length === 0) {
            throw new ValidationError('El comando /tg-search requiere un término de búsqueda.');
        }
        
        if (text.length < this.MIN_SEARCH_LENGTH) {
            throw new ValidationError(`La búsqueda debe tener al menos ${this.MIN_SEARCH_LENGTH} caracteres.`);
        }
    }

    private validateQuestionCommand(text: string): void {
        if (!text || text.trim().length === 0) {
            throw new ValidationError('El comando /tg-question requiere una pregunta.');
        }
    }

    async validateSummaryCommand(req: SlackRequest, res: SlackResponse, next: ValidationNextFunction): Promise<void> {
        const { text = '', user_id, channel_id } = req.body;
        const trimmedText = text.trim();

        try {
            // Caso 1: Se proporcionó una URL
            if (trimmedText && this.isValidUrl(trimmedText)) {
                this.logger.info('Comando tg-summary válido con URL:', { url: trimmedText, user: user_id });
                await next();
                return;
            }

            // Caso 2: Se proporcionó texto pero no es una URL válida
            if (trimmedText && !this.isValidUrl(trimmedText)) {
                await res.json({
                    response_type: 'ephemeral',
                    text: '❌ *URL no válida*\n\nPor favor proporciona una URL válida (debe comenzar con http:// o https://) o sube un archivo PDF y usa el comando inmediatamente después.\n\n*Ejemplos válidos:*\n• `/tg-summary https://confluence.empresa.com/display/DOC/page`\n• *Subir archivo PDF → usar `/tg-summary` sin texto*'
                });
                return;
            }

            // Caso 3: No se proporcionó texto - instruir al usuario sobre PDFs
            if (!trimmedText) {
                await res.json({
                    response_type: 'ephemeral',
                    text: '📄 *Para generar un resumen, debes proporcionar:*\n\n*Una URL válida (especialmente de Confluence):*\n• `/tg-summary https://confluence.empresa.com/display/DOC/page`\n\n*O un archivo PDF:*\n1. Sube un archivo PDF al canal\n2. Usa `/tg-summary [URL del archivo]` con la URL del PDF\n\n*Nota:* Actualmente el sistema está optimizado para URLs. El soporte completo para PDFs estará disponible próximamente.'
                });
        return;
    }

        } catch (error) {
            this.logger.error('Error en validación de comando summary:', error);
            await res.json({
                response_type: 'ephemeral',
                text: '❌ Error interno al validar el comando. Por favor, inténtalo de nuevo.'
            });
        }
    }

    public validateCommand(commandType: string) {
        return async (req: SlackRequest, res: SlackResponse, next: ValidationNextFunction) => {
            try {
                const { text, command, files } = req.body;

                this.logger.info(`Validando comando ${command} con texto: ${text}`, {
                    hasFiles: !!(files && files.length > 0),
                    fileCount: files?.length || 0
                });
                
                // Validación base para todos los comandos
                this.validateBaseCommand(text, command);

                // Validaciones específicas por tipo de comando
                switch (commandType) {
                    case '/tg-search':
                        this.validateSearchCommand(text!);
                        break;
                    case '/tg-question':
                        this.validateQuestionCommand(text!);
                        break;
                    case '/tg-summary':
                        await this.validateSummaryCommand(req, res, next);
                        break;
                    default:
                        throw new ValidationError(`Comando no reconocido: ${commandType}`);
                }

                this.logger.info(`Validación exitosa para el comando ${command}`);
                await next();
            } catch (error) {
                this.logger.error(`Error de validación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
                if (error instanceof ValidationError) {
                    await res.json({ 
                        text: `⚠️ ${error.message}`,
                        response_type: 'ephemeral' // Solo visible para el usuario que ejecutó el comando
                    });
                } else {
                    await res.json({ 
                        text: '⚠️ Error en la validación del comando. Inténtalo de nuevo.',
                        response_type: 'ephemeral'
                    });
                }
            }
        };
    }
} 