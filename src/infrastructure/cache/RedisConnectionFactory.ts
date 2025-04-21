import Redis from 'ioredis';
import { Logger } from 'winston';

export interface RedisConfig {
    host: string;
    port: number;
    password?: string;
    db?: number;
    keyPrefix?: string;
    retryStrategy?: (times: number) => number | void;
}

export class RedisConnectionFactory {
    private static instance: Redis | null = null;

    static async createConnection(config: RedisConfig, logger: Logger): Promise<Redis> {
        if (this.instance) {
            return this.instance;
        }

        const defaultRetryStrategy = (times: number) => {
            const delay = Math.min(times * 50, 2000);
            logger.warn('Intentando reconectar a Redis...', { attempt: times, delay });
            return delay;
        };

        const redis = new Redis({
            host: config.host,
            port: config.port,
            password: config.password,
            db: config.db || 0,
            keyPrefix: config.keyPrefix,
            retryStrategy: config.retryStrategy || defaultRetryStrategy,
            enableReadyCheck: true,
            maxRetriesPerRequest: 3
        });

        redis.on('connect', () => {
            logger.info('Conectado a Redis exitosamente');
        });

        redis.on('error', (error) => {
            logger.error('Error en conexión Redis:', error);
        });

        redis.on('ready', () => {
            logger.info('Redis está listo para recibir comandos');
        });

        redis.on('reconnecting', () => {
            logger.warn('Intentando reconectar a Redis...');
        });

        // Esperar a que la conexión esté lista
        await new Promise<void>((resolve, reject) => {
            redis.once('ready', resolve);
            redis.once('error', reject);
        });

        this.instance = redis;
        return redis;
    }

    static async closeConnection(): Promise<void> {
        if (this.instance) {
            await this.instance.quit();
            this.instance = null;
        }
    }
} 