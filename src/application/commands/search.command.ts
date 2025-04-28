import { Message } from '../../domain/models/Message';
import { Logger } from 'winston';
import { KeywordExtractor } from '../services/KeywordExtractor';
import { isValidSpaceKey, getSpaceByKey, getDefaultSpace } from '../../config/confluence.config';

export interface SearchValidationResult {
    isValid: boolean;
    keywords?: string[];
    error?: string;
    spaceKey?: string;
    spaceName?: string;
}

export class SearchCommand {
    private keywordExtractor: KeywordExtractor;

    constructor(
        private readonly logger: Logger
    ) {
        this.keywordExtractor = new KeywordExtractor(logger);
    }

    async validate(message: Message): Promise<SearchValidationResult> {
        try {
            // 1. Validar entrada
            if (!message.content || message.content.trim() === '') {
                return {
                    isValid: false,
                    error: '❌ Por favor, proporciona palabras clave para buscar.'
                };
            }

            // 2. Extraer espacio y palabras clave
            const parts = message.content.trim().split(' ').filter(part => part.length > 0);
            let spaceKey: string | undefined;
            let spaceName: string | undefined;
            let keywords: string[];

            // Si el primer término parece un espacio (mayúsculas), validarlo
            if (parts[0] && /^[A-Z]+$/.test(parts[0])) {
                if (!isValidSpaceKey(parts[0])) {
                    const defaultSpace = getDefaultSpace();
                    return {
                        isValid: false,
                        error: `❌ El espacio "${parts[0]}" no es válido. Los espacios disponibles son: ${defaultSpace.key} (${defaultSpace.name}), NVP (NVP Documentation)`
                    };
                }
                spaceKey = parts[0];
                const space = getSpaceByKey(spaceKey);
                spaceName = space?.name;
                const remainingContent = parts.slice(1).join(' ').trim();
                if (!remainingContent) {
                    return {
                        isValid: false,
                        error: '❌ No se pudieron extraer palabras clave válidas de tu búsqueda.'
                    };
                }
                try {
                    keywords = this.keywordExtractor.extractKeywords(remainingContent);
                } catch (error) {
                    this.logger.error('Error extrayendo palabras clave:', error);
                    return {
                        isValid: false,
                        error: '❌ Lo siento, hubo un error al procesar tu búsqueda.'
                    };
                }
            } else {
                try {
                    keywords = this.keywordExtractor.extractKeywords(message.content);
                } catch (error) {
                    this.logger.error('Error extrayendo palabras clave:', error);
                    return {
                        isValid: false,
                        error: '❌ Lo siento, hubo un error al procesar tu búsqueda.'
                    };
                }
                const defaultSpace = getDefaultSpace();
                spaceKey = defaultSpace.key;
                spaceName = defaultSpace.name;
            }
            
            // Validar que haya palabras clave válidas
            if (!keywords || keywords.length === 0 || 
                (keywords.length === 1 && keywords[0] === message.content.trim())) {
                return {
                    isValid: false,
                    error: '❌ No se pudieron extraer palabras clave válidas de tu búsqueda.'
                };
            }

            // Validar que no haya caracteres especiales en las palabras clave
            const hasSpecialChars = keywords.some(keyword => /[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s-]/.test(keyword));
            if (hasSpecialChars) {
                return {
                    isValid: false,
                    error: '❌ No se pudieron extraer palabras clave válidas de tu búsqueda.'
                };
            }

            return {
                isValid: true,
                keywords,
                spaceKey,
                spaceName
            };

        } catch (error) {
            try {
                this.logger.error('Error en validación de búsqueda:', error);
            } catch (loggerError) {
                // Si el logger falla, aún queremos devolver un error al usuario
                return {
                    isValid: false,
                    error: '❌ Lo siento, hubo un error al procesar tu búsqueda.'
                };
            }
            return {
                isValid: false,
                error: '❌ Lo siento, hubo un error al procesar tu búsqueda.'
            };
        }
    }
} 