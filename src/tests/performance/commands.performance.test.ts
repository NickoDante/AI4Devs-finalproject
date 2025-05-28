import { ProcessMessageUseCase } from '../../application/use-cases/message/ProcessMessageUseCase';
import { ProcessQuestionUseCase } from '../../application/use-cases/message/ProcessQuestionUseCase';
import { ProcessSummaryUseCase } from '../../application/use-cases/summary/ProcessSummaryUseCase';
import { ProcessFeedbackUseCase } from '../../application/use-cases/feedback/ProcessFeedbackUseCase';
import { Message } from '../../domain/models/Message';
import { CreateFeedbackRequest } from '../../application/use-cases/feedback/ProcessFeedbackUseCase';
import { SummaryRequest } from '../../application/use-cases/summary/ProcessSummaryUseCase';
import { PerformanceMeasurer, formatPerformanceReport } from './performance.utils';
import { PERFORMANCE_THRESHOLDS, categorizePerformance } from './performance.config';

// Mocks para las dependencias
const mockMessagePort = {
  sendMessage: jest.fn(),
  start: jest.fn(),
  processMessage: jest.fn()
} as any;

const mockAIAdapter = {
  generateResponse: jest.fn().mockResolvedValue('Respuesta mock del AI'),
  generateSummary: jest.fn().mockResolvedValue('Resumen mock del AI')
} as any;

const mockPersistencePort = {
  saveFeedback: jest.fn().mockResolvedValue({ id: 'feedback-123' }),
  getFeedbackByResponseId: jest.fn().mockResolvedValue([]),
  updateFeedback: jest.fn(),
  connect: jest.fn(),
  disconnect: jest.fn(),
  healthCheck: jest.fn().mockResolvedValue(true)
} as any;

const mockCachePort = {
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue(true),
  delete: jest.fn().mockResolvedValue(true),
  clear: jest.fn().mockResolvedValue(true)
} as any;

const mockKnowledgePort = {
  searchKnowledge: jest.fn().mockResolvedValue([
    {
      source: 'Documento Test',
      content: 'Contenido de prueba para evaluación de rendimiento',
      relevance: 0.85,
      url: 'https://test.com/doc'
    }
  ])
} as any;

const mockPDFPort = {
  extractText: jest.fn().mockResolvedValue('Texto extraído del PDF para pruebas de rendimiento')
} as any;

const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
} as any;

