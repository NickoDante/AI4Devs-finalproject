import { Logger } from 'winston';

export class KeywordExtractor {
    constructor(
        private readonly logger: Logger
    ) {}

    /**
     * Extrae palabras clave de una consulta de usuario
     * @param query La consulta del usuario
     * @returns Array de palabras clave
     */
    extractKeywords(query: string): string[] {
        try {
            // 1. Limpiar la consulta
            const cleanedQuery = this.cleanQuery(query);
            if (!cleanedQuery) {
                return [];
            }

            // 2. Dividir en palabras
            const words = cleanedQuery.split(/\s+/);

            // 3. Filtrar palabras vacías y comunes
            const keywords = words.filter(word => 
                word.length > 2 && 
                !this.isCommonWord(word) &&
                this.isValidKeyword(word)
            );

            // 4. Si no hay palabras clave válidas, devolver array vacío
            if (keywords.length === 0) {
                return [];
            }

            return keywords;
        } catch (error) {
            this.logger.error('Error extrayendo palabras clave:', error);
            return []; // En caso de error, devolver array vacío
        }
    }

    /**
     * Limpia la consulta de caracteres especiales y normaliza espacios
     */
    private cleanQuery(query: string): string {
        return query
            .toLowerCase()
            .trim()
            .replace(/[^\w\sáéíóúÁÉÍÓÚñÑ-]/g, ' ') // Mantener letras, números, espacios y caracteres especiales españoles
            .replace(/\s+/g, ' ');    // Normalizar espacios
    }

    /**
     * Verifica si una palabra es común y debe ser filtrada
     */
    private isCommonWord(word: string): boolean {
        const commonWords = [
            'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
            'y', 'o', 'pero', 'porque', 'si', 'no', 'que', 'cual',
            'como', 'donde', 'cuando', 'quien', 'cuyo', 'cuyas',
            'para', 'por', 'con', 'sin', 'sobre', 'bajo', 'ante',
            'tras', 'durante', 'mediante', 'según', 'contra'
        ];
        return commonWords.includes(word.toLowerCase());
    }

    /**
     * Verifica si una palabra es válida (contiene solo caracteres permitidos)
     */
    private isValidKeyword(word: string): boolean {
        return /^[a-z0-9áéíóúñ-]+$/i.test(word);
    }
} 