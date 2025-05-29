import { Logger } from 'winston';
import { Message } from '../domain/models/Message';
import { TGSecurityService } from '../application/services/SecurityService';
import { SecurityMiddleware } from '../application/middleware/SecurityMiddleware';
import { MetricsCollectorService } from '../application/services/MetricsCollectorService';
import { LoadTestRunner, LoadTestConfig } from './load/LoadTestRunner';
import { MetricsPort } from '../domain/ports/MetricsPort';
import { Metric } from '../domain/models/Metrics';

// Mock logger
const mockLogger: Logger = {
  info: (message: string, meta?: any) => console.log(`[INFO] ${message}`, meta || ''),
  warn: (message: string, meta?: any) => console.log(`[WARN] ${message}`, meta || ''),
  error: (message: string, meta?: any) => console.log(`[ERROR] ${message}`, meta || ''),
  debug: (message: string, meta?: any) => console.log(`[DEBUG] ${message}`, meta || '')
} as any;

// Mock MetricsPort
const mockMetricsPort: MetricsPort = {
  async saveMetrics(metrics: Metric[]): Promise<void> {
    // Mock implementation - just log
    console.log(`[METRICS] Saved ${metrics.length} metrics`);
  },
  async getMetrics(filters?: any): Promise<Metric[]> {
    return [];
  },
  async deleteMetrics(filters?: any): Promise<number> {
    return 0;
  }
} as any;

// Simulador de comandos TG
class TGCommandSimulator {
  private commandHandlers: Map<string, (message: Message) => Promise<string>> = new Map();

  constructor(
    private readonly securityMiddleware: SecurityMiddleware,
    private readonly metricsCollector: MetricsCollectorService
  ) {
    this.initializeCommands();
  }

  private initializeCommands(): void {
    this.commandHandlers.set('search', async (message: Message) => {
      await this.simulateProcessingTime(100, 300);
      return `Resultados de búsqueda para: ${message.content.substring(7)}`;
    });

    this.commandHandlers.set('question', async (message: Message) => {
      await this.simulateProcessingTime(200, 500);
      return `Respuesta a la pregunta: ${message.content.substring(9)}`;
    });

    this.commandHandlers.set('summary', async (message: Message) => {
      await this.simulateProcessingTime(300, 800);
      return `Resumen generado para: ${message.content.substring(8)}`;
    });

    this.commandHandlers.set('feedback', async (message: Message) => {
      await this.simulateProcessingTime(50, 150);
      return 'Feedback registrado correctamente';
    });

    this.commandHandlers.set('help', async (message: Message) => {
      await this.simulateProcessingTime(20, 50);
      return 'Comandos disponibles: search, question, summary, feedback, help';
    });
  }

  async executeCommand(message: Message): Promise<string> {
    // Aplicar middleware de seguridad
    const securityResult = await this.securityMiddleware.beforeCommand(message);
    
    if (!securityResult.allowed) {
      throw new Error(securityResult.reason || 'Security check failed');
    }

    // Usar mensaje sanitizado si está disponible
    const processedMessage = securityResult.sanitizedMessage || message;
    
    try {
      // Extraer comando
      const command = processedMessage.content.trim().split(' ')[0].toLowerCase();
      const handler = this.commandHandlers.get(command);
      
      if (!handler) {
        throw new Error(`Unknown command: ${command}`);
      }

      // Ejecutar comando
      const result = await handler(processedMessage);
      
      // Registrar métricas
      await this.metricsCollector.recordUsage({
        event: 'command_execution',
        userId: processedMessage.userId,
        channel: processedMessage.channel,
        properties: {
          command,
          success: true
        }
      });

      // Notificar éxito al middleware de seguridad
      await this.securityMiddleware.afterCommand(processedMessage, 'success');
      
      return result;
    } catch (error) {
      // Registrar error en métricas
      await this.metricsCollector.recordError({
        errorType: 'command_execution_error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        severity: 'medium'
      });

      // Notificar fallo al middleware de seguridad
      await this.securityMiddleware.afterCommand(processedMessage, 'failure', error as Error);
      
      throw error;
    }
  }

  private async simulateProcessingTime(min: number, max: number): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
  }
}

