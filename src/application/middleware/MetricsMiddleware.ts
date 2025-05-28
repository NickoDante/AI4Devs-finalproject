import { performance } from 'perf_hooks';
import { Logger } from 'winston';
import { MetricsCollectorService } from '../services/MetricsCollectorService';
import { Message } from '../../domain/models/Message';

export interface MetricsMiddleware {
  beforeCommand(message: Message): Promise<MetricsContext>;
  afterCommand(context: MetricsContext, result: any, error?: Error): Promise<void>;
}

export interface MetricsContext {
  commandType: string;
  userId: string;
  channel: string;
  startTime: number;
  startMemory: NodeJS.MemoryUsage;
  requestId: string;
}

export class TGMetricsMiddleware implements MetricsMiddleware {
  constructor(
    private readonly metricsCollector: MetricsCollectorService,
    private readonly logger: Logger
  ) {}

  async beforeCommand(message: Message): Promise<MetricsContext> {
    const commandType = this.extractCommandType(message);
    const startTime = performance.now();
    const startMemory = process.memoryUsage();
    const requestId = this.generateRequestId();

    const context: MetricsContext = {
      commandType,
      userId: message.userId,
      channel: message.channel,
      startTime,
      startMemory,
      requestId
    };

    // Registrar inicio del comando
    await this.metricsCollector.recordCommandStart(commandType, message.userId, message.channel);
    
    // Registrar actividad del usuario
    await this.metricsCollector.recordUserActivity(
      message.userId, 
      message.channel, 
      `command_${commandType}_started`
    );

    this.logger.debug('Comando iniciado - métricas:', {
      requestId,
      commandType,
      userId: message.userId,
      channel: message.channel
    });

    return context;
  }

  async afterCommand(context: MetricsContext, result: any, error?: Error): Promise<void> {
    const endTime = performance.now();
    const endMemory = process.memoryUsage();
    
    const duration = endTime - context.startTime;
    const memoryUsage = (endMemory.heapUsed - context.startMemory.heapUsed) / (1024 * 1024); // MB
    const success = !error;
    const errorType = error ? this.classifyError(error) : undefined;

    // Registrar finalización del comando
    await this.metricsCollector.recordCommandEnd(
      context.commandType,
      context.userId,
      context.channel,
      duration,
      success,
      errorType
    );

    // Registrar métricas adicionales según el resultado
    if (error) {
      await this.metricsCollector.recordError({
        errorType: errorType || 'unknown',
        errorMessage: error.message,
        stackTrace: error.stack,
        userId: context.userId,
        channel: context.channel,
        commandType: context.commandType,
        severity: this.determineErrorSeverity(error)
      });
    }

    // Registrar métricas de sistema si hay problemas de rendimiento
    if (duration > this.getPerformanceThreshold(context.commandType)) {
      await this.metricsCollector.recordSystem({
        component: 'performance',
        metric: 'slow_command',
        value: duration,
        unit: 'ms',
        status: 'warning',
        threshold: this.getPerformanceThreshold(context.commandType)
      });
    }

    if (Math.abs(memoryUsage) > 100) { // Cambio de memoria > 100MB
      await this.metricsCollector.recordSystem({
        component: 'memory',
        metric: 'high_memory_usage',
        value: Math.abs(memoryUsage),
        unit: 'mb',
        status: memoryUsage > 200 ? 'critical' : 'warning'
      });
    }

    this.logger.debug('Comando finalizado - métricas:', {
      requestId: context.requestId,
      commandType: context.commandType,
      duration: `${duration.toFixed(2)}ms`,
      memoryUsage: `${memoryUsage.toFixed(2)}MB`,
      success,
      errorType
    });
  }

  private extractCommandType(message: Message): string {
    if (message.metadata?.command) {
      return message.metadata.command;
    }

    // Extraer comando del contenido del mensaje
    const content = message.content.trim();
    
    if (content.startsWith('/tg-search')) return 'search';
    if (content.startsWith('/tg-question')) return 'question';
    if (content.startsWith('/tg-summary')) return 'summary';
    if (content.startsWith('/tg-feedback')) return 'feedback';
    if (content.startsWith('/tg-help')) return 'help';
    if (content.startsWith('/tg-metrics')) return 'metrics';
    
    return 'unknown';
  }

  private classifyError(error: Error): string {
    const errorMessage = error.message.toLowerCase();
    const errorName = error.name.toLowerCase();

    // Clasificación por tipo de error
    if (errorName.includes('validation') || errorMessage.includes('validation')) {
      return 'validation_error';
    }
    
    if (errorName.includes('timeout') || errorMessage.includes('timeout')) {
      return 'timeout_error';
    }
    
    if (errorName.includes('network') || errorMessage.includes('network') || 
        errorMessage.includes('connection')) {
      return 'network_error';
    }
    
    if (errorName.includes('auth') || errorMessage.includes('auth') || 
        errorMessage.includes('permission')) {
      return 'auth_error';
    }
    
    if (errorMessage.includes('database') || errorMessage.includes('mongo')) {
      return 'database_error';
    }
    
    if (errorMessage.includes('ai') || errorMessage.includes('llm') || 
        errorMessage.includes('openai')) {
      return 'ai_service_error';
    }
    
    if (errorMessage.includes('confluence') || errorMessage.includes('api')) {
      return 'external_api_error';
    }
    
    return 'application_error';
  }

  private determineErrorSeverity(error: Error): 'low' | 'medium' | 'high' | 'critical' {
    const errorMessage = error.message.toLowerCase();
    const errorName = error.name.toLowerCase();

    // Errores críticos
    if (errorName.includes('fatal') || errorMessage.includes('crash') ||
        errorMessage.includes('security') || errorMessage.includes('database')) {
      return 'critical';
    }

    // Errores altos
    if (errorName.includes('timeout') || errorMessage.includes('connection') ||
        errorMessage.includes('auth') || errorMessage.includes('service')) {
      return 'high';
    }

    // Errores medios
    if (errorName.includes('validation') || errorMessage.includes('not found') ||
        errorMessage.includes('permission')) {
      return 'medium';
    }

    // Errores bajos por defecto
    return 'low';
  }

  private getPerformanceThreshold(commandType: string): number {
    // Umbrales basados en el tipo de comando (en milisegundos)
    const thresholds = {
      search: 3000,
      question: 8000,
      summary: 15000,
      feedback: 1000,
      help: 500,
      metrics: 2000,
      unknown: 5000
    };

    return thresholds[commandType as keyof typeof thresholds] || thresholds.unknown;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Decorator para aplicar automáticamente el middleware de métricas
export function withMetrics<T extends any[], R>(
  metricsMiddleware: MetricsMiddleware,
  logger: Logger
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<(...args: T) => Promise<R>>
  ) {
    const originalMethod = descriptor.value!;

    descriptor.value = async function (...args: T): Promise<R> {
      const message = args[0] as Message; // Asumimos que el primer argumento es Message
      let context: MetricsContext | null = null;
      let result: R;
      let error: Error | undefined;

      try {
        context = await metricsMiddleware.beforeCommand(message);
        result = await originalMethod.apply(this, args);
        return result;
      } catch (err) {
        error = err as Error;
        throw err;
      } finally {
        if (context) {
          await metricsMiddleware.afterCommand(context, result!, error);
        }
      }
    };

    return descriptor;
  };
}

// Factory para crear el middleware configurado
export function createMetricsMiddleware(
  metricsCollector: MetricsCollectorService,
  logger: Logger
): TGMetricsMiddleware {
  return new TGMetricsMiddleware(metricsCollector, logger);
} 