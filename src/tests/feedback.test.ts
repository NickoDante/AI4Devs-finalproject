import { ProcessFeedbackUseCase, CreateFeedbackRequest } from '../application/use-cases/feedback/ProcessFeedbackUseCase';
import { Feedback } from '../domain/models/Feedback';
import { PersistencePort } from '../domain/ports/PersistencePort';
import { Logger } from 'winston';

// Mock del PersistencePort
const mockPersistencePort: jest.Mocked<PersistencePort> = {
  saveFeedback: jest.fn(),
  getFeedbackById: jest.fn(),
  getFeedbackByResponseId: jest.fn(),
  getFeedbackByUserId: jest.fn(),
  updateFeedback: jest.fn(),
  deleteFeedback: jest.fn(),
  // Otros métodos requeridos por la interfaz
  saveMessage: jest.fn(),
  getMessagesByChannel: jest.fn(),
  getMessagesByUser: jest.fn(),
  getMessageById: jest.fn(),
  deleteMessage: jest.fn(),
  saveDocument: jest.fn(),
  getDocumentById: jest.fn(),
  getDocuments: jest.fn(),
  deleteDocument: jest.fn(),
  saveUser: jest.fn(),
  findUserById: jest.fn(),
  getUsers: jest.fn(),
  deleteUser: jest.fn(),
  updateUser: jest.fn(),
  connect: jest.fn(),
  disconnect: jest.fn(),
  healthCheck: jest.fn()
};

// Mock del Logger
const mockLogger: jest.Mocked<Logger> = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
} as any;

describe('Sistema de Feedback - ProcessFeedbackUseCase', () => {
  let feedbackUseCase: ProcessFeedbackUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    feedbackUseCase = new ProcessFeedbackUseCase(mockPersistencePort, mockLogger);
  });

  describe('createFeedback', () => {
    it('debería crear feedback positivo exitosamente', async () => {
      // Arrange
      const request: CreateFeedbackRequest = {
        responseId: 'response_123',
        userId: 'user_456',
        isHelpful: true,
        rating: 5,
        comment: 'Excelente respuesta',
        categories: ['user_feedback'],
        tags: ['es', 'slack_command']
      };

      const expectedFeedback: Feedback = {
        id: 'feedback_789',
        responseId: request.responseId,
        userId: request.userId,
        rating: 5,
        isHelpful: true,
        comment: request.comment,
        categories: request.categories,
        tags: request.tags,
        suggestedImprovements: request.comment,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPersistencePort.getFeedbackByResponseId.mockResolvedValue([]);
      mockPersistencePort.saveFeedback.mockResolvedValue(expectedFeedback);

      // Act
      const result = await feedbackUseCase.createFeedback(request);

      // Assert
      expect(result).toEqual(expectedFeedback);
      expect(mockPersistencePort.saveFeedback).toHaveBeenCalledWith(
        expect.objectContaining({
          responseId: request.responseId,
          userId: request.userId,
          isHelpful: true,
          rating: 5,
          comment: request.comment
        })
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Creating new feedback',
        expect.objectContaining({
          responseId: request.responseId,
          userId: request.userId,
          isHelpful: true
        })
      );
    });

    it('debería crear feedback negativo exitosamente', async () => {
      // Arrange
      const request: CreateFeedbackRequest = {
        responseId: 'response_123',
        userId: 'user_456',
        isHelpful: false,
        comment: 'La respuesta no fue clara'
      };

      const expectedFeedback: Feedback = {
        id: 'feedback_789',
        responseId: request.responseId,
        userId: request.userId,
        rating: 1,
        isHelpful: false,
        comment: request.comment,
        suggestedImprovements: request.comment,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPersistencePort.getFeedbackByResponseId.mockResolvedValue([]);
      mockPersistencePort.saveFeedback.mockResolvedValue(expectedFeedback);

      // Act
      const result = await feedbackUseCase.createFeedback(request);

      // Assert
      expect(result).toEqual(expectedFeedback);
      expect(result.rating).toBe(1);
      expect(result.isHelpful).toBe(false);
    });

    it('debería actualizar feedback existente en lugar de crear duplicado', async () => {
      // Arrange
      const userId = 'user_456';
      const responseId = 'response_123';
      
      const existingFeedback: Feedback = {
        id: 'feedback_existing',
        responseId,
        userId,
        rating: 3,
        isHelpful: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const newRequest: CreateFeedbackRequest = {
        responseId,
        userId,
        isHelpful: false,
        rating: 1,
        comment: 'Cambié de opinión'
      };

      const updatedFeedback: Feedback = {
        ...existingFeedback,
        isHelpful: false,
        rating: 1,
        comment: 'Cambié de opinión',
        updatedAt: new Date()
      };

      mockPersistencePort.getFeedbackByResponseId.mockResolvedValue([existingFeedback]);
      mockPersistencePort.updateFeedback.mockResolvedValue(updatedFeedback);

      // Act
      const result = await feedbackUseCase.createFeedback(newRequest);

      // Assert
      expect(result).toEqual(updatedFeedback);
      expect(mockPersistencePort.updateFeedback).toHaveBeenCalledWith(
        existingFeedback.id,
        expect.objectContaining({
          isHelpful: false,
          rating: 1,
          comment: 'Cambié de opinión'
        })
      );
      expect(mockPersistencePort.saveFeedback).not.toHaveBeenCalled();
    });

    it('debería manejar errores al crear feedback', async () => {
      // Arrange
      const request: CreateFeedbackRequest = {
        responseId: 'response_123',
        userId: 'user_456',
        isHelpful: true
      };

      mockPersistencePort.getFeedbackByResponseId.mockResolvedValue([]);
      mockPersistencePort.saveFeedback.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(feedbackUseCase.createFeedback(request)).rejects.toThrow('Failed to create feedback: Database error');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error creating feedback',
        expect.objectContaining({
          error: 'Database error',
          responseId: request.responseId,
          userId: request.userId
        })
      );
    });
  });

  describe('getFeedbackMetrics', () => {
    it('debería calcular métricas correctamente', async () => {
      // Arrange
      const responseId = 'response_123';
      const feedbacks: Feedback[] = [
        {
          id: 'feedback_1',
          responseId,
          userId: 'user_1',
          rating: 5,
          isHelpful: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'feedback_2',
          responseId,
          userId: 'user_2',
          rating: 4,
          isHelpful: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'feedback_3',
          responseId,
          userId: 'user_3',
          rating: 1,
          isHelpful: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockPersistencePort.getFeedbackByResponseId.mockResolvedValue(feedbacks);

      // Act
      const metrics = await feedbackUseCase.getFeedbackMetrics(responseId);

      // Assert
      expect(metrics.totalFeedback).toBe(3);
      expect(metrics.helpfulCount).toBe(2);
      expect(metrics.notHelpfulCount).toBe(1);
      expect(Math.round(metrics.averageRating * 100) / 100).toBe(3.33);
      expect(Math.round(metrics.helpfulPercentage * 100) / 100).toBe(66.67);
    });

    it('debería retornar métricas vacías cuando no hay feedback', async () => {
      // Arrange
      const responseId = 'response_123';
      mockPersistencePort.getFeedbackByResponseId.mockResolvedValue([]);

      // Act
      const metrics = await feedbackUseCase.getFeedbackMetrics(responseId);

      // Assert
      expect(metrics).toEqual({
        totalFeedback: 0,
        helpfulCount: 0,
        notHelpfulCount: 0,
        averageRating: 0,
        helpfulPercentage: 0
      });
    });
  });
}); 