import { Logger } from 'winston';
import { Feedback } from '../../../domain/models/Feedback';
import { FeedbackPort } from '../../../domain/ports/FeedbackPort';
import { PersistencePort } from '../../../domain/ports/PersistencePort';
import { v4 as uuidv4 } from 'uuid';

export interface CreateFeedbackRequest {
  responseId: string;
  userId: string;
  isHelpful: boolean;
  rating?: number;
  comment?: string;
  categories?: string[];
  tags?: string[];
}

export interface FeedbackMetrics {
  totalFeedback: number;
  helpfulCount: number;
  notHelpfulCount: number;
  averageRating: number;
  helpfulPercentage: number;
}

export class ProcessFeedbackUseCase implements FeedbackPort {
  constructor(
    private readonly persistencePort: PersistencePort,
    private readonly logger: Logger
  ) {}

  async createFeedback(request: CreateFeedbackRequest): Promise<Feedback> {
    try {
      this.logger.info('Creating new feedback', { 
        responseId: request.responseId, 
        userId: request.userId,
        isHelpful: request.isHelpful 
      });

      // Verificar si ya existe feedback para esta respuesta por este usuario
      const existingFeedback = await this.getFeedbackByResponseId(request.responseId);
      const userFeedback = existingFeedback.find(f => f.userId === request.userId);
      
      if (userFeedback) {
        // Si ya existe, actualizar el feedback existente
        return await this.updateFeedback(userFeedback.id, {
          isHelpful: request.isHelpful,
          rating: request.rating || (request.isHelpful ? 5 : 1),
          comment: request.comment,
          categories: request.categories,
          tags: request.tags,
          updatedAt: new Date()
        }) as Feedback;
      }

      // Crear nuevo feedback
      const feedback: Feedback = {
        id: uuidv4(),
        responseId: request.responseId,
        userId: request.userId,
        rating: request.rating || (request.isHelpful ? 5 : 1),
        isHelpful: request.isHelpful,
        comment: request.comment,
        categories: request.categories,
        tags: request.tags,
        suggestedImprovements: request.comment, // Para simplicidad del MVP
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const savedFeedback = await this.persistencePort.saveFeedback(feedback);
      
      this.logger.info('Feedback created successfully', { 
        feedbackId: savedFeedback.id,
        responseId: request.responseId 
      });
      
      return savedFeedback;
    } catch (error) {
      this.logger.error('Error creating feedback', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        responseId: request.responseId,
        userId: request.userId 
      });
      throw new Error(`Failed to create feedback: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getFeedbackById(feedbackId: string): Promise<Feedback | null> {
    try {
      return await this.persistencePort.getFeedbackById(feedbackId);
    } catch (error) {
      this.logger.error('Error getting feedback by ID', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        feedbackId 
      });
      return null;
    }
  }

  async getFeedbackByResponseId(responseId: string): Promise<Feedback[]> {
    try {
      return await this.persistencePort.getFeedbackByResponseId(responseId);
    } catch (error) {
      this.logger.error('Error getting feedback by response ID', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        responseId 
      });
      return [];
    }
  }

  async getFeedbackByUserId(userId: string, limit = 50): Promise<Feedback[]> {
    try {
      return await this.persistencePort.getFeedbackByUserId(userId, limit);
    } catch (error) {
      this.logger.error('Error getting feedback by user ID', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        userId 
      });
      return [];
    }
  }

  async updateFeedback(feedbackId: string, updates: Partial<Feedback>): Promise<Feedback | null> {
    try {
      this.logger.info('Updating feedback', { feedbackId, updates });
      
      const updatedFeedback = await this.persistencePort.updateFeedback(feedbackId, {
        ...updates,
        updatedAt: new Date()
      });

      if (updatedFeedback) {
        this.logger.info('Feedback updated successfully', { feedbackId });
      }

      return updatedFeedback;
    } catch (error) {
      this.logger.error('Error updating feedback', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        feedbackId 
      });
      return null;
    }
  }

  async deleteFeedback(feedbackId: string): Promise<boolean> {
    try {
      const result = await this.persistencePort.deleteFeedback(feedbackId);
      this.logger.info('Feedback deleted', { feedbackId, success: result });
      return result;
    } catch (error) {
      this.logger.error('Error deleting feedback', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        feedbackId 
      });
      return false;
    }
  }

  async getFeedbackMetrics(responseId?: string): Promise<FeedbackMetrics> {
    try {
      let feedbacks: Feedback[];
      
      if (responseId) {
        feedbacks = await this.getFeedbackByResponseId(responseId);
      } else {
        // Para métricas globales, necesitaríamos un método diferente
        // Por ahora retornamos métricas vacías para el caso global
        feedbacks = [];
      }

      const totalFeedback = feedbacks.length;
      const helpfulCount = feedbacks.filter(f => f.isHelpful).length;
      const notHelpfulCount = totalFeedback - helpfulCount;
      
      const ratings = feedbacks.filter(f => f.rating).map(f => f.rating!);
      const averageRating = ratings.length > 0 
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
        : 0;
      
      const helpfulPercentage = totalFeedback > 0 
        ? (helpfulCount / totalFeedback) * 100 
        : 0;

      return {
        totalFeedback,
        helpfulCount,
        notHelpfulCount,
        averageRating,
        helpfulPercentage
      };
    } catch (error) {
      this.logger.error('Error getting feedback metrics', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        responseId 
      });
      
      return {
        totalFeedback: 0,
        helpfulCount: 0,
        notHelpfulCount: 0,
        averageRating: 0,
        helpfulPercentage: 0
      };
    }
  }
} 