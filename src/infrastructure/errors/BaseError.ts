export interface ErrorContext {
    [key: string]: unknown;
}

export class BaseError extends Error {
    public readonly statusCode: number;
    public readonly errorCode: string;
    public readonly timestamp: Date;
    public readonly context?: ErrorContext;

    constructor(
        message: string,
        statusCode: number = 500,
        errorCode: string = 'INTERNAL_ERROR',
        context?: ErrorContext
    ) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.timestamp = new Date();
        this.context = context;

        // Necesario para que instanceof funcione correctamente
        Object.setPrototypeOf(this, new.target.prototype);
    }

    public toJSON(): Record<string, unknown> {
        return {
            name: this.name,
            message: this.message,
            statusCode: this.statusCode,
            errorCode: this.errorCode,
            timestamp: this.timestamp,
            context: this.context
        };
    }
} 