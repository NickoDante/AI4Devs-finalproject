export interface SlackRequestHeaders {
    'x-slack-signature': string;
    'x-slack-request-timestamp': string;
}

export interface SlackVerificationResult {
    isValid: boolean;
    error?: string;
}

export interface SlackAuthConfig {
    signingSecret: string;
    botToken: string;
    maxRequestAge: number; // en segundos
}

export type SlackRequestType = 'event' | 'command' | 'interaction' | 'verification';

export interface SlackRequestMetadata {
    type: SlackRequestType;
    userId?: string;
    teamId?: string;
    channelId?: string;
    timestamp: number;
} 