describe('🚀 Pruebas de Rendimiento - Comandos', () => {
  let processMessageUseCase: ProcessMessageUseCase;
  let processQuestionUseCase: ProcessQuestionUseCase;
  let processSummaryUseCase: ProcessSummaryUseCase;
  let processFeedbackUseCase: ProcessFeedbackUseCase;

  beforeAll(() => {
    // Inicializar casos de uso con mocks
    processMessageUseCase = new ProcessMessageUseCase(
      mockMessagePort,
      mockAIAdapter,
      mockPersistencePort,
      mockCachePort,
      mockKnowledgePort,
      mockLogger
    );

    processQuestionUseCase = new ProcessQuestionUseCase(
      mockAIAdapter,
      mockKnowledgePort,
      mockCachePort,
      mockLogger
    );

    processSummaryUseCase = new ProcessSummaryUseCase(
      mockPDFPort,
      mockAIAdapter,
      mockCachePort,
      mockLogger,
      mockKnowledgePort
    );

    processFeedbackUseCase = new ProcessFeedbackUseCase(
      mockPersistencePort,
      mockLogger
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('📍 /tg-search - Rendimiento de Búsqueda', () => {
    it('debería ejecutar búsqueda dentro de umbrales de rendimiento', async () => {
      const message: Message = {
        content: 'arquitectura hexagonal',
        userId: 'test-user',
        username: 'Test User',
        channel: 'test-channel',
        timestamp: new Date(),
        type: 'command',
        metadata: { command: 'search' }
      };

      const { result, metrics } = await PerformanceMeasurer.measureAsync(async () => {
        return await processMessageUseCase.execute(message);
      });

      const thresholds = PERFORMANCE_THRESHOLDS.commands.search;
      const responseTimeCategory = categorizePerformance(metrics.responseTime, thresholds.maxResponseTime, 'responseTime');
      const memoryCategory = categorizePerformance(metrics.memoryUsage, thresholds.maxMemoryUsage, 'memoryUsage');

      console.log(formatPerformanceReport(
        'TG-Search Command', 
        metrics, 
        thresholds, 
        responseTimeCategory
      ));

      expect(metrics.responseTime).toBeLessThan(thresholds.maxResponseTime);
      expect(metrics.memoryUsage).toBeLessThan(thresholds.maxMemoryUsage);
      expect(result).toBeDefined();
      expect(result.content).toBeTruthy();
    });

    it('debería mantener throughput mínimo en búsquedas', async () => {
      const message: Message = {
        content: 'test performance',
        userId: 'test-user',
        username: 'Test User', 
        channel: 'test-channel',
        timestamp: new Date(),
        type: 'command',
        metadata: { command: 'search' }
      };

      const { throughput, avgResponseTime, errorRate } = await PerformanceMeasurer.measureThroughput(
        async () => await processMessageUseCase.execute(message),
        5000 // 5 segundos de prueba
      );

      const thresholds = PERFORMANCE_THRESHOLDS.commands.search;
      
      console.log(`
📊 **Search Throughput Test**
⚡ Throughput: ${throughput.toFixed(2)} ops/sec
⏱️  Avg Response: ${avgResponseTime.toFixed(2)}ms  
❌ Error Rate: ${errorRate.toFixed(2)}%
📏 Min Threshold: ${thresholds.minThroughput} ops/sec
      `);

      expect(throughput).toBeGreaterThan(thresholds.minThroughput);
      expect(errorRate).toBeLessThan(10); // Máximo 10% de errores
    });
  });

  describe('❓ /tg-question - Rendimiento de Preguntas', () => {
    it('debería procesar preguntas dentro de umbrales de rendimiento', async () => {
      const message: Message = {
        content: '¿Qué es la arquitectura hexagonal?',
        userId: 'test-user',
        username: 'Test User',
        channel: 'test-channel',
        timestamp: new Date(),
        type: 'command',
        metadata: { command: 'question' }
      };

      const { result, metrics } = await PerformanceMeasurer.measureAsync(async () => {
        return await processQuestionUseCase.execute(message);
      });

      const thresholds = PERFORMANCE_THRESHOLDS.commands.question;
      const responseTimeCategory = categorizePerformance(metrics.responseTime, thresholds.maxResponseTime, 'responseTime');

      console.log(formatPerformanceReport(
        'TG-Question Command',
        metrics,
        thresholds,
        responseTimeCategory
      ));

      expect(metrics.responseTime).toBeLessThan(thresholds.maxResponseTime);
      expect(metrics.memoryUsage).toBeLessThan(thresholds.maxMemoryUsage);
      expect(result).toBeDefined();
      expect(result.content).toBeTruthy();
    });
  });

  describe('📝 /tg-summary - Rendimiento de Resúmenes', () => {
    it('debería generar resúmenes dentro de umbrales de rendimiento', async () => {
      const message: Message = {
        content: 'https://confluence.test.com/page',
        userId: 'test-user',
        username: 'Test User',
        channel: 'test-channel',
        timestamp: new Date(),
        type: 'command',
        metadata: { command: 'summary' }
      };

      const summaryRequest: SummaryRequest = {
        type: 'url',
        content: 'https://confluence.test.com/page',
        metadata: {
          userId: 'test-user',
          channel: 'test-channel'
        }
      };

      const { result, metrics } = await PerformanceMeasurer.measureAsync(async () => {
        return await processSummaryUseCase.execute(message, summaryRequest, {
          maxLength: 500,
          language: 'es',
          includeMetadata: true,
          format: 'structured'
        });
      });

      const thresholds = PERFORMANCE_THRESHOLDS.commands.summary;
      const responseTimeCategory = categorizePerformance(metrics.responseTime, thresholds.maxResponseTime, 'responseTime');

      console.log(formatPerformanceReport(
        'TG-Summary Command',
        metrics,
        thresholds,
        responseTimeCategory
      ));

      expect(metrics.responseTime).toBeLessThan(thresholds.maxResponseTime);
      expect(metrics.memoryUsage).toBeLessThan(thresholds.maxMemoryUsage);
      expect(result).toBeDefined();
      expect(result.content).toBeTruthy();
    });
  });

  describe('👍 /tg-feedback - Rendimiento de Feedback', () => {
    it('debería procesar feedback dentro de umbrales de rendimiento', async () => {
      const feedbackRequest: CreateFeedbackRequest = {
        responseId: 'response-123',
        userId: 'test-user',
        isHelpful: true,
        rating: 5,
        comment: 'Excelente respuesta de prueba de rendimiento',
        categories: ['performance_test'],
        tags: ['test']
      };

      const { result, metrics } = await PerformanceMeasurer.measureAsync(async () => {
        return await processFeedbackUseCase.createFeedback(feedbackRequest);
      });

      const thresholds = PERFORMANCE_THRESHOLDS.commands.feedback;
      const responseTimeCategory = categorizePerformance(metrics.responseTime, thresholds.maxResponseTime, 'responseTime');

      console.log(formatPerformanceReport(
        'TG-Feedback Command',
        metrics,
        thresholds,
        responseTimeCategory
      ));

      expect(metrics.responseTime).toBeLessThan(thresholds.maxResponseTime);
      expect(metrics.memoryUsage).toBeLessThan(thresholds.maxMemoryUsage);
      expect(result).toBeDefined();
      expect(result.id).toBeTruthy();
    });

    it('debería mantener alto throughput para feedback', async () => {
      const feedbackRequest: CreateFeedbackRequest = {
        responseId: 'response-throughput-test',
        userId: 'test-user',
        isHelpful: true,
        rating: 5
      };

      const { throughput, avgResponseTime, errorRate } = await PerformanceMeasurer.measureThroughput(
        async () => {
          // Simular diferentes IDs para evitar conflictos
          const uniqueRequest = {
            ...feedbackRequest,
            responseId: `response-${Date.now()}-${Math.random()}`
          };
          return await processFeedbackUseCase.createFeedback(uniqueRequest);
        },
        3000 // 3 segundos de prueba
      );

      const thresholds = PERFORMANCE_THRESHOLDS.commands.feedback;

      console.log(`
📊 **Feedback Throughput Test**
⚡ Throughput: ${throughput.toFixed(2)} ops/sec
⏱️  Avg Response: ${avgResponseTime.toFixed(2)}ms
❌ Error Rate: ${errorRate.toFixed(2)}%
📏 Min Threshold: ${thresholds.minThroughput} ops/sec
      `);

      expect(throughput).toBeGreaterThan(thresholds.minThroughput);
      expect(errorRate).toBeLessThan(5); // Máximo 5% de errores para feedback
    });
  });
}); 