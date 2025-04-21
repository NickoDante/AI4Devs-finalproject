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
    private readonly URL_PATTERN = /^(http|https):\/\/[^ "]+$/;

    constructor(private readonly logger: Logger) {}

    private isValidUrl(text: string): boolean {
        try {
            new URL(text);
            return true;
        } catch {
            return false;
        }
    }

    private validateBaseCommand(text: string | undefined, command: string): void {
        if (!text || text.trim().length === 0) {
            throw new ValidationError(`El comando ${command} requiere un texto.`);
        }

        if (text.length > this.MAX_TEXT_LENGTH) {
            throw new ValidationError(`El texto excede el límite de ${this.MAX_TEXT_LENGTH} caracteres.`);
        }
    }

    private validateSearchCommand(text: string): void {
        if (text.length < this.MIN_SEARCH_LENGTH) {
            throw new ValidationError(`La búsqueda debe tener al menos ${this.MIN_SEARCH_LENGTH} caracteres.`);
        }
    }

    private validateQuestionCommand(text: string): void {
        if (!text.trim().endsWith('?')) {
            throw new ValidationError('El texto debe terminar con un signo de interrogación (?).');
        }
    }

    private validateSummaryCommand(text: string): void {
        if (!this.isValidUrl(text)) {
            throw new ValidationError('Debes proporcionar una URL válida para generar el resumen.');
        }
    }

    public validateCommand(commandType: string) {
        return async (req: SlackRequest, res: SlackResponse, next: ValidationNextFunction) => {
            try {
                const { text, command } = req.body;

                this.logger.info(`Validando comando ${command} con texto: ${text}`);
                
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
                        this.validateSummaryCommand(text!);
                        break;
                    default:
                        throw new ValidationError(`Comando no reconocido: ${commandType}`);
                }

                this.logger.info(`Validación exitosa para el comando ${command}`);
                await next();
            } catch (error) {
                this.logger.error(`Error de validación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
                if (error instanceof ValidationError) {
                    await res.json({ text: `⚠️ ${error.message}` });
                } else {
                    await res.json({ text: '⚠️ Error en la validación del comando.' });
                }
            }
        };
    }
} 