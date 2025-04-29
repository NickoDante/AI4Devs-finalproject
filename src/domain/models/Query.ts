export interface Query {
  id: string;
  queryHash: string;
  originalText: string;
  normalizedText: string;
  language: 'es' | 'en';
  type: 'search' | 'admin' | 'summary' | 'conversation' | 'question' | 'unknown';
  intent?: string;
  command?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  processingTime?: number;
  channelId?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Relaciones
  userId: string; // Relación con User
  entityExtractions?: EntityExtraction[]; // Relación con EntityExtraction
  context?: string; // Contexto de la conversación para preguntas
}

export interface EntityExtraction {
  id: string;
  type: string;
  value: string;
  confidence: number;
} 