import { Logger } from 'winston';
import { CachePort } from '../../domain/ports/CachePort';
import { PersistencePort } from '../../domain/ports/PersistencePort';

export interface HealthStatus {
    status: 'healthy' | 'unhealthy' | 'degraded';
    timestamp: Date;
    services: {
        redis: {
            status: 'healthy' | 'unhealthy';
            latency?: number;
        };
        mongodb: {
            status: 'healthy' | 'unhealthy';
            latency?: number;
        };
        slack: {
            status: 'healthy' | 'unhealthy';
        };
    };
    details?: {
        error?: string;
        degradedServices?: string[];
    };
}

export class HealthCheckService {
    constructor(
        private readonly cache: CachePort,
        private readonly persistence: PersistencePort,
        private readonly logger: Logger
    ) {}

    async checkHealth(): Promise<HealthStatus> {
        const startTime = Date.now();
        const status: HealthStatus = {
            status: 'healthy',
            timestamp: new Date(),
            services: {
                redis: { status: 'unhealthy' },
                mongodb: { status: 'unhealthy' },
                slack: { status: 'healthy' } // Asumimos que Slack está bien si el bot está corriendo
            }
        };

        try {
            // Verificar Redis
            const redisStart = Date.now();
            const redisHealth = await this.cache.healthCheck();
            status.services.redis = {
                status: redisHealth ? 'healthy' : 'unhealthy',
                latency: Date.now() - redisStart
            };

            // Verificar MongoDB
            const mongoStart = Date.now();
            const mongoHealth = await this.persistence.healthCheck();
            status.services.mongodb = {
                status: mongoHealth ? 'healthy' : 'unhealthy',
                latency: Date.now() - mongoStart
            };

            // Determinar estado general
            const unhealthyServices = Object.entries(status.services)
                .filter(([_, service]) => service.status === 'unhealthy')
                .map(([name]) => name);

            if (unhealthyServices.length > 0) {
                status.status = unhealthyServices.length === Object.keys(status.services).length 
                    ? 'unhealthy' 
                    : 'degraded';
                status.details = {
                    degradedServices: unhealthyServices
                };
            }

            // Registrar resultado
            this.logger.info('Health check completado', {
                status: status.status,
                duration: Date.now() - startTime,
                services: status.services
            });

        } catch (error) {
            status.status = 'unhealthy';
            status.details = {
                error: error instanceof Error ? error.message : 'Error desconocido'
            };
            this.logger.error('Error en health check:', error);
        }

        return status;
    }
} 