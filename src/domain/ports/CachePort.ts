/**
 * Contexto de conversación
 */
export interface ConversationContext {
  userId: string;
  conversationId: string;
  messages: {
    role: 'system' | 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }[];
  metadata?: {
    lastInteraction: Date;
    topicId?: string;
    relevantDocuments?: string[];
    [key: string]: any;
  };
}

export interface CacheOptions {
    ttl?: number; // Tiempo de vida en segundos
    namespace?: string; // Espacio de nombres para agrupar claves
}

export interface CachePort {
    /**
     * Guarda un valor en caché
     */
    set<T>(key: string, value: T, options?: CacheOptions): Promise<void>;

    /**
     * Obtiene un valor de caché
     */
    get<T>(key: string): Promise<T | null>;

    /**
     * Elimina un valor de caché
     */
    delete(key: string): Promise<void>;

    /**
     * Verifica si una clave existe en caché
     */
    exists(key: string): Promise<boolean>;

    /**
     * Limpia todo el caché o un namespace específico
     */
    clear(namespace?: string): Promise<void>;

    /**
     * Obtiene el tiempo de vida restante de una clave
     */
    getTTL(key: string): Promise<number>;

    /**
     * Actualiza el tiempo de vida de una clave
     */
    updateTTL(key: string, ttl: number): Promise<void>;

    /**
     * Agrega elementos a una lista
     */
    pushToList(key: string, ...values: any[]): Promise<number>;

    /**
     * Obtiene elementos de una lista
     */
    getList(key: string, start?: number, end?: number): Promise<any[]>;

    /**
     * Guarda un hash completo
     */
    setHash(key: string, hash: Record<string, any>): Promise<void>;

    /**
     * Obtiene un hash completo
     */
    getHash(key: string): Promise<Record<string, any> | null>;

    /**
     * Verifica el estado de la conexión
     */
    healthCheck(): Promise<boolean>;

    /**
     * Guarda el contexto de una conversación
     */
    saveConversationContext(context: ConversationContext): Promise<boolean>;

    /**
     * Obtiene el contexto de una conversación
     */
    getConversationContext(userId: string, conversationId: string): Promise<ConversationContext | null>;

    /**
     * Elimina el contexto de una conversación
     */
    removeConversationContext(userId: string, conversationId: string): Promise<boolean>;

    /**
     * Obtiene las conversaciones activas de un usuario
     */
    getActiveConversations(userId: string): Promise<string[]>;

    /**
     * Guarda un vector en la base de datos vectorial
     * @param key Identificador único del vector
     * @param vector Array de números que representa el vector
     * @param metadata Metadatos asociados al vector
     */
    storeVector(key: string, vector: number[], metadata?: Record<string, any>): Promise<void>;

    /**
     * Busca los vectores más similares a un vector dado
     * @param vector Vector de consulta
     * @param limit Número máximo de resultados
     * @param threshold Umbral mínimo de similitud (0-1)
     * @returns Array de resultados ordenados por similitud
     */
    searchSimilarVectors(vector: number[], limit?: number, threshold?: number): Promise<Array<{
        key: string;
        score: number;
        metadata?: Record<string, any>;
    }>>;

    /**
     * Elimina un vector de la base de datos vectorial
     * @param key Identificador del vector a eliminar
     */
    deleteVector(key: string): Promise<void>;

    /**
     * Actualiza los metadatos de un vector existente
     * @param key Identificador del vector
     * @param metadata Nuevos metadatos
     */
    updateVectorMetadata(key: string, metadata: Record<string, any>): Promise<void>;
} 