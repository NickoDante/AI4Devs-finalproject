import { QueryPort } from '../../domain/ports/QueryPort';
import { ResponsePort } from '../../domain/ports/ResponsePort';
import { ErrorHandler } from '../../infrastructure/errors/ErrorHandler';
import { ValidationError, QueryProcessingError, AIServiceError } from '../../infrastructure/errors/ApplicationErrors';
import { BaseError } from '../../infrastructure/errors/BaseError';
import { Logger } from 'winston';

export class HandleQueryUseCase {
    constructor(
        private queryPort: QueryPort,
        private responsePort: ResponsePort,
        private errorHandler: ErrorHandler,
        private logger: Logger
    ) {}

    async execute(text: string, userId: string, channelId: string) {
        try {
            // Validación básica
            if (!text?.trim()) {
                throw new ValidationError('La consulta no puede estar vacía', {
                    userId,
                    channelId
                });
            }

            // Procesar la consulta
            const query = await this.queryPort.processQuery(text, userId, channelId);
            
            // Simular un posible error de procesamiento
            if (text.toLowerCase().includes('error')) {
                throw new QueryProcessingError('Error al procesar la consulta', {
                    queryId: query.id,
                    text: query.originalText
                });
            }

            // Generar respuesta
            const response = await this.responsePort.generateResponse(query.id, userId);
            
            this.logger.info('Consulta procesada exitosamente', {
                queryId: query.id,
                responseId: response.id
            });

            return response;

        } catch (error: unknown) {
            // Asegurarnos de que error sea del tipo correcto
            const typedError = error instanceof BaseError ? error : 
                             error instanceof Error ? error : 
                             new Error('Error desconocido');
            
            // El ErrorHandler se encargará de registrar el error apropiadamente
            this.errorHandler.handleError(typedError);

            // Transformar el error en una respuesta estructurada
            const errorResponse = ErrorHandler.formatErrorResponse(typedError);
            
            // Relanzar el error para que pueda ser manejado en capas superiores
            throw typedError;
        }
    }
} 