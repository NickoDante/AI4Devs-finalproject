import { Request, Response, NextFunction } from 'express';
import { BaseError } from '../errors/BaseError';
import { AuthenticationError, AuthorizationError } from '../errors/ApplicationErrors';
import { ErrorHandler } from '../errors/ErrorHandler';
import { Logger } from 'winston';

export class ErrorHandlerMiddleware {
    constructor(
        private errorHandler: ErrorHandler,
        private logger: Logger
    ) {}

    handle = (error: Error, req: Request, res: Response, next: NextFunction) => {
        // Registrar el error usando nuestro ErrorHandler
        this.errorHandler.handleError(error);

        // Formatear la respuesta de error
        const errorResponse = ErrorHandler.formatErrorResponse(error);

        // Determinar el código de estado HTTP
        let statusCode = 500;
        if (error instanceof BaseError) {
            statusCode = error.statusCode;
        } else if (error instanceof AuthenticationError) {
            statusCode = 401;
        } else if (error instanceof AuthorizationError) {
            statusCode = 403;
        }

        // Enviar respuesta al cliente
        res.status(statusCode).json({
            error: errorResponse,
            timestamp: new Date().toISOString()
        });
    };
} 