import { Request, Response, NextFunction } from 'express';
import { Logger } from 'winston';
import { SlackSignatureVerifier } from '../auth/SlackSignatureVerifier';
import { SlackAuthConfig, SlackRequestMetadata } from '../auth/types';
import {
    InvalidSlackSignatureError,
    ExpiredRequestError,
    MissingSlackHeadersError
} from '../errors/SlackAuthErrors';
import { CachePort } from '../../domain/ports/CachePort';

export class SlackAuthMiddleware {
    private readonly signatureVerifier: SlackSignatureVerifier;
    private readonly cachePort: CachePort;
    private readonly logger: Logger;
    private readonly CACHE_NAMESPACE = 'slack-auth';
    private readonly CACHE_TTL = 300; // 5 minutos

    constructor(
        config: SlackAuthConfig,
        cachePort: CachePort,
        logger: Logger
    ) {
        this.signatureVerifier = new SlackSignatureVerifier(
            config.signingSecret,
            config.maxRequestAge,
            logger
        );
        this.cachePort = cachePort;
        this.logger = logger;
    }

    public authenticate = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const rawBody = (req as any).rawBody; // El body raw debe ser capturado antes
            if (!rawBody) {
                throw new Error('Raw body no disponible');
            }

            // Extraer headers necesarios
            const headers = {
                'x-slack-signature': req.header('x-slack-signature') || '',
                'x-slack-request-timestamp': req.header('x-slack-request-timestamp') || ''
            };

            // Verificar si la solicitud está en caché
            const cacheKey = `${headers['x-slack-signature']}:${headers['x-slack-request-timestamp']}`;
            const cachedResult = await this.cachePort.get(cacheKey);
            
            if (cachedResult) {
                this.logger.debug('Usando resultado de autenticación cacheado', { cacheKey });
                return next();
            }

            // Verificar la firma
            const verificationResult = this.signatureVerifier.verifyRequest(headers, rawBody);

            if (!verificationResult.isValid) {
                switch (verificationResult.error) {
                    case 'Faltan headers de autenticación de Slack':
                        throw new MissingSlackHeadersError();
                    case 'La solicitud es demasiado antigua':
                        throw new ExpiredRequestError();
                    default:
                        throw new InvalidSlackSignatureError();
                }
            }

            // Extraer metadata de la solicitud
            const metadata: SlackRequestMetadata = this.extractRequestMetadata(req);
            
            // Guardar en caché el resultado de la verificación
            await this.cachePort.set(cacheKey, true, {
                namespace: this.CACHE_NAMESPACE,
                ttl: this.CACHE_TTL
            });

            // Adjuntar metadata a la solicitud para uso posterior
            (req as any).slackMetadata = metadata;

            this.logger.info('Solicitud de Slack autenticada', {
                type: metadata.type,
                userId: metadata.userId,
                teamId: metadata.teamId
            });

            next();
        } catch (error) {
            this.logger.error('Error en autenticación de Slack:', error);
            next(error);
        }
    };

    private extractRequestMetadata(req: Request): SlackRequestMetadata {
        const body = req.body;
        const timestamp = parseInt(req.header('x-slack-request-timestamp') || '0', 10);

        // Determinar el tipo de solicitud
        let type: SlackRequestMetadata['type'] = 'verification';
        let userId: string | undefined;
        let teamId: string | undefined;
        let channelId: string | undefined;

        if (body.type === 'url_verification') {
            type = 'verification';
        } else if (body.event) {
            type = 'event';
            userId = body.event.user;
            teamId = body.team_id;
            channelId = body.event.channel;
        } else if (body.command) {
            type = 'command';
            userId = body.user_id;
            teamId = body.team_id;
            channelId = body.channel_id;
        } else if (body.payload && typeof body.payload === 'string') {
            type = 'interaction';
            const payload = JSON.parse(body.payload);
            userId = payload.user.id;
            teamId = payload.team.id;
            channelId = payload.channel.id;
        }

        return {
            type,
            userId,
            teamId,
            channelId,
            timestamp
        };
    }
} 