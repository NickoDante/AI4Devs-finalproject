export interface Response {
  id: string;
  queryId: string; // Relación con Query
  userId: string; // Relación con User
  text: string;
  type: 'search' | 'admin' | 'summary';
  modelUsed?: string;
  createdAt: Date;
  
  // Campos adicionales para tracking y análisis
  metadata?: {
    confidence?: number;
    processingTime?: number;
    source?: string;
    [key: string]: any;
  };
} 