import { performance } from 'perf_hooks';
import { PerformanceMetrics } from './performance.config';

export class PerformanceMeasurer {
  private startTime: number = 0;
  private endTime: number = 0;
  private initialMemory: NodeJS.MemoryUsage;
  private finalMemory: NodeJS.MemoryUsage;

  constructor() {
    this.initialMemory = process.memoryUsage();
    this.finalMemory = process.memoryUsage();
  }

  start(): void {
    this.initialMemory = process.memoryUsage();
    this.startTime = performance.now();
  }

  stop(): PerformanceMetrics {
    this.endTime = performance.now();
    this.finalMemory = process.memoryUsage();

    const responseTime = this.endTime - this.startTime;
    const memoryUsage = (this.finalMemory.heapUsed - this.initialMemory.heapUsed) / (1024 * 1024); // MB

    return {
      responseTime,
      memoryUsage,
      errorRate: 0 // Se calcula externamente
    };
  }

  static async measureAsync<T>(
    operation: () => Promise<T>
  ): Promise<{ result: T; metrics: PerformanceMetrics }> {
    const measurer = new PerformanceMeasurer();
    measurer.start();
    
    let result: T;
    let errorOccurred = false;
    
    try {
      result = await operation();
    } catch (error) {
      errorOccurred = true;
      throw error;
    } finally {
      const metrics = measurer.stop();
      metrics.errorRate = errorOccurred ? 100 : 0;
      
      if (!errorOccurred) {
        return { result: result!, metrics };
      }
    }
    
    // Esta línea nunca debería ejecutarse debido al throw en el catch
    throw new Error('Unexpected execution path');
  }

  static async measureThroughput<T>(
    operation: () => Promise<T>,
    durationMs: number = 10000 // 10 segundos por defecto
  ): Promise<{ throughput: number; avgResponseTime: number; errorRate: number }> {
    const startTime = performance.now();
    const endTime = startTime + durationMs;
    
    let operations = 0;
    let totalResponseTime = 0;
    let errors = 0;
    
    while (performance.now() < endTime) {
      const operationStart = performance.now();
      
      try {
        await operation();
        operations++;
      } catch (error) {
        errors++;
      }
      
      totalResponseTime += performance.now() - operationStart;
    }
    
    const actualDuration = performance.now() - startTime;
    const throughput = (operations / actualDuration) * 1000; // operaciones por segundo
    const avgResponseTime = operations > 0 ? totalResponseTime / operations : 0;
    const errorRate = operations + errors > 0 ? (errors / (operations + errors)) * 100 : 0;
    
    return { throughput, avgResponseTime, errorRate };
  }

  static async measureConcurrency<T>(
    operation: () => Promise<T>,
    concurrentOperations: number = 10
  ): Promise<{ 
    successful: number; 
    failed: number; 
    avgResponseTime: number; 
    maxResponseTime: number;
    minResponseTime: number;
  }> {
    const promises: Promise<{ success: boolean; responseTime: number }>[] = [];
    
    for (let i = 0; i < concurrentOperations; i++) {
      const promise = (async () => {
        const start = performance.now();
        try {
          await operation();
          return { success: true, responseTime: performance.now() - start };
        } catch (error) {
          return { success: false, responseTime: performance.now() - start };
        }
      })();
      
      promises.push(promise);
    }
    
    const results = await Promise.all(promises);
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    const responseTimes = results.map(r => r.responseTime);
    
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const maxResponseTime = Math.max(...responseTimes);
    const minResponseTime = Math.min(...responseTimes);
    
    return {
      successful,
      failed,
      avgResponseTime,
      maxResponseTime,
      minResponseTime
    };
  }
}

export function formatMetrics(metrics: PerformanceMetrics): string {
  return [
    `⏱️  Response Time: ${metrics.responseTime.toFixed(2)}ms`,
    `🧠 Memory Usage: ${metrics.memoryUsage.toFixed(2)}MB`,
    `📊 Throughput: ${metrics.throughput?.toFixed(2) || 'N/A'} ops/sec`,
    `❌ Error Rate: ${metrics.errorRate.toFixed(2)}%`
  ].join('\n');
}

export function formatPerformanceReport(
  testName: string,
  metrics: PerformanceMetrics,
  thresholds: any,
  category: string
): string {
  const statusEmoji = {
    excellent: '🟢',
    good: '🟡', 
    warning: '🟠',
    critical: '🔴'
  }[category] || '⚪';

  return `
${statusEmoji} **${testName}**
${formatMetrics(metrics)}
📏 Thresholds: ${thresholds.maxResponseTime}ms | ${thresholds.maxMemoryUsage}MB
🏷️  Category: ${category.toUpperCase()}
`;
} 