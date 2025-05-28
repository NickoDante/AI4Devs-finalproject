#!/usr/bin/env ts-node

import { Logger } from 'winston';
import { createLogger, format, transports } from 'winston';
import { MetricsCollectorService } from '../application/services/MetricsCollectorService';
import { TGRateLimitService } from '../application/services/RateLimitService';
import { MongoDBMetricsAdapter } from '../adapters/metrics/MongoDBMetricsAdapter';
import { MemoryRateLimitAdapter } from '../adapters/rate-limit/MemoryRateLimitAdapter';
import { TGMetricsMiddleware } from '../application/middleware/MetricsMiddleware';
import { TGRateLimitMiddleware } from '../application/middleware/RateLimitMiddleware';
import { Message } from '../domain/models/Message';

// Configurar logger
const logger: Logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.colorize(),
    format.simple()
  ),
  transports: [
    new transports.Console()
  ]
});

class QuickTestRunner {
  private metricsAdapter!: MongoDBMetricsAdapter;
  private rateLimitAdapter!: MemoryRateLimitAdapter;
  private metricsCollector!: MetricsCollectorService;
  private rateLimitService!: TGRateLimitService;
  private metricsMiddleware!: TGMetricsMiddleware;
  private rateLimitMiddleware!: TGRateLimitMiddleware;

  constructor() {
    this.setupServices();
  }

  private setupServices(): void {
    // Adaptadores (usamos memoria para pruebas rápidas)
    this.rateLimitAdapter = new MemoryRateLimitAdapter(logger);
    
    // Para métricas, usamos un mock simple
    this.metricsAdapter = {
      saveMetric: async () => {},
      saveMetrics: async () => {},
      healthCheck: async () => true
    } as any;

    // Servicios
    this.metricsCollector = new MetricsCollectorService(this.metricsAdapter, logger);
    this.rateLimitService = new TGRateLimitService(
      this.rateLimitAdapter,
      this.metricsCollector,
      logger
    );

    // Middlewares
    this.metricsMiddleware = new TGMetricsMiddleware(this.metricsCollector, logger);
    this.rateLimitMiddleware = new TGRateLimitMiddleware(
      this.rateLimitService,
      this.metricsCollector,
      logger
    );
  }

  async runTests(): Promise<void> {
    console.log('🚀 **Iniciando Pruebas Rápidas: Métricas y Rate Limiting**\n');

    try {
      await this.testMetricsSystem();
      await this.testRateLimitingSystem();
      await this.testIntegration();
      
      console.log('\n✅ **Todas las pruebas completadas exitosamente**');
    } catch (error) {
      console.error('\n❌ **Error en las pruebas:**', error);
    }
  }

  private async testMetricsSystem(): Promise<void> {
    console.log('📊 **Test 1: Sistema de Métricas**');
    
    // Simular comandos con métricas
    const testMessages = [
      { type: 'search', user: 'user1', channel: 'channel1' },
      { type: 'question', user: 'user1', channel: 'channel1' },
      { type: 'summary', user: 'user2', channel: 'channel2' }
    ];

    for (const test of testMessages) {
      const message: Message = {
        content: `/tg-${test.type} test`,
        userId: test.user,
        username: `User ${test.user}`,
        channel: test.channel,
        timestamp: new Date(),
        type: 'command',
        metadata: { command: test.type as 'search' | 'question' | 'summary' }
      };

      const context = await this.metricsMiddleware.beforeCommand(message);
      
      // Simular tiempo de procesamiento
      await this.sleep(Math.random() * 100 + 50);
      
      await this.metricsMiddleware.afterCommand(context, { success: true });
      
      console.log(`  ✓ Métrica registrada para comando: ${test.type}`);
    }

    // Simular feedback por separado (sin command metadata)
    const feedbackMessage: Message = {
      content: '/tg-feedback +1',
      userId: 'user1',
      username: 'User user1',
      channel: 'channel1',
      timestamp: new Date(),
      type: 'command'
    };

    const feedbackContext = await this.metricsMiddleware.beforeCommand(feedbackMessage);
    await this.sleep(50);
    await this.metricsMiddleware.afterCommand(feedbackContext, { success: true });
    console.log('  ✓ Métrica registrada para comando: feedback');

    // Obtener estado del buffer
    const bufferStatus = this.metricsCollector.getBufferStatus();
    console.log(`  📊 Buffer de métricas: ${bufferStatus.size}/${bufferStatus.maxSize}`);
    
    // Forzar flush
    await this.metricsCollector.flush();
    console.log('  ✓ Buffer de métricas enviado\n');
  }

