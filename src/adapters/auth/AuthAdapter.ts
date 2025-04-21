import { AuthPort, SlackAuthPayload, AuthResult } from '../../domain/ports/AuthPort';
import { User } from '../../domain/models/User';
import { PersistencePort } from '../../domain/ports/PersistencePort';
import { Logger } from 'winston';

export class AuthAdapter implements AuthPort {
    constructor(
        private readonly persistencePort: PersistencePort,
        private readonly logger: Logger
    ) {}

    async authenticate(payload: SlackAuthPayload): Promise<AuthResult> {
        try {
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
                error: 'Error en autenticación'
            };
        }
    }

    async verifyRequest(payload: SlackAuthPayload): Promise<AuthResult> {
        try {
            const isValid = await this.validateToken(payload.token);
            if (!isValid) {
                return {
                    success: false,
                    error: 'Token inválido'
                };
            }
            return await this.authenticate(payload);
        } catch (error) {
            this.logger.error('Error en verificación de solicitud:', error);
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
            this.logger.error('Error en verificación de permisos:', error);
            return false;
        }
    }

    async revokeToken(userId: string): Promise<boolean> {
        try {
            // Aquí iría la lógica para revocar el token
            // Por ahora retornamos true como placeholder
            return true;
        } catch (error) {
            this.logger.error('Error al revocar token:', error);
            return false;
        }
    }

    async refreshToken(userId: string): Promise<string | null> {
        try {
            // Aquí iría la lógica para refrescar el token
            // Por ahora retornamos null como placeholder
            return null;
        } catch (error) {
            this.logger.error('Error al refrescar token:', error);
            return null;
        }
    }

    async validateToken(token: string): Promise<boolean> {
        try {
            // Aquí iría la lógica para validar el token
            // Por ahora retornamos true como placeholder
            return true;
        } catch (error) {
            this.logger.error('Error al validar token:', error);
            return false;
        }
    }

    async hasPermission(userId: string, permission: string): Promise<boolean> {
        try {
            const user = await this.getUserInfo(userId);
            if (!user) return false;
            // Aquí iría la lógica para verificar permisos específicos
            // Por ahora retornamos true como placeholder
            return true;
        } catch (error) {
            this.logger.error('Error al verificar permiso:', error);
            return false;
        }
    }

    async getUserInfo(userId: string): Promise<User | null> {
        try {
            const user = await this.persistencePort.findUserById(userId);
            return user || null;
        } catch (error) {
            this.logger.error('Error al obtener información del usuario:', error);
            return null;
        }
    }
} 