import { SlackAuthConfig } from '../infrastructure/auth/types';

export const slackConfig: SlackAuthConfig = {
    signingSecret: process.env.SLACK_SIGNING_SECRET || '',
    botToken: process.env.SLACK_BOT_TOKEN || '',
    maxRequestAge: 300 // 5 minutos en segundos
};

// Validación de configuración
export const validateSlackConfig = () => {
    if (!slackConfig.signingSecret) {
        throw new Error('SLACK_SIGNING_SECRET no está configurado');
    }
    if (!slackConfig.botToken) {
        throw new Error('SLACK_BOT_TOKEN no está configurado');
    }
}; 