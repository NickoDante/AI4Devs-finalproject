import { Logger } from 'winston';
import { v4 as uuidv4 } from 'uuid';
import { MetricsPort, MetricsCollector } from '../../domain/ports/MetricsPort';
import { 
  Metric, 
  PerformanceMetric, 
  UsageMetric, 
  SystemMetric, 
  ErrorMetric 
} from '../../domain/models/Metrics';

export class MetricsCollectorService implements MetricsCollector {
  private metricsBuffer: Metric[] = [];
  private bufferSize: number = 100;
  private flushInterval: number = 10000; // 10 segundos
  private flushTimer: NodeJS.Timeout | null = null;

  constructor(
    private readonly metricsPort: MetricsPort,
    private readonly logger: Logger
  ) {
    this.startBuffering();
  }

  private startBuffering(): void {
    this.flushTimer = setInterval(() => {
      this.flushBuffer();
    }, this.flushInterval);
  }

  private async flushBuffer(): Promise<void> {
    if (this.metricsBuffer.length === 0) return;

    try {
      const metricsToFlush = [...this.metricsBuffer];
      this.metricsBuffer = [];

      await this.metricsPort.saveMetrics(metricsToFlush);
      this.logger.debug('Buffer de métricas enviado:', { count: metricsToFlush.length });
    } catch (error) {
      this.logger.error('Error enviando buffer de métricas:', error);
      // En caso de error, volver a agregar las métricas al buffer
      this.metricsBuffer.unshift(...this.metricsBuffer);
    }
  }

  private addToBuffer(metric: Metric): void {
    this.metricsBuffer.push(metric);

    // Flush inmediato si el buffer está lleno
    if (this.metricsBuffer.length >= this.bufferSize) {
      this.flushBuffer();
    }
  }

  async recordPerformance(data: {
    commandType: string;
    responseTime: number;
    memoryUsage: number;
    success: boolean;
    userId: string;
    channel: string;
    errorType?: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      const metric: PerformanceMetric = {
        id: uuidv4(),
        timestamp: new Date(),
        source: 'command',
        category: 'performance',
        type: 'performance',
        commandType: data.commandType,
        responseTime: data.responseTime,
        memoryUsage: data.memoryUsage,
        success: data.success,
        userId: data.userId,
        channel: data.channel,
        errorType: data.errorType,
        tags: ['performance', data.commandType, data.success ? 'success' : 'failure'],
        metadata: {
          ...data.metadata,
          node_env: process.env.NODE_ENV,
          timestamp_iso: new Date().toISOString()
        }
      };

      this.addToBuffer(metric);
      this.logger.debug('Métrica de rendimiento registrada:', { 
        commandType: data.commandType, 
        responseTime: data.responseTime,
        success: data.success 
      });
    } catch (error) {
      this.logger.error('Error registrando métrica de rendimiento:', error);
    }
  }

  async recordUsage(data: {
    event: string;
    userId: string;
    channel: string;
    count?: number;
    value?: number;
    properties?: Record<string, any>;
  }): Promise<void> {
    try {
      const metric: UsageMetric = {
        id: uuidv4(),
        timestamp: new Date(),
        source: 'user',
        category: 'usage',
        type: 'usage',
        event: data.event,
        userId: data.userId,
        channel: data.channel,
        count: data.count || 1,
        value: data.value,
        properties: data.properties,
        tags: ['usage', data.event],
        metadata: {
          node_env: process.env.NODE_ENV,
          timestamp_iso: new Date().toISOString()
        }
      };

      this.addToBuffer(metric);
      this.logger.debug('Métrica de uso registrada:', { 
        event: data.event, 
        userId: data.userId,
        count: data.count 
      });
    } catch (error) {
      this.logger.error('Error registrando métrica de uso:', error);
    }
  }

  async recordSystem(data: {
    component: string;
    metric: string;
    value: number;
    unit: string;
    threshold?: number;
    status?: 'normal' | 'warning' | 'critical';
  }): Promise<void> {
    try {
      const status = data.status || this.calculateSystemStatus(data.value, data.threshold);

      const metric: SystemMetric = {
        id: uuidv4(),
        timestamp: new Date(),
        source: 'system',
        category: 'system',
        type: 'system',
        component: data.component,
        metric: data.metric,
        value: data.value,
        unit: data.unit,
        threshold: data.threshold,
        status,
        tags: ['system', data.component, data.metric, status],
        metadata: {
          node_env: process.env.NODE_ENV,
          timestamp_iso: new Date().toISOString(),
          hostname: process.env.HOSTNAME || 'unknown'
        }
      };

      this.addToBuffer(metric);
      this.logger.debug('Métrica de sistema registrada:', { 
        component: data.component, 
        metric: data.metric,
        value: data.value,
        status 
      });
    } catch (error) {
      this.logger.error('Error registrando métrica de sistema:', error);
    }
  }

