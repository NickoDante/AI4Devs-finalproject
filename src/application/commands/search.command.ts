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
    private readonly SPACE_SEPARATOR = '--';

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

            // 2. Separar contenido por el doble guion
            const parts = message.content.split(this.SPACE_SEPARATOR).map(part => part.trim());
            let searchContent: string;
            let spaceKey: string;
            let spaceName: string;
            let keywords: string[];

            // Si hay doble guion, procesar espacio específico
            if (parts.length > 1) {
                searchContent = parts[0];
                const specifiedSpace = parts[1];

                if (!isValidSpaceKey(specifiedSpace)) {
                    const defaultSpace = getDefaultSpace();
                    return {
                        isValid: false,
                        error: `❌ El espacio "${specifiedSpace}" no es válido. Los espacios disponibles son: ${defaultSpace.key} (${defaultSpace.name}), NVP (NVP Documentation)`
                    };
                }
                spaceKey = specifiedSpace;
                const space = getSpaceByKey(spaceKey);
                spaceName = space?.name || '';
            } else {
                // Si no hay doble guion, usar espacio por defecto
                searchContent = parts[0];
                const defaultSpace = getDefaultSpace();
                spaceKey = defaultSpace.key;
                spaceName = defaultSpace.name;
            }

            // 3. Extraer palabras clave
            try {
                keywords = this.keywordExtractor.extractKeywords(searchContent);
            } catch (error) {
                this.logger.error('Error extrayendo palabras clave:', error);
                return {
                    isValid: false,
                    error: '❌ Lo siento, hubo un error al procesar tu búsqueda.'
                };
            }

            // Validar que haya palabras clave válidas
            if (!keywords || keywords.length === 0) {
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
            this.logger.error('Error en validación de búsqueda:', error);
            return {
                isValid: false,
                error: '❌ Lo siento, hubo un error al procesar tu búsqueda.'
            };
        }
    }
} 