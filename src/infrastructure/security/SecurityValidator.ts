import { createHmac } from 'crypto';
import { AuthenticationError } from '../errors/ApplicationErrors';
import { Logger } from 'winston';

export class SecurityValidator {
    private static readonly SLACK_VERSION = 'v0';
    private static readonly MAX_REQUEST_AGE_SECONDS = 300; // 5 minutos

    constructor(
        private signingSecret: string,
        private logger: Logger
    ) {}

    /**
     * Valida la firma de una petición de Slack
     */
    validateSlackSignature(
        signature: string,
        timestamp: string,
        body: string
    ): boolean {
        try {
            // Verificar que la firma y timestamp existen
            if (!signature || !timestamp) {
                throw new AuthenticationError('Firma o timestamp faltantes');
            }

            // Verificar que el timestamp no es muy antiguo
            const requestTimestamp = parseInt(timestamp, 10);
            const now = Math.floor(Date.now() / 1000);
            
            if (now - requestTimestamp > SecurityValidator.MAX_REQUEST_AGE_SECONDS) {
                throw new AuthenticationError('Solicitud expirada', {
                    requestAge: now - requestTimestamp,
                    maxAge: SecurityValidator.MAX_REQUEST_AGE_SECONDS
                });
            }

            // Construir la cadena base para la firma
            const baseString = `${SecurityValidator.SLACK_VERSION}:${timestamp}:${body}`;

            // Calcular la firma esperada
            const hmac = createHmac('sha256', this.signingSecret);
            const expectedSignature = `${SecurityValidator.SLACK_VERSION}=${hmac.update(baseString).digest('hex')}`;

            // Comparar firmas usando un método seguro contra timing attacks
            const isValid = this.secureCompare(signature, expectedSignature);

            if (!isValid) {
                this.logger.warn('Firma inválida detectada', {
                    timestamp,
                    requestAge: now - requestTimestamp
                });
            }

            return isValid;

        } catch (error) {
            this.logger.error('Error validando firma de Slack:', error);
            throw error;
        }
    }

    /**
     * Valida el formato de un token de Slack
     */
    validateTokenFormat(token: string): boolean {
        // Verificar que el token existe
        if (!token) {
            throw new AuthenticationError('Token no proporcionado');
        }

        // Verificar el formato básico del token (xoxb- para bot tokens, xoxp- para user tokens)
        const validPrefixes = ['xoxb-', 'xoxp-'];
        const hasValidPrefix = validPrefixes.some(prefix => token.startsWith(prefix));

        if (!hasValidPrefix) {
            throw new AuthenticationError('Formato de token inválido');
        }

        // Verificar longitud mínima del token
        if (token.length < 20) {
            throw new AuthenticationError('Token demasiado corto');
        }

        return true;
    }

    /**
     * Compara dos strings de manera segura contra timing attacks
     */
    private secureCompare(a: string, b: string): boolean {
        if (a.length !== b.length) {
            return false;
        }

        let result = 0;
        for (let i = 0; i < a.length; i++) {
            result |= a.charCodeAt(i) ^ b.charCodeAt(i);
        }
        return result === 0;
    }
} 