import { BaseError, ErrorContext } from './BaseError';

export class ValidationError extends BaseError {
    constructor(message: string, context?: ErrorContext) {
        super(message, 400, 'VALIDATION_ERROR', context);
    }
}

export class NotFoundError extends BaseError {
    constructor(message: string, context?: ErrorContext) {
        super(message, 404, 'NOT_FOUND', context);
    }
}

export class DatabaseError extends BaseError {
    constructor(message: string, context?: ErrorContext) {
        super(message, 500, 'DATABASE_ERROR', context);
    }
}

export class AIServiceError extends BaseError {
    constructor(message: string, context?: ErrorContext) {
        super(message, 503, 'AI_SERVICE_ERROR', context);
    }
}

export class QueryProcessingError extends BaseError {
    constructor(message: string, context?: ErrorContext) {
        super(message, 422, 'QUERY_PROCESSING_ERROR', context);
    }
} 