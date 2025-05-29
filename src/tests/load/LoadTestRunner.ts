import { performance } from 'perf_hooks';
import { EventEmitter } from 'events';
import { Logger } from 'winston';
import { Message } from '../../domain/models/Message';
import { MetricsCollectorService } from '../../application/services/MetricsCollectorService';

export interface LoadTestConfig {
  name: string;
  description: string;
  duration: number; // segundos
  concurrency: number; // usuarios concurrentes
  rampUpTime: number; // segundos para alcanzar concurrencia máxima
  rampDownTime: number; // segundos para reducir carga
  targetRPS: number; // requests per second objetivo
  scenarios: LoadTestScenario[];
  thresholds: LoadTestThresholds;
}

export interface LoadTestScenario {
  name: string;
  weight: number; // porcentaje de ejecución (0-100)
  commands: string[];
  userBehavior: 'constant' | 'burst' | 'spike' | 'gradual';
  thinkTime: { min: number; max: number }; // tiempo entre comandos en ms
}

export interface LoadTestThresholds {
  maxResponseTime: number; // ms
  maxErrorRate: number; // porcentaje
  minThroughput: number; // requests/second
  maxMemoryUsage: number; // MB
  maxCPUUsage: number; // porcentaje
}

export interface LoadTestResult {
  testName: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  maxResponseTime: number;
  minResponseTime: number;
  throughput: number; // requests/second
  errorRate: number; // porcentaje
  memoryUsage: MemoryUsageStats;
  cpuUsage: CPUUsageStats;
  scenarios: ScenarioResult[];
  thresholdsPassed: boolean;
  errors: ErrorSummary[];
}

export interface MemoryUsageStats {
  initial: number;
  peak: number;
  final: number;
  average: number;
}

export interface CPUUsageStats {
  average: number;
  peak: number;
}

export interface ScenarioResult {
  name: string;
  executions: number;
  averageResponseTime: number;
  errorRate: number;
  throughput: number;
}

export interface ErrorSummary {
  type: string;
  count: number;
  percentage: number;
  examples: string[];
}

export class LoadTestRunner extends EventEmitter {
  private isRunning = false;
  private startTime!: Date;
  private endTime!: Date;
  private results: RequestResult[] = [];
  private memorySnapshots: number[] = [];
  private cpuSnapshots: number[] = [];
  private activeUsers = 0;
  private totalRequests = 0;

  constructor(
    private readonly metricsCollector: MetricsCollectorService,
    private readonly logger: Logger
  ) {
    super();
  }

  async runLoadTest(config: LoadTestConfig, commandExecutor: (message: Message) => Promise<any>): Promise<LoadTestResult> {
    this.logger.info(`Starting load test: ${config.name}`);
    this.emit('testStarted', config);

    this.isRunning = true;
    this.startTime = new Date();
    this.results = [];
    this.memorySnapshots = [];
    this.cpuSnapshots = [];
    this.activeUsers = 0;
    this.totalRequests = 0;

    // Iniciar monitoreo de recursos
    const resourceMonitor = this.startResourceMonitoring();

    try {
      // Ejecutar fases del test
      await this.executeRampUp(config, commandExecutor);
      await this.executeSustainedLoad(config, commandExecutor);
      await this.executeRampDown(config, commandExecutor);

      this.endTime = new Date();
      this.isRunning = false;

      // Detener monitoreo
      clearInterval(resourceMonitor);

      // Generar resultados
      const result = this.generateResults(config);
      
      this.logger.info(`Load test completed: ${config.name}`, {
        duration: result.duration,
        totalRequests: result.totalRequests,
        errorRate: result.errorRate,
        averageResponseTime: result.averageResponseTime
      });

      this.emit('testCompleted', result);
      return result;

    } catch (error) {
      this.isRunning = false;
      clearInterval(resourceMonitor);
      this.logger.error('Load test failed:', error);
      this.emit('testFailed', error);
      throw error;
    }
  }

  private async executeRampUp(config: LoadTestConfig, commandExecutor: (message: Message) => Promise<any>): Promise<void> {
    this.logger.info('Starting ramp-up phase');
    this.emit('phaseStarted', 'rampUp');

    const rampUpSteps = 10;
    const stepDuration = config.rampUpTime / rampUpSteps;
    const usersPerStep = config.concurrency / rampUpSteps;

    for (let step = 1; step <= rampUpSteps; step++) {
      const targetUsers = Math.floor(usersPerStep * step);
      
      // Agregar usuarios hasta alcanzar el objetivo del paso
      while (this.activeUsers < targetUsers && this.isRunning) {
        this.startVirtualUser(config, commandExecutor);
        await this.sleep(100); // Pequeña pausa entre usuarios
      }

      // Esperar duración del paso
      await this.sleep(stepDuration * 1000);
      
      this.emit('rampUpProgress', { step, targetUsers, activeUsers: this.activeUsers });
    }

    this.emit('phaseCompleted', 'rampUp');
  }

