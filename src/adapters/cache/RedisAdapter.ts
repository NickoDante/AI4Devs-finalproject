import { CachePort, CacheOptions } from '../../domain/ports/CachePort';
import { Redis } from 'ioredis';
import { Logger } from 'winston';
import { ConversationContext } from '../../application/use-cases/ManageConversationContextUseCase';

export class RedisAdapter implements CachePort {
    private readonly defaultTTL = 3600; // 1 hora por defecto
    private readonly keyPrefix = 'tg:'; // Prefijo para todas las claves
    private readonly contextNamespace = 'context'; // Namespace para contextos de conversación

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

    async setConversationContext(userId: string, context: ConversationContext): Promise<void> {
        await this.set(userId, context, {
            namespace: this.contextNamespace,
            ttl: 1800 // 30 minutos
        });
    }

    async getConversationContext(userId: string): Promise<ConversationContext | null> {
        return await this.get<ConversationContext>(userId, this.contextNamespace);
    }
} 