  private async testRateLimitingSystem(): Promise<void> {
    console.log('🚫 **Test 2: Sistema de Rate Limiting**');
    
    // Iniciar el servicio de rate limiting
    await this.rateLimitService.start();
    
    const testUser = 'test_user';
    const testChannel = 'test_channel';
    
    // Test 1: Comandos normales dentro del límite
    console.log('  Test 2.1: Comandos dentro del límite');
    for (let i = 1; i <= 3; i++) {
      const message: Message = {
        content: '/tg-search test query',
        userId: testUser,
        username: 'Test User',
        channel: testChannel,
        timestamp: new Date(),
        type: 'command',
        metadata: { command: 'search' }
      };

      const result = await this.rateLimitMiddleware.checkRateLimit(message);
      console.log(`    ${i}. Rate limit check: ${result.allowed ? '✅ ALLOWED' : '❌ BLOCKED'} ` +
                 `(${result.result.remaining} remaining)`);
    }

    // Test 2: Exceder el límite
    console.log('\n  Test 2.2: Exceder límite de comandos');
    for (let i = 1; i <= 15; i++) {
      const message: Message = {
        content: '/tg-search test query',
        userId: testUser,
        username: 'Test User',
        channel: testChannel,
        timestamp: new Date(),
        type: 'command',
        metadata: { command: 'search' }
      };

      const result = await this.rateLimitMiddleware.checkRateLimit(message);
      
      if (!result.allowed) {
        console.log(`    ${i}. ❌ RATE LIMIT EXCEEDED - Try again in ${result.result.retryAfter}s`);
        break;
      } else if (result.result.remaining <= 2) {
        console.log(`    ${i}. ⚠️  WARNING - Only ${result.result.remaining} remaining`);
      } else {
        console.log(`    ${i}. ✅ Allowed (${result.result.remaining} remaining)`);
      }
    }

    // Test 3: Estadísticas
    console.log('\n  Test 2.3: Estadísticas del servicio');
    const status = await this.rateLimitService.status();
    console.log(`    📊 Reglas activas: ${status.rulesLoaded}`);
    console.log(`    📈 Entradas activas: ${status.entriesActive}`);
    console.log(`    ⚠️  Violaciones recientes: ${status.violationsRecent}`);
    console.log(`    🧠 Uso de memoria: ${Math.round(status.memoryUsage / 1024)}KB`);
    
    await this.rateLimitService.stop();
    console.log('  ✓ Servicio de rate limiting detenido\n');
  }

  private async testIntegration(): Promise<void> {
    console.log('🔗 **Test 3: Integración Métricas + Rate Limiting**');
    
    await this.rateLimitService.start();
    
    const message: Message = {
      content: '/tg-question What is hexagonal architecture?',
      userId: 'integration_user',
      username: 'Integration User',
      channel: 'integration_channel',
      timestamp: new Date(),
      type: 'command',
      metadata: { command: 'question' }
    };

    // 1. Verificar rate limit
    const rateLimitCheck = await this.rateLimitMiddleware.checkRateLimit(message);
    console.log(`  1. Rate limit check: ${rateLimitCheck.allowed ? '✅ ALLOWED' : '❌ BLOCKED'}`);
    
    if (rateLimitCheck.allowed) {
      // 2. Iniciar métricas
      const metricsContext = await this.metricsMiddleware.beforeCommand(message);
      console.log(`  2. Métricas iniciadas para: ${metricsContext.commandType}`);
      
      // 3. Simular procesamiento del comando
      console.log('  3. Simulando procesamiento del comando...');
      await this.sleep(200);
      
      // 4. Finalizar métricas
      await this.metricsMiddleware.afterCommand(metricsContext, { 
        content: 'Respuesta simulada',
        success: true 
      });
      console.log('  4. ✅ Métricas finalizadas');
      
      // 5. Verificar estado actual del usuario
      const userLimits = await this.rateLimitService.getUserLimits('integration_user');
      console.log(`  5. 📊 Límites del usuario: ${userLimits.length} reglas aplicables`);
    }
    
    await this.rateLimitService.stop();
    console.log('  ✓ Integración completada\n');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async cleanup(): Promise<void> {
    await this.metricsCollector.shutdown();
    if (this.rateLimitService) {
      await this.rateLimitService.stop();
    }
  }
}

// Ejecutar pruebas
async function main(): Promise<void> {
  const testRunner = new QuickTestRunner();
  
  try {
    await testRunner.runTests();
  } catch (error) {
    console.error('Error en las pruebas:', error);
    process.exit(1);
  } finally {
    await testRunner.cleanup();
  }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  main().catch(console.error);
}

export { QuickTestRunner }; 