  private async executeSustainedLoad(config: LoadTestConfig, commandExecutor: (message: Message) => Promise<any>): Promise<void> {
    this.logger.info('Starting sustained load phase');
    this.emit('phaseStarted', 'sustainedLoad');

    const sustainedDuration = config.duration - config.rampUpTime - config.rampDownTime;
    const endTime = Date.now() + (sustainedDuration * 1000);

    while (Date.now() < endTime && this.isRunning) {
      // Mantener usuarios activos
      while (this.activeUsers < config.concurrency && this.isRunning) {
        this.startVirtualUser(config, commandExecutor);
        await this.sleep(50);
      }

      await this.sleep(1000);
      this.emit('sustainedLoadProgress', { 
        activeUsers: this.activeUsers, 
        totalRequests: this.totalRequests,
        currentRPS: this.calculateCurrentRPS()
      });
    }

    this.emit('phaseCompleted', 'sustainedLoad');
  }

  private async executeRampDown(config: LoadTestConfig, commandExecutor: (message: Message) => Promise<any>): Promise<void> {
    this.logger.info('Starting ramp-down phase');
    this.emit('phaseStarted', 'rampDown');

    // Gradualmente detener usuarios
    const rampDownSteps = 5;
    const stepDuration = config.rampDownTime / rampDownSteps;

    for (let step = 1; step <= rampDownSteps; step++) {
      await this.sleep(stepDuration * 1000);
      this.emit('rampDownProgress', { step, activeUsers: this.activeUsers });
    }

    // Esperar a que terminen las requests activas
    let waitTime = 0;
    while (this.activeUsers > 0 && waitTime < 30000) {
      await this.sleep(1000);
      waitTime += 1000;
    }

    this.emit('phaseCompleted', 'rampDown');
  }