  async recordError(data: {
    errorType: string;
    errorMessage: string;
    errorCode?: string;
    stackTrace?: string;
    userId?: string;
    channel?: string;
    commandType?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
  }): Promise<void> {
    try {
      const severity = data.severity || this.calculateErrorSeverity(data.errorType, data.errorMessage);

      const metric: ErrorMetric = {
        id: uuidv4(),
        timestamp: new Date(),
        source: 'error',
        category: 'error',
        type: 'error',
        errorType: data.errorType,
        errorMessage: data.errorMessage,
        errorCode: data.errorCode,
        stackTrace: data.stackTrace,
        userId: data.userId,
        channel: data.channel,
        commandType: data.commandType,
        severity,
        tags: ['error', data.errorType, severity],
        metadata: {
          node_env: process.env.NODE_ENV,
          timestamp_iso: new Date().toISOString(),
          hostname: process.env.HOSTNAME || 'unknown'
        }
      };

      this.addToBuffer(metric);
      this.logger.error('Métrica de error registrada:', { 
        errorType: data.errorType,
        errorMessage: data.errorMessage,
        severity 
      });
    } catch (error) {
      this.logger.error('Error registrando métrica de error:', error);
    }
  }

  // Métodos de conveniencia para incrementadores simples
  async incrementCounter(name: string, tags?: string[]): Promise<void> {
    await this.recordUsage({
      event: `counter_${name}`,
      userId: 'system',
      channel: 'system',
      count: 1,
      properties: { tags }
    });
  }

  async recordTiming(name: string, duration: number, tags?: string[]): Promise<void> {
    await this.recordSystem({
      component: 'application',
      metric: `timing_${name}`,
      value: duration,
      unit: 'ms'
    });
  }

  async setGauge(name: string, value: number, tags?: string[]): Promise<void> {
    await this.recordSystem({
      component: 'application',
      metric: `gauge_${name}`,
      value,
      unit: 'count'
    });
  }

  // Métodos específicos para comandos TG
  async recordCommandStart(commandType: string, userId: string, channel: string): Promise<void> {
    await this.recordUsage({
      event: 'command_started',
      userId,
      channel,
      properties: { commandType }
    });
  }

  async recordCommandEnd(
    commandType: string, 
    userId: string, 
    channel: string, 
    duration: number, 
    success: boolean,
    errorType?: string
  ): Promise<void> {
    await this.recordPerformance({
      commandType,
      responseTime: duration,
      memoryUsage: process.memoryUsage().heapUsed / (1024 * 1024), // MB
      success,
      userId,
      channel,
      errorType
    });

    await this.recordUsage({
      event: 'command_completed',
      userId,
      channel,
      properties: { commandType, duration, success, errorType }
    });
  }

  async recordUserActivity(userId: string, channel: string, activity: string): Promise<void> {
    await this.recordUsage({
      event: 'user_activity',
      userId,
      channel,
      properties: { activity }
    });
  }

  async recordAPICall(
    api: string, 
    endpoint: string, 
    duration: number, 
    success: boolean,
    statusCode?: number
  ): Promise<void> {
    await this.recordSystem({
      component: api,
      metric: 'api_call_duration',
      value: duration,
      unit: 'ms',
      status: success ? 'normal' : 'warning'
    });

    if (!success) {
      await this.recordError({
        errorType: 'api_error',
        errorMessage: `API call failed: ${api}/${endpoint}`,
        errorCode: statusCode?.toString(),
        severity: 'medium'
      });
    }
  }

  // Métodos auxiliares
  private calculateSystemStatus(value: number, threshold?: number): 'normal' | 'warning' | 'critical' {
    if (!threshold) return 'normal';
    
    if (value >= threshold * 1.5) return 'critical';
    if (value >= threshold) return 'warning';
    return 'normal';
  }

  private calculateErrorSeverity(errorType: string, errorMessage: string): 'low' | 'medium' | 'high' | 'critical' {
    const criticalKeywords = ['crash', 'fatal', 'security', 'auth', 'database'];
    const highKeywords = ['timeout', 'connection', 'network', 'service'];
    const mediumKeywords = ['validation', 'permission', 'not found'];

    const text = `${errorType} ${errorMessage}`.toLowerCase();

    if (criticalKeywords.some(keyword => text.includes(keyword))) {
      return 'critical';
    }
    
    if (highKeywords.some(keyword => text.includes(keyword))) {
      return 'high';
    }
    
    if (mediumKeywords.some(keyword => text.includes(keyword))) {
      return 'medium';
    }
    
    return 'low';
  }

  // Métodos de gestión del servicio
  async flush(): Promise<void> {
    await this.flushBuffer();
  }

  async shutdown(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    
    await this.flushBuffer();
    this.logger.info('MetricsCollectorService detenido');
  }

  getBufferStatus(): { size: number; maxSize: number; flushInterval: number } {
    return {
      size: this.metricsBuffer.length,
      maxSize: this.bufferSize,
      flushInterval: this.flushInterval
    };
  }

  configure(options: {
    bufferSize?: number;
    flushInterval?: number;
  }): void {
    if (options.bufferSize !== undefined) {
      this.bufferSize = options.bufferSize;
    }
    
    if (options.flushInterval !== undefined) {
      this.flushInterval = options.flushInterval;
      
      // Reiniciar el timer con el nuevo intervalo
      if (this.flushTimer) {
        clearInterval(this.flushTimer);
        this.startBuffering();
      }
    }
    
    this.logger.info('MetricsCollectorService configurado:', {
      bufferSize: this.bufferSize,
      flushInterval: this.flushInterval
    });
  }
} 