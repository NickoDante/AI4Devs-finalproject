import crypto from 'crypto';
import { SlackRequestHeaders, SlackVerificationResult } from './types';
import { Logger } from 'winston';

export class SlackSignatureVerifier {
    private static readonly VERSION = 'v0';
    private readonly signingSecret: string;
    private readonly maxRequestAge: number;
    private readonly logger: Logger;

    constructor(signingSecret: string, maxRequestAge: number, logger: Logger) {
        this.signingSecret = signingSecret;
        this.maxRequestAge = maxRequestAge;
        this.logger = logger;
    }

    public verifyRequest(
        headers: SlackRequestHeaders,
        body: string
    ): SlackVerificationResult {
        try {
            // Verificar que tenemos todos los headers necesarios
            if (!headers['x-slack-signature'] || !headers['x-slack-request-timestamp']) {
                return {
                    isValid: false,
                    error: 'Faltan headers de autenticación de Slack'
                };
            }

            const timestamp = parseInt(headers['x-slack-request-timestamp'], 10);
            const signature = headers['x-slack-signature'];

            // Verificar que la solicitud no es muy antigua (prevenir replay attacks)
            const now = Math.floor(Date.now() / 1000);
            if (Math.abs(now - timestamp) > this.maxRequestAge) {
                return {
                    isValid: false,
                    error: 'La solicitud es demasiado antigua'
                };
            }

            // Construir la cadena base para la firma
            const signatureBaseString = `${SlackSignatureVerifier.VERSION}:${timestamp}:${body}`;

            // Calcular el HMAC
            const hmac = crypto.createHmac('sha256', this.signingSecret)
                .update(signatureBaseString)
                .digest('hex');

            // Construir la firma esperada
            const expectedSignature = `${SlackSignatureVerifier.VERSION}=${hmac}`;

            // Comparar firmas usando un método seguro contra timing attacks
            const isValid = crypto.timingSafeEqual(
                Buffer.from(signature),
                Buffer.from(expectedSignature)
            );

            if (!isValid) {
                this.logger.warn('Firma de Slack inválida', {
                    timestamp,
                    expectedSignature: expectedSignature.substring(0, 10) + '...',
                    receivedSignature: signature.substring(0, 10) + '...'
                });
            }

            return {
                isValid,
                error: isValid ? undefined : 'Firma inválida'
            };

        } catch (error) {
            this.logger.error('Error verificando firma de Slack:', error);
            return {
                isValid: false,
                error: 'Error interno verificando firma'
            };
        }
    }
} 