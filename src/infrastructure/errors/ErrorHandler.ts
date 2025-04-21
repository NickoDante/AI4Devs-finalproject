import { BaseError } from './BaseError';
import * as winston from 'winston';

export class ErrorHandler {
    private logger: winston.Logger;

    constructor(logger: winston.Logger) {
        this.logger = logger;
    }

    public handleError(error: Error | BaseError): void {
        if (error instanceof BaseError) {
            this.handleCustomError(error);
        } else {
            this.handleUnknownError(error);
        }
    }

    private handleCustomError(error: BaseError): void {
        const errorInfo = error.toJSON();
        
        // Log con nivel apropiado según el código de estado
        if (error.statusCode >= 500) {
            this.logger.error('Error crítico en la aplicación:', errorInfo);
        } else if (error.statusCode >= 400) {
            this.logger.warn('Error de cliente:', errorInfo);
        } else {
            this.logger.info('Notificación de error:', errorInfo);
        }
    }

    private handleUnknownError(error: Error): void {
        const errorInfo = {
            name: error.name,
            message: error.message,
            stack: error.stack,
            timestamp: new Date()
        };

        this.logger.error('Error no manejado:', errorInfo);
    }

    public static formatErrorResponse(error: Error | BaseError): Record<string, unknown> {
        if (error instanceof BaseError) {
            return error.toJSON();
        }

        return {
            name: 'InternalServerError',
            message: 'Se produjo un error interno en el servidor',
            statusCode: 500,
            errorCode: 'INTERNAL_ERROR',
            timestamp: new Date()
        };
    }
} 