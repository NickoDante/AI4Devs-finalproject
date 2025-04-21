import { Request, Response, NextFunction } from 'express';
import { AuthPort, SlackAuthPayload } from '../../domain/ports/AuthPort';
import { Logger } from 'winston';
import { AuthenticationError, AuthorizationError } from '@/infrastructure/errors/AuthErrors';

export interface AuthInfo {
    userId: string;
    permissions: string[];
}

declare global {
    namespace Express {
        interface Request {
            auth?: AuthInfo;
        }
    }
}

export class AuthMiddleware {
    constructor(
        private readonly authPort: AuthPort,
        private readonly logger: Logger
    ) {}

    authenticate = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.headers['x-slack-token'] as string;
            const timestamp = req.headers['x-slack-request-timestamp'] as string;
            const userId = req.body?.user_id;

            if (!token || !timestamp || !userId) {
                throw new AuthenticationError('Faltan datos de autenticación');
            }

            const payload: SlackAuthPayload = {
                token,
                timestamp,
                userId
            };

            const authResult = await this.authPort.verifyRequest(payload);

            if (!authResult.success) {
                throw new AuthenticationError(authResult.error || 'Autenticación fallida');
            }

            // Añadir información de autenticación al request
            req.auth = {
                userId: authResult.user!.userId,
                permissions: authResult.user!.permissions
            };

            next();
        } catch (error) {
            this.logger.error('Error en autenticación:', error);
            next(error);
        }
    };

    requirePermissions = (requiredPermissions: string[]) => {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                if (!req.auth) {
                    throw new AuthenticationError('No autenticado');
                }

                const hasAllPermissions = requiredPermissions.every(
                    permission => req.auth!.permissions.includes(permission)
                );

                if (!hasAllPermissions) {
                    throw new AuthorizationError('Permisos insuficientes');
                }

                next();
            } catch (error) {
                this.logger.error('Error en verificación de permisos:', error);
                next(error);
            }
        };
    };
} 