  private startVirtualUser(config: LoadTestConfig, commandExecutor: (message: Message) => Promise<any>): void {
    this.activeUsers++;
    
    const executeUserSession = async () => {
      const userId = `load_test_user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      try {
        while (this.isRunning) {
          // Seleccionar escenario basado en peso
          const scenario = this.selectScenario(config.scenarios);
          
          // Ejecutar comando del escenario
          const command = this.selectCommand(scenario);
          const message = this.createTestMessage(userId, command);
          
          const requestResult = await this.executeRequest(message, commandExecutor);
          this.results.push(requestResult);
          this.totalRequests++;

          // Tiempo de espera entre comandos
          const thinkTime = this.randomBetween(scenario.thinkTime.min, scenario.thinkTime.max);
          await this.sleep(thinkTime);
        }
      } catch (error) {
        this.logger.error('Virtual user error:', error);
      } finally {
        this.activeUsers--;
      }
    };

    executeUserSession();
  }

  private selectScenario(scenarios: LoadTestScenario[]): LoadTestScenario {
    const random = Math.random() * 100;
    let cumulative = 0;
    
    for (const scenario of scenarios) {
      cumulative += scenario.weight;
      if (random <= cumulative) {
        return scenario;
      }
    }
    
    return scenarios[scenarios.length - 1];
  }

  private selectCommand(scenario: LoadTestScenario): string {
    const randomIndex = Math.floor(Math.random() * scenario.commands.length);
    return scenario.commands[randomIndex];
  }

  private createTestMessage(userId: string, command: string): Message {
    return {
      content: command,
      userId,
      username: `LoadTestUser_${userId.split('_')[3]}`,
      channel: 'load-test-channel',
      timestamp: new Date(),
      type: 'command',
      metadata: {
        isLoadTest: true,
        testId: this.startTime.getTime()
      }
    };
  }

  private async executeRequest(message: Message, commandExecutor: (message: Message) => Promise<any>): Promise<RequestResult> {
    const startTime = performance.now();
    let success = false;
    let error: string | undefined;

    try {
      await commandExecutor(message);
      success = true;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown error';
    }

    const endTime = performance.now();
    const responseTime = endTime - startTime;

    return {
      timestamp: new Date(),
      responseTime,
      success,
      error,
      command: message.content.split(' ')[0]
    };
  }

  private startResourceMonitoring(): NodeJS.Timeout {
    return setInterval(() => {
      // Monitoreo de memoria
      const memUsage = process.memoryUsage();
      this.memorySnapshots.push(memUsage.heapUsed / 1024 / 1024); // MB

      // Monitoreo de CPU (simplificado)
      const cpuUsage = process.cpuUsage();
      this.cpuSnapshots.push((cpuUsage.user + cpuUsage.system) / 1000000); // segundos
    }, 1000);
  }

  private calculateCurrentRPS(): number {
    const now = Date.now();
    const oneSecondAgo = now - 1000;
    
    const recentRequests = this.results.filter(r => 
      r.timestamp.getTime() >= oneSecondAgo && r.timestamp.getTime() <= now
    );
    
    return recentRequests.length;
  }

  private generateResults(config: LoadTestConfig): LoadTestResult {
    const duration = this.endTime.getTime() - this.startTime.getTime();
    const successfulRequests = this.results.filter(r => r.success).length;
    const failedRequests = this.results.length - successfulRequests;
    
    const responseTimes = this.results.map(r => r.responseTime).sort((a, b) => a - b);
    const averageResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    
    const p95Index = Math.floor(responseTimes.length * 0.95);
    const p99Index = Math.floor(responseTimes.length * 0.99);
    
    const throughput = (this.results.length / duration) * 1000; // requests per second
    const errorRate = (failedRequests / this.results.length) * 100;

    const memoryUsage: MemoryUsageStats = {
      initial: this.memorySnapshots[0] || 0,
      peak: Math.max(...this.memorySnapshots),
      final: this.memorySnapshots[this.memorySnapshots.length - 1] || 0,
      average: this.memorySnapshots.reduce((sum, mem) => sum + mem, 0) / this.memorySnapshots.length
    };

    const cpuUsage: CPUUsageStats = {
      average: this.cpuSnapshots.reduce((sum, cpu) => sum + cpu, 0) / this.cpuSnapshots.length,
      peak: Math.max(...this.cpuSnapshots)
    };

    const scenarios = this.generateScenarioResults(config.scenarios);
    const errors = this.generateErrorSummary();
    const thresholdsPassed = this.checkThresholds(config.thresholds, {
      averageResponseTime,
      errorRate,
      throughput,
      memoryUsage,
      cpuUsage
    });

    return {
      testName: config.name,
      startTime: this.startTime,
      endTime: this.endTime,
      duration,
      totalRequests: this.results.length,
      successfulRequests,
      failedRequests,
      averageResponseTime,
      p95ResponseTime: responseTimes[p95Index] || 0,
      p99ResponseTime: responseTimes[p99Index] || 0,
      maxResponseTime: Math.max(...responseTimes),
      minResponseTime: Math.min(...responseTimes),
      throughput,
      errorRate,
      memoryUsage,
      cpuUsage,
      scenarios,
      thresholdsPassed,
      errors
    };
  }

  private generateScenarioResults(scenarios: LoadTestScenario[]): ScenarioResult[] {
    return scenarios.map(scenario => {
      const scenarioResults = this.results.filter(r => 
        scenario.commands.includes(r.command)
      );
      
      const successfulResults = scenarioResults.filter(r => r.success);
      const averageResponseTime = successfulResults.length > 0 
        ? successfulResults.reduce((sum, r) => sum + r.responseTime, 0) / successfulResults.length
        : 0;
      
      const errorRate = scenarioResults.length > 0
        ? ((scenarioResults.length - successfulResults.length) / scenarioResults.length) * 100
        : 0;

      return {
        name: scenario.name,
        executions: scenarioResults.length,
        averageResponseTime,
        errorRate,
        throughput: scenarioResults.length / ((this.endTime.getTime() - this.startTime.getTime()) / 1000)
      };
    });
  }

  private generateErrorSummary(): ErrorSummary[] {
    const errorMap = new Map<string, string[]>();
    
    this.results.filter(r => !r.success && r.error).forEach(r => {
      const errorType = r.error!.split(':')[0] || 'Unknown';
      if (!errorMap.has(errorType)) {
        errorMap.set(errorType, []);
      }
      errorMap.get(errorType)!.push(r.error!);
    });

    const totalErrors = this.results.filter(r => !r.success).length;
    
    return Array.from(errorMap.entries()).map(([type, examples]) => ({
      type,
      count: examples.length,
      percentage: (examples.length / totalErrors) * 100,
      examples: examples.slice(0, 5) // Primeros 5 ejemplos
    }));
  }

  private checkThresholds(thresholds: LoadTestThresholds, metrics: any): boolean {
    return (
      metrics.averageResponseTime <= thresholds.maxResponseTime &&
      metrics.errorRate <= thresholds.maxErrorRate &&
      metrics.throughput >= thresholds.minThroughput &&
      metrics.memoryUsage.peak <= thresholds.maxMemoryUsage &&
      metrics.cpuUsage.peak <= thresholds.maxCPUUsage
    );
  }

  private randomBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  stop(): void {
    this.isRunning = false;
    this.emit('testStopped');
  }
}

interface RequestResult {
  timestamp: Date;
  responseTime: number;
  success: boolean;
  error?: string;
  command: string;
} 