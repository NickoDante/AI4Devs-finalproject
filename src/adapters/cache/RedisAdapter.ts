import { CachePort, CacheOptions, ConversationContext } from '../../domain/ports/CachePort';
import { Redis } from 'ioredis';
import { Logger } from 'winston';

export class RedisAdapter implements CachePort {
    private readonly defaultTTL = 3600; // 1 hora por defecto
    private readonly keyPrefix = 'tg:'; // Prefijo para todas las claves
    private readonly contextNamespace = 'context'; // Namespace para contextos de conversación
    private readonly activeConvsNamespace = 'activeConvs'; // Namespace para conversaciones activas

    constructor(
        private redis: Redis,
        private logger: Logger
    ) {}

    private getFullKey(key: string, namespace?: string): string {
        return `${this.keyPrefix}${namespace ? `${namespace}:` : ''}${key}`;
    }

    async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
        try {
            const fullKey = this.getFullKey(key, options?.namespace);
            const serializedValue = JSON.stringify(value);
            const ttl = options?.ttl || this.defaultTTL;

            if (ttl > 0) {
                await this.redis.setex(fullKey, ttl, serializedValue);
            } else {
                await this.redis.set(fullKey, serializedValue);
            }

            this.logger.debug('Valor guardado en caché', {
                key: fullKey,
                ttl,
                namespace: options?.namespace
            });
        } catch (error) {
            this.logger.error('Error al guardar en caché:', error);
            throw error;
        }
    }

    async get<T>(key: string, namespace?: string): Promise<T | null> {
        try {
            const fullKey = this.getFullKey(key, namespace);
            const value = await this.redis.get(fullKey);

            if (!value) {
                return null;
            }

            return JSON.parse(value) as T;
        } catch (error) {
            this.logger.error('Error al obtener de caché:', error);
            throw error;
        }
    }

    async delete(key: string): Promise<void> {
        try {
            const fullKey = this.getFullKey(key);
            await this.redis.del(fullKey);

            this.logger.debug('Valor eliminado de caché', { key: fullKey });
        } catch (error) {
            this.logger.error('Error al eliminar de caché:', error);
            throw error;
        }
    }

    async exists(key: string): Promise<boolean> {
        try {
            const fullKey = this.getFullKey(key);
            const exists = await this.redis.exists(fullKey);
            return exists === 1;
        } catch (error) {
            this.logger.error('Error al verificar existencia en caché:', error);
            throw error;
        }
    }

    async clear(namespace?: string): Promise<void> {
        try {
            if (namespace) {
                const pattern = this.getFullKey('*', namespace);
                const keys = await this.redis.keys(pattern);
                
                if (keys.length > 0) {
                    await this.redis.del(...keys);
                    this.logger.info('Namespace limpiado de caché', { namespace, keysDeleted: keys.length });
                } else {
                    this.logger.debug('No se encontraron claves en el namespace', { namespace });
                }
            } else {
                const pattern = this.getFullKey('*');
                const keys = await this.redis.keys(pattern);
                
                if (keys.length > 0) {
                    await this.redis.del(...keys);
                    this.logger.info('Todas las claves con prefijo limpiadas', { keysDeleted: keys.length });
                } else {
                    this.logger.debug('No se encontraron claves para limpiar');
                }
            }
        } catch (error) {
            this.logger.error('Error al limpiar caché:', error);
            throw error;
        }
    }

    async getTTL(key: string): Promise<number> {
        try {
            const fullKey = this.getFullKey(key);
            return await this.redis.ttl(fullKey);
        } catch (error) {
            this.logger.error('Error al obtener TTL:', error);
            throw error;
        }
    }

    async updateTTL(key: string, ttl: number): Promise<void> {
        try {
            const fullKey = this.getFullKey(key);
            await this.redis.expire(fullKey, ttl);

            this.logger.debug('TTL actualizado', { key: fullKey, ttl });
        } catch (error) {
            this.logger.error('Error al actualizar TTL:', error);
            throw error;
        }
    }

    async pushToList(key: string, ...values: any[]): Promise<number> {
        try {
            const fullKey = this.getFullKey(key);
            const serializedValues = values.map(v => JSON.stringify(v));
            const length = await this.redis.rpush(fullKey, ...serializedValues);

            this.logger.debug('Elementos agregados a la lista', {
                key: fullKey,
                count: values.length,
                totalLength: length
            });

            return length;
        } catch (error) {
            this.logger.error('Error al agregar elementos a la lista:', error);
            throw error;
        }
    }

    async getList(key: string, start: number = 0, end: number = -1): Promise<any[]> {
        try {
            const fullKey = this.getFullKey(key);
            const values = await this.redis.lrange(fullKey, start, end);
            return values.map(v => JSON.parse(v));
        } catch (error) {
            this.logger.error('Error al obtener elementos de la lista:', error);
            throw error;
        }
    }

    async setHash(key: string, hash: Record<string, any>): Promise<void> {
        try {
            const fullKey = this.getFullKey(key);
            const serializedHash = Object.entries(hash).reduce((acc, [field, value]) => {
                acc[field] = JSON.stringify(value);
                return acc;
            }, {} as Record<string, string>);

            await this.redis.hmset(fullKey, serializedHash);

            this.logger.debug('Hash guardado en caché', {
                key: fullKey,
                fields: Object.keys(hash).length
            });
        } catch (error) {
            this.logger.error('Error al guardar hash en caché:', error);
            throw error;
        }
    }

    async getHash(key: string): Promise<Record<string, any> | null> {
        try {
            const fullKey = this.getFullKey(key);
            const hash = await this.redis.hgetall(fullKey);

            if (Object.keys(hash).length === 0) {
                return null;
            }

            return Object.entries(hash).reduce((acc, [field, value]) => {
                acc[field] = JSON.parse(value);
                return acc;
            }, {} as Record<string, any>);
        } catch (error) {
            this.logger.error('Error al obtener hash de caché:', error);
            throw error;
        }
    }

    async healthCheck(): Promise<boolean> {
        try {
            const ping = await this.redis.ping();
            return ping === 'PONG';
        } catch (error) {
            this.logger.error('Error en health check de Redis:', error);
            return false;
        }
    }

    // Implementación de los nuevos métodos requeridos por CachePort
    async saveConversationContext(context: ConversationContext): Promise<boolean> {
        try {
            const key = `${context.userId}:${context.conversationId}`;
            await this.set(key, context, {
                namespace: this.contextNamespace,
                ttl: 1800 // 30 minutos
            });

            // Actualizar la lista de conversaciones activas
            await this.addToActiveConversations(context.userId, context.conversationId);
            
            return true;
        } catch (error) {
            this.logger.error('Error al guardar contexto de conversación:', error);
            return false;
        }
    }

    async getConversationContext(userId: string, conversationId: string): Promise<ConversationContext | null> {
        try {
            const key = `${userId}:${conversationId}`;
            return await this.get<ConversationContext>(key, this.contextNamespace);
        } catch (error) {
            this.logger.error('Error al obtener contexto de conversación:', error);
            return null;
        }
    }

    async removeConversationContext(userId: string, conversationId: string): Promise<boolean> {
        try {
            const key = `${userId}:${conversationId}`;
            await this.delete(this.getFullKey(key, this.contextNamespace));
            
            // Actualizar la lista de conversaciones activas
            await this.removeFromActiveConversations(userId, conversationId);
            
            return true;
        } catch (error) {
            this.logger.error('Error al eliminar contexto de conversación:', error);
            return false;
        }
    }

    async getActiveConversations(userId: string): Promise<string[]> {
        try {
            const key = userId;
            return await this.getList(key, 0, -1) as string[];
        } catch (error) {
            this.logger.error('Error al obtener conversaciones activas:', error);
            return [];
        }
    }

    private async addToActiveConversations(userId: string, conversationId: string): Promise<void> {
        // Añadir al inicio de la lista (las más recientes primero)
        await this.redis.lpush(
            this.getFullKey(userId, this.activeConvsNamespace),
            conversationId
        );
        
        // Limitar a 10 conversaciones por usuario (mantener solo las más recientes)
        await this.redis.ltrim(
            this.getFullKey(userId, this.activeConvsNamespace),
            0, 9
        );
        
        // Establecer TTL de 7 días para la lista de conversaciones activas
        await this.redis.expire(
            this.getFullKey(userId, this.activeConvsNamespace),
            60 * 60 * 24 * 7
        );
    }

    private async removeFromActiveConversations(userId: string, conversationId: string): Promise<void> {
        await this.redis.lrem(
            this.getFullKey(userId, this.activeConvsNamespace),
            0, // Eliminar todas las ocurrencias
            conversationId
        );
    }
} 