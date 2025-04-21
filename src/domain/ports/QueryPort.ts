import { Query } from '../models/Query';
import { EntityExtraction } from '../models/Query';

export interface QueryPort {
    /**
     * Procesa una consulta de usuario y extrae entidades relevantes
     */
    processQuery(text: string, userId: string, channelId: string): Promise<Query>;

    /**
     * Recupera una consulta por su ID
     */
    getQueryById(queryId: string): Promise<Query | null>;

    /**
     * Guarda o actualiza una consulta
     */
    saveQuery(query: Query): Promise<Query>;

    /**
     * Extrae entidades de un texto dado
     */
    extractEntities(text: string): Promise<EntityExtraction[]>;
} 