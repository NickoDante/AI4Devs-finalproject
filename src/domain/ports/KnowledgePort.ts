/**
 * Interfaz para búsqueda y gestión de conocimiento
 */
export interface KnowledgePort {
  /**
   * Busca documentos en la base de conocimiento
   */
  searchDocuments(query: string, limit?: number): Promise<SearchResult[]>;
  
  /**
   * Obtiene un documento por su ID
   */
  getDocument(documentId: string): Promise<Document | null>;
  
  /**
   * Indexa un documento en la base de conocimiento
   */
  indexDocument(document: Document): Promise<boolean>;
  
  /**
   * Elimina un documento de la base de conocimiento
   */
  deleteDocument(documentId: string): Promise<boolean>;
  
  /**
   * Actualiza un documento existente
   */
  updateDocument(document: Document): Promise<boolean>;
  
  /**
   * Verifica el estado de la conexión
   */
  healthCheck(): Promise<boolean>;
}

/**
 * Resultado de búsqueda
 */
export interface SearchResult {
  documentId: string;
  title: string;
  content: string;
  url?: string;
  relevance: number;
  snippet?: string;
  source?: string;
  metadata?: Record<string, any>;
}

/**
 * Documento en la base de conocimiento
 */
export interface Document {
  id: string;
  title: string;
  content: string;
  url?: string;
  source?: string;
  author?: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  categories?: string[];
  metadata?: Record<string, any>;
  embeddings?: number[];
}

export interface KnowledgeContent {
  title: string;
  content: string;
  tags?: string[];
}

export interface KnowledgePort {
  searchKnowledge(query: string, spaceKey?: string): Promise<SearchResult[]>;
  saveKnowledge(content: KnowledgeContent): Promise<void>;
  updateKnowledge(id: string, content: KnowledgeContent): Promise<void>;
} 