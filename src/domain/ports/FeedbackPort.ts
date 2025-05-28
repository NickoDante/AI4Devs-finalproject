import { Feedback } from '../models/Feedback';

export interface FeedbackPort {
  // Crear nuevo feedback
  createFeedback(feedback: Omit<Feedback, 'id' | 'createdAt' | 'updatedAt'>): Promise<Feedback>;
  
  // Obtener feedback por ID
  getFeedbackById(feedbackId: string): Promise<Feedback | null>;
  
  // Obtener feedback por respuesta
  getFeedbackByResponseId(responseId: string): Promise<Feedback[]>;
  
  // Obtener feedback por usuario
  getFeedbackByUserId(userId: string, limit?: number): Promise<Feedback[]>;
  
  // Actualizar feedback existente
  updateFeedback(feedbackId: string, updates: Partial<Feedback>): Promise<Feedback | null>;
  
  // Eliminar feedback
  deleteFeedback(feedbackId: string): Promise<boolean>;
  
  // Obtener métricas básicas de feedback
  getFeedbackMetrics(responseId?: string): Promise<{
    totalFeedback: number;
    helpfulCount: number;
    notHelpfulCount: number;
    averageRating: number;
  }>;
} 