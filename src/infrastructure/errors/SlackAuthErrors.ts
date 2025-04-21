import { BaseError } from './BaseError';

export class SlackAuthenticationError extends BaseError {
    constructor(message: string = 'Error de autenticación de Slack') {
        super(message, 401);
        this.name = 'SlackAuthenticationError';
    }
}

export class InvalidSlackSignatureError extends SlackAuthenticationError {
    constructor(message: string = 'Firma de Slack inválida') {
        super(message);
        this.name = 'InvalidSlackSignatureError';
    }
}

export class ExpiredRequestError extends SlackAuthenticationError {
    constructor(message: string = 'La solicitud ha expirado') {
        super(message);
        this.name = 'ExpiredRequestError';
    }
}

export class MissingSlackHeadersError extends SlackAuthenticationError {
    constructor(message: string = 'Faltan headers requeridos de Slack') {
        super(message);
        this.name = 'MissingSlackHeadersError';
    }
}

export class InvalidBotTokenError extends SlackAuthenticationError {
    constructor(message: string = 'Token de bot inválido') {
        super(message);
        this.name = 'InvalidBotTokenError';
    }
} 