import { Response } from '../models/Response';

export interface ResponsePort {
    /**
     * Genera una respuesta basada en una consulta
     */
    generateResponse(queryId: string, userId: string): Promise<Response>;

    /**
     * Guarda una respuesta en el sistema
     */
    saveResponse(response: Response): Promise<Response>;

    /**
     * Recupera una respuesta por su ID
     */
    getResponseById(responseId: string): Promise<Response | null>;

    /**
     * Recupera todas las respuestas asociadas a una consulta
     */
    getResponsesByQueryId(queryId: string): Promise<Response[]>;
} 