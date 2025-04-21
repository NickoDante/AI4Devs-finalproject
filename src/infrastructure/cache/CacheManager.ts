import { CachePort } from '../../domain/ports/CachePort';
import { Logger } from 'winston';
import { BotResponse } from '../../domain/models/BotResponse';

export class CacheManager {
    private static readonly TTL = {
        SEARCH: 3600,      // 1 hora para búsquedas
        QUESTION: 7200,    // 2 horas para preguntas
        SUMMARY: 86400,    // 24 horas para resúmenes
        DEFAULT: 3600      // 1 hora por defecto
    };

    private static readonly NAMESPACE = {
        SEARCH: 'search',
        QUESTION: 'question',
        SUMMARY: 'summary'
    };

    constructor(
        private readonly cache: CachePort,
        private readonly logger: Logger
    ) {}

    private getCacheKey(command: string, content: string, namespace?: string): string {
        const normalizedContent = content.toLowerCase().trim();
        return namespace ? `${namespace}:${command}:${normalizedContent}` : `${command}:${normalizedContent}`;
    }

    async getCachedResponse(command: string, content: string): Promise<BotResponse | null> {
        try {
            const namespace = this.getNamespace(command);
            const key = this.getCacheKey(command, content, namespace);
            const cached = await this.cache.get<BotResponse>(key);

            if (cached) {
                this.logger.info('Respuesta encontrada en caché', {
                    command,
                    content: content.substring(0, 50),
                    namespace
                });
                return {
                    ...cached,
                    metadata: {
                        ...cached.metadata,
                        source: 'cache'
                    }
                };
            }

            return null;
        } catch (error) {
            this.logger.error('Error al obtener respuesta del caché:', error);
            return null;
        }
    }

    async setCachedResponse(command: string, content: string, response: BotResponse): Promise<void> {
        try {
            const namespace = this.getNamespace(command);
            const key = this.getCacheKey(command, content, namespace);
            const ttl = this.getTTL(command);

            await this.cache.set(key, response, {
                namespace,
                ttl
            });

            this.logger.debug('Respuesta guardada en caché', {
                command,
                content: content.substring(0, 50),
                namespace,
                ttl
            });
        } catch (error) {
            this.logger.error('Error al guardar respuesta en caché:', error);
        }
    }

    private getNamespace(command: string): string {
        switch (command) {
            case '/tg-search':
                return CacheManager.NAMESPACE.SEARCH;
            case '/tg-question':
                return CacheManager.NAMESPACE.QUESTION;
            case '/tg-summary':
                return CacheManager.NAMESPACE.SUMMARY;
            default:
                return 'default';
        }
    }

    private getTTL(command: string): number {
        switch (command) {
            case '/tg-search':
                return CacheManager.TTL.SEARCH;
            case '/tg-question':
                return CacheManager.TTL.QUESTION;
            case '/tg-summary':
                return CacheManager.TTL.SUMMARY;
            default:
                return CacheManager.TTL.DEFAULT;
        }
    }
} 