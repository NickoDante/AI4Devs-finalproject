import { BaseError } from './BaseError';

export class AuthenticationError extends BaseError {
    constructor(message: string = 'Error de autenticación') {
        super(message, 401);
        this.name = 'AuthenticationError';
    }
}

export class AuthorizationError extends BaseError {
    constructor(message: string = 'Error de autorización') {
        super(message, 403);
        this.name = 'AuthorizationError';
    }
} 