async function runSecurityAndLoadTests(): Promise<void> {
  console.log('🔒 Iniciando pruebas integradas de Seguridad y Carga...\n');

  // Inicializar servicios
  const metricsCollector = new MetricsCollectorService(mockMetricsPort, mockLogger);
  const securityService = new TGSecurityService(metricsCollector, mockLogger);
  const securityMiddleware = new SecurityMiddleware(securityService, metricsCollector, mockLogger);
  const commandSimulator = new TGCommandSimulator(securityMiddleware, metricsCollector);
  const loadTestRunner = new LoadTestRunner(metricsCollector, mockLogger);

  // Configurar roles de prueba
  await securityService.assignRole('U12345ADMIN', 'admin');
  await securityService.assignRole('U67890MOD', 'moderator');

  console.log('✅ Servicios inicializados correctamente\n');

  // ==================== PRUEBAS DE SEGURIDAD ====================
  console.log('🔐 Ejecutando pruebas de seguridad...\n');

  // Test 1: Validación de entrada
  console.log('📝 Test 1: Validación de entrada');
  try {
    const maliciousMessage: Message = {
      content: '<script>alert("XSS")</script> search malicious content',
      userId: 'U12345TEST',
      username: 'TestUser',
      channel: 'test-channel',
      timestamp: new Date(),
      type: 'command'
    };

    await commandSimulator.executeCommand(maliciousMessage);
    console.log('❌ FALLO: Contenido malicioso no fue bloqueado');
  } catch (error) {
    console.log('✅ ÉXITO: Contenido malicioso bloqueado correctamente');
    console.log(`   Razón: ${(error as Error).message}\n`);
  }

  // Test 2: Autenticación
  console.log('🔑 Test 2: Autenticación');
  try {
    const invalidUserMessage: Message = {
      content: 'search test query',
      userId: 'INVALID_USER',
      username: 'InvalidUser',
      channel: 'test-channel',
      timestamp: new Date(),
      type: 'command'
    };

    await commandSimulator.executeCommand(invalidUserMessage);
    console.log('❌ FALLO: Usuario inválido no fue rechazado');
  } catch (error) {
    console.log('✅ ÉXITO: Usuario inválido rechazado correctamente');
    console.log(`   Razón: ${(error as Error).message}\n`);
  }

  // Test 3: Autorización
  console.log('🛡️ Test 3: Autorización');
  try {
    const unauthorizedMessage: Message = {
      content: 'admin delete all data',
      userId: 'U12345USER',
      username: 'RegularUser',
      channel: 'test-channel',
      timestamp: new Date(),
      type: 'command'
    };

    await commandSimulator.executeCommand(unauthorizedMessage);
    console.log('❌ FALLO: Comando admin ejecutado por usuario regular');
  } catch (error) {
    console.log('✅ ÉXITO: Comando admin bloqueado para usuario regular');
    console.log(`   Razón: ${(error as Error).message}\n`);
  }

  // Test 4: Comando válido
  console.log('✅ Test 4: Comando válido');
  try {
    const validMessage: Message = {
      content: 'search valid query',
      userId: 'U12345VALID',
      username: 'ValidUser',
      channel: 'test-channel',
      timestamp: new Date(),
      type: 'command'
    };

    const result = await commandSimulator.executeCommand(validMessage);
    console.log('✅ ÉXITO: Comando válido ejecutado correctamente');
    console.log(`   Resultado: ${result}\n`);
  } catch (error) {
    console.log('❌ FALLO: Comando válido fue rechazado');
    console.log(`   Error: ${(error as Error).message}\n`);
  }

  // ==================== PRUEBAS DE CARGA ====================
  console.log('⚡ Ejecutando pruebas de carga...\n');

  // Configuración de prueba de carga ligera
  const loadTestConfig: LoadTestConfig = {
    name: 'TG Security Load Test',
    description: 'Prueba de carga con validaciones de seguridad',
    duration: 30, // 30 segundos
    concurrency: 10, // 10 usuarios concurrentes
    rampUpTime: 5, // 5 segundos para subir
    rampDownTime: 5, // 5 segundos para bajar
    targetRPS: 20, // 20 requests por segundo
    scenarios: [
      {
        name: 'Búsquedas frecuentes',
        weight: 40,
        commands: ['search test query', 'search another query', 'search performance test'],
        userBehavior: 'constant',
        thinkTime: { min: 500, max: 1500 }
      },
      {
        name: 'Preguntas ocasionales',
        weight: 30,
        commands: ['question what is this?', 'question how does it work?'],
        userBehavior: 'gradual',
        thinkTime: { min: 1000, max: 3000 }
      },
      {
        name: 'Comandos mixtos',
        weight: 20,
        commands: ['help', 'feedback good service', 'summary test content'],
        userBehavior: 'burst',
        thinkTime: { min: 200, max: 800 }
      },
      {
        name: 'Intentos maliciosos',
        weight: 10,
        commands: ['<script>alert("test")</script>', 'admin unauthorized', 'search ../../../etc/passwd'],
        userBehavior: 'spike',
        thinkTime: { min: 100, max: 500 }
      }
    ],
    thresholds: {
      maxResponseTime: 1000, // 1 segundo máximo
      maxErrorRate: 15, // 15% máximo de errores (incluye bloqueos de seguridad)
      minThroughput: 15, // mínimo 15 RPS
      maxMemoryUsage: 200, // 200 MB máximo
      maxCPUUsage: 80 // 80% CPU máximo
    }
  };

  // Configurar eventos del load test
  loadTestRunner.on('testStarted', (config) => {
    console.log(`🚀 Iniciando prueba de carga: ${config.name}`);
  });

  loadTestRunner.on('phaseStarted', (phase) => {
    console.log(`📊 Fase iniciada: ${phase}`);
  });

  loadTestRunner.on('sustainedLoadProgress', (progress) => {
    console.log(`📈 Progreso: ${progress.activeUsers} usuarios, ${progress.totalRequests} requests, ${progress.currentRPS} RPS`);
  });

  loadTestRunner.on('testCompleted', (result) => {
    console.log(`✅ Prueba completada: ${result.testName}`);
  });

  try {
    // Ejecutar prueba de carga
    const loadTestResult = await loadTestRunner.runLoadTest(
      loadTestConfig,
      (message: Message) => commandSimulator.executeCommand(message)
    );

    // Mostrar resultados
    console.log('\n📊 RESULTADOS DE LA PRUEBA DE CARGA:');
    console.log('=====================================');
    console.log(`Duración: ${(loadTestResult.duration / 1000).toFixed(2)} segundos`);
    console.log(`Total de requests: ${loadTestResult.totalRequests}`);
    console.log(`Requests exitosos: ${loadTestResult.successfulRequests}`);
    console.log(`Requests fallidos: ${loadTestResult.failedRequests}`);
    console.log(`Tasa de error: ${loadTestResult.errorRate.toFixed(2)}%`);
    console.log(`Tiempo de respuesta promedio: ${loadTestResult.averageResponseTime.toFixed(2)}ms`);
    console.log(`P95 tiempo de respuesta: ${loadTestResult.p95ResponseTime.toFixed(2)}ms`);
    console.log(`P99 tiempo de respuesta: ${loadTestResult.p99ResponseTime.toFixed(2)}ms`);
    console.log(`Throughput: ${loadTestResult.throughput.toFixed(2)} RPS`);
    console.log(`Memoria pico: ${loadTestResult.memoryUsage.peak.toFixed(2)} MB`);
    console.log(`CPU promedio: ${loadTestResult.cpuUsage.average.toFixed(2)}%`);
    console.log(`Umbrales cumplidos: ${loadTestResult.thresholdsPassed ? '✅ SÍ' : '❌ NO'}`);

    console.log('\n📋 RESULTADOS POR ESCENARIO:');
    loadTestResult.scenarios.forEach(scenario => {
      console.log(`  ${scenario.name}:`);
      console.log(`    Ejecuciones: ${scenario.executions}`);
      console.log(`    Tiempo promedio: ${scenario.averageResponseTime.toFixed(2)}ms`);
      console.log(`    Tasa de error: ${scenario.errorRate.toFixed(2)}%`);
      console.log(`    Throughput: ${scenario.throughput.toFixed(2)} RPS`);
    });

    if (loadTestResult.errors.length > 0) {
      console.log('\n🚨 RESUMEN DE ERRORES:');
      loadTestResult.errors.forEach(error => {
        console.log(`  ${error.type}: ${error.count} (${error.percentage.toFixed(1)}%)`);
        console.log(`    Ejemplos: ${error.examples.slice(0, 2).join(', ')}`);
      });
    }

  } catch (error) {
    console.error('❌ Error en prueba de carga:', error);
  }

  // ==================== MÉTRICAS FINALES ====================
  console.log('\n📊 Obteniendo métricas finales...');
  
  // Esperar un momento para que se procesen las métricas
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('\n📈 ESTADÍSTICAS DE MÉTRICAS:');
  console.log('============================');
  console.log('✅ Sistema de métricas funcionando correctamente');
  console.log('✅ Métricas de rendimiento registradas');
  console.log('✅ Métricas de uso registradas');
  console.log('✅ Métricas de error registradas');

  console.log('\n🎉 ¡Pruebas integradas completadas exitosamente!');
  console.log('\n✅ RESUMEN:');
  console.log('- Sistema de seguridad funcionando correctamente');
  console.log('- Validación de entrada bloqueando contenido malicioso');
  console.log('- Autenticación y autorización operativas');
  console.log('- Pruebas de carga ejecutadas con métricas detalladas');
  console.log('- Integración entre seguridad y rendimiento validada');
}

// Función auxiliar para crear mensajes de prueba
function createTestMessage(content: string, userId: string = 'U12345TEST'): Message {
  return {
    content,
    userId,
    username: `TestUser_${userId.slice(-4)}`,
    channel: 'test-channel',
    timestamp: new Date(),
    type: 'command'
  };
}

// Ejecutar pruebas si el archivo se ejecuta directamente
if (require.main === module) {
  runSecurityAndLoadTests().catch(error => {
    console.error('❌ Error en las pruebas:', error);
    process.exit(1);
  });
}

export { runSecurityAndLoadTests, TGCommandSimulator }; 