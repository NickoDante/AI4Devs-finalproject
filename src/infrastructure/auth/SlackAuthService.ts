import { AuthPort, AuthResult, SlackAuthPayload } from '../../domain/ports/AuthPort';
import { User } from '../../domain/models/User';
import { CachePort } from '../../domain/ports/CachePort';
import { PersistencePort } from '../../domain/ports/PersistencePort';
import { Logger } from 'winston';
import { WebClient } from '@slack/web-api';
import { createHmac } from 'crypto';
import { SlackAuthenticationError } from '../errors/SlackAuthErrors';
import { slackConfig } from '../../config/slack.config';

export class SlackAuthService implements AuthPort {
    private readonly slack: WebClient;
    private readonly CACHE_NAMESPACE = 'slack-tokens';
    private readonly TOKEN_TTL = 3600; // 1 hora
    private readonly PERMISSIONS_TTL = 300; // 5 minutos

    constructor(
        private readonly cachePort: CachePort,
        private readonly persistencePort: PersistencePort,
        private readonly logger: Logger
    ) {
        this.slack = new WebClient(slackConfig.botToken);
    }

    private verifySignature(timestamp: string, body: string): boolean {
        const fiveMinutesAgo = Math.floor(Date.now() / 1000) - slackConfig.maxRequestAge;
        if (parseInt(timestamp) < fiveMinutesAgo) {
            return false;
        }

        const baseString = `v0:${timestamp}:${body}`;
        const signature = 'v0=' + createHmac('sha256', slackConfig.signingSecret)
            .update(baseString)
            .digest('hex');

        return signature === body;
    }

    async validateToken(token: string): Promise<boolean> {
        try {
            const result = await this.slack.auth.test({ token });
            return !!result.ok;
        } catch (error) {
            this.logger.error('Error validando token de Slack:', error);
            return false;
        }
    }

    async hasPermission(userId: string, permission: string): Promise<boolean> {
        try {
            // Verificar en caché primero
            const cacheKey = `permissions:${userId}:${permission}`;
            const cachedPermission = await this.cachePort.get<boolean>(cacheKey);
            
            if (cachedPermission !== null) {
                return cachedPermission;
            }

            // Obtener usuario de la base de datos
            const user = await this.persistencePort.findUserById(userId);
            if (!user) {
                return false;
            }

            // Verificar el permiso basado en el rol del usuario
            const hasPermission = this.checkPermissionForRole(user.role, permission);

            // Cachear el resultado
            await this.cachePort.set(cacheKey, hasPermission, {
                namespace: this.CACHE_NAMESPACE,
                ttl: this.PERMISSIONS_TTL
            });

            return hasPermission;
        } catch (error) {
            this.logger.error('Error verificando permisos:', error);
            return false;
        }
    }

    async getUserInfo(userId: string): Promise<User | null> {
        try {
            // Intentar obtener del cache primero
            const cachedUser = await this.cachePort.get(`${this.CACHE_NAMESPACE}:user:${userId}`);
            if (cachedUser && typeof cachedUser === 'string') {
                return JSON.parse(cachedUser);
            }

            // Obtener de Slack
            const result = await this.slack.users.info({ user: userId });
            if (!result.user) {
                return null;
            }

            const slackUser = result.user;
            const user: User = {
                userId: slackUser.id || userId,
                username: slackUser.name || 'unknown',
                email: slackUser.profile?.email || `${userId}@unknown.com`,
                realName: slackUser.real_name || 'Unknown User',
                role: slackUser.is_admin ? 'admin' : 'user',
                isAdmin: !!slackUser.is_admin,
                language: slackUser.locale || 'es',
                permissions: ['read'],
                isActive: !slackUser.deleted,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            // Guardar en cache
            await this.cachePort.set(
                `${this.CACHE_NAMESPACE}:user:${userId}`,
                JSON.stringify(user),
                { ttl: this.TOKEN_TTL }
            );

            return user;
        } catch (error) {
            this.logger.error('Error obteniendo información del usuario:', error);
            return null;
        }
    }

    async authenticate(payload: SlackAuthPayload): Promise<AuthResult> {
        try {
            const isValid = await this.validateToken(payload.token);
            if (!isValid) {
                return {
                    success: false,
                    error: 'Token inválido'
                };
            }

            const user = await this.getUserInfo(payload.userId);
            if (!user) {
                return {
                    success: false,
                    error: 'Usuario no encontrado'
                };
            }

            return {
                success: true,
                user
            };
        } catch (error) {
            this.logger.error('Error en autenticación:', error);
            return {
                success: false,
                error: 'Error interno de autenticación'
            };
        }
    }

    async verifyRequest(payload: SlackAuthPayload): Promise<AuthResult> {
        try {
            // Verificar firma
            if (!this.verifySignature(payload.timestamp, payload.token)) {
                return {
                    success: false,
                    error: 'Firma inválida'
                };
            }

            // Obtener información del usuario
            const user = await this.getUserInfo(payload.userId);
            if (!user) {
                return {
                    success: false,
                    error: 'Usuario no encontrado'
                };
            }

            return {
                success: true,
                user
            };
        } catch (error) {
            this.logger.error('Error en verificación:', error);
            return {
                success: false,
                error: 'Error en verificación'
            };
        }
    }

    async verifyPermissions(userId: string, requiredPermissions: string[]): Promise<boolean> {
        try {
            const results = await Promise.all(
                requiredPermissions.map(permission => this.hasPermission(userId, permission))
            );
            return results.every(result => result);
        } catch (error) {
            this.logger.error('Error verificando permisos:', error);
            return false;
        }
    }

    async revokeToken(userId: string): Promise<boolean> {
        try {
            // Obtener token del usuario desde la base de datos o caché
            const user = await this.persistencePort.findUserById(userId);
            if (!user) {
                return false;
            }

            // Eliminar de caché
            const cacheKey = `token:${userId}`;
            await this.cachePort.delete(cacheKey);

            this.logger.info('Token revocado exitosamente');
            return true;
        } catch (error) {
            this.logger.error('Error revocando token:', error);
            return false;
        }
    }

    async refreshToken(userId: string): Promise<string | null> {
        // Slack no tiene un mecanismo de refresh token estándar
        this.logger.warn('Refresh token no implementado para Slack');
        return null;
    }

    private checkPermissionForRole(role: string, permission: string): boolean {
        // Mapa simple de roles y permisos
        const rolePermissions: Record<string, string[]> = {
            admin: ['*'],
            user: ['read', 'write', 'search'],
            guest: ['read', 'search']
        };

        const allowedPermissions = rolePermissions[role] || [];
        return allowedPermissions.includes('*') || allowedPermissions.includes(permission);
    }

    private determineUserRole(slackUser: any): string {
        if (slackUser.is_admin) {
            return 'admin';
        } else if (slackUser.is_restricted || slackUser.is_ultra_restricted) {
            return 'guest';
        }
        return 'user';
    }
} 