#!/usr/bin/env ts-node

import { PerformanceMeasurer } from './performance.utils';
import { PERFORMANCE_THRESHOLDS, categorizePerformance } from './performance.config';

// Simulaciones simples para pruebas rápidas
const simulateSearch = async (): Promise<void> => {
  const delay = Math.random() * 100 + 50; // 50-150ms
  await new Promise(resolve => setTimeout(resolve, delay));
};

const simulateFeedback = async (): Promise<void> => {
  const delay = Math.random() * 20 + 10; // 10-30ms
  await new Promise(resolve => setTimeout(resolve, delay));
};

const simulateQuestion = async (): Promise<void> => {
  const delay = Math.random() * 500 + 200; // 200-700ms (simula LLM)
  await new Promise(resolve => setTimeout(resolve, delay));
};

const simulateSummary = async (): Promise<void> => {
  const delay = Math.random() * 1000 + 500; // 500-1500ms
  await new Promise(resolve => setTimeout(resolve, delay));
};

async function runPerformanceTests(): Promise<void> {
  console.log('🚀 **Iniciando Pruebas de Rendimiento TG-TheGuardian**\n');

  // Test 1: Rendimiento de Búsqueda
  console.log('📍 **Prueba 1: Comando /tg-search**');
  const { result: searchResult, metrics: searchMetrics } = await PerformanceMeasurer.measureAsync(simulateSearch);
  const searchThresholds = PERFORMANCE_THRESHOLDS.commands.search;
  const searchCategory = categorizePerformance(searchMetrics.responseTime, searchThresholds.maxResponseTime, 'responseTime');
  
  console.log(`⏱️  Tiempo de respuesta: ${searchMetrics.responseTime.toFixed(2)}ms`);
  console.log(`🧠 Uso de memoria: ${searchMetrics.memoryUsage.toFixed(2)}MB`);
  console.log(`📏 Umbral: ${searchThresholds.maxResponseTime}ms`);
  console.log(`🏷️  Categoría: ${searchCategory.toUpperCase()}`);
  console.log(`✅ Pasa umbral: ${searchMetrics.responseTime < searchThresholds.maxResponseTime ? 'SÍ' : 'NO'}\n`);

  // Test 2: Throughput de Búsqueda
  console.log('📊 **Prueba 2: Throughput de Búsqueda (5s)**');
  const searchThroughput = await PerformanceMeasurer.measureThroughput(simulateSearch, 5000);
  console.log(`⚡ Throughput: ${searchThroughput.throughput.toFixed(2)} ops/sec`);
  console.log(`⏱️  Tiempo promedio: ${searchThroughput.avgResponseTime.toFixed(2)}ms`);
  console.log(`❌ Tasa de error: ${searchThroughput.errorRate.toFixed(2)}%`);
  console.log(`📏 Umbral mínimo: ${searchThresholds.minThroughput} ops/sec`);
  console.log(`✅ Cumple throughput: ${searchThroughput.throughput > searchThresholds.minThroughput ? 'SÍ' : 'NO'}\n`);

  // Test 3: Rendimiento de Feedback
  console.log('👍 **Prueba 3: Comando /tg-feedback**');
  const { result: feedbackResult, metrics: feedbackMetrics } = await PerformanceMeasurer.measureAsync(simulateFeedback);
  const feedbackThresholds = PERFORMANCE_THRESHOLDS.commands.feedback;
  const feedbackCategory = categorizePerformance(feedbackMetrics.responseTime, feedbackThresholds.maxResponseTime, 'responseTime');
  
  console.log(`⏱️  Tiempo de respuesta: ${feedbackMetrics.responseTime.toFixed(2)}ms`);
  console.log(`📏 Umbral: ${feedbackThresholds.maxResponseTime}ms`);
  console.log(`🏷️  Categoría: ${feedbackCategory.toUpperCase()}`);
  console.log(`✅ Pasa umbral: ${feedbackMetrics.responseTime < feedbackThresholds.maxResponseTime ? 'SÍ' : 'NO'}\n`);

  // Test 4: Throughput de Feedback
  console.log('📊 **Prueba 4: Throughput de Feedback (3s)**');
  const feedbackThroughput = await PerformanceMeasurer.measureThroughput(simulateFeedback, 3000);
  console.log(`⚡ Throughput: ${feedbackThroughput.throughput.toFixed(2)} ops/sec`);
  console.log(`📏 Umbral mínimo: ${feedbackThresholds.minThroughput} ops/sec`);
  console.log(`✅ Cumple throughput: ${feedbackThroughput.throughput > feedbackThresholds.minThroughput ? 'SÍ' : 'NO'}\n`);

  // Test 5: Rendimiento de Preguntas
  console.log('❓ **Prueba 5: Comando /tg-question**');
  const { result: questionResult, metrics: questionMetrics } = await PerformanceMeasurer.measureAsync(simulateQuestion);
  const questionThresholds = PERFORMANCE_THRESHOLDS.commands.question;
  const questionCategory = categorizePerformance(questionMetrics.responseTime, questionThresholds.maxResponseTime, 'responseTime');
  
  console.log(`⏱️  Tiempo de respuesta: ${questionMetrics.responseTime.toFixed(2)}ms`);
  console.log(`📏 Umbral: ${questionThresholds.maxResponseTime}ms`);
  console.log(`🏷️  Categoría: ${questionCategory.toUpperCase()}`);
  console.log(`✅ Pasa umbral: ${questionMetrics.responseTime < questionThresholds.maxResponseTime ? 'SÍ' : 'NO'}\n`);

  // Test 6: Rendimiento de Resúmenes
  console.log('📝 **Prueba 6: Comando /tg-summary**');
  const { result: summaryResult, metrics: summaryMetrics } = await PerformanceMeasurer.measureAsync(simulateSummary);
  const summaryThresholds = PERFORMANCE_THRESHOLDS.commands.summary;
  const summaryCategory = categorizePerformance(summaryMetrics.responseTime, summaryThresholds.maxResponseTime, 'responseTime');
  
  console.log(`⏱️  Tiempo de respuesta: ${summaryMetrics.responseTime.toFixed(2)}ms`);
  console.log(`📏 Umbral: ${summaryThresholds.maxResponseTime}ms`);
  console.log(`🏷️  Categoría: ${summaryCategory.toUpperCase()}`);
  console.log(`✅ Pasa umbral: ${summaryMetrics.responseTime < summaryThresholds.maxResponseTime ? 'SÍ' : 'NO'}\n`);

  // Test 7: Prueba de Concurrencia Básica
  console.log('🚀 **Prueba 7: Concurrencia Básica (20 operaciones)**');
  
  const concurrentOps = 20;
  const concurrentResults: { success: boolean; time: number }[] = [];
  
  const startTime = Date.now();
  const promises = Array.from({ length: concurrentOps }, async (_, i) => {
    const opStart = Date.now();
    try {
      await simulateSearch();
      return { success: true, time: Date.now() - opStart };
    } catch (error) {
      return { success: false, time: Date.now() - opStart };
    }
  });
  
  const results = await Promise.all(promises);
  const totalTime = Date.now() - startTime;
  const successful = results.filter(r => r.success).length;
  const avgTime = results.reduce((sum, r) => sum + r.time, 0) / results.length;
  
  console.log(`👥 Operaciones concurrentes: ${concurrentOps}`);
  console.log(`✅ Exitosas: ${successful}`);
  console.log(`❌ Fallidas: ${concurrentOps - successful}`);
  console.log(`📈 Tasa de éxito: ${(successful / concurrentOps * 100).toFixed(2)}%`);
  console.log(`⏱️  Tiempo promedio: ${avgTime.toFixed(2)}ms`);
  console.log(`⏱️  Tiempo total: ${totalTime.toFixed(2)}ms`);
  console.log(`✅ Concurrencia exitosa: ${successful >= concurrentOps * 0.9 ? 'SÍ' : 'NO'}\n`);

  // Resumen Final
  console.log('📋 **RESUMEN DE RESULTADOS**');
  console.log('================================');
  
  const allPassed = [
    searchMetrics.responseTime < searchThresholds.maxResponseTime,
    searchThroughput.throughput > searchThresholds.minThroughput,
    feedbackMetrics.responseTime < feedbackThresholds.maxResponseTime,
    feedbackThroughput.throughput > feedbackThresholds.minThroughput,
    questionMetrics.responseTime < questionThresholds.maxResponseTime,
    summaryMetrics.responseTime < summaryThresholds.maxResponseTime,
    successful >= concurrentOps * 0.9
  ];
  
  const passedTests = allPassed.filter(Boolean).length;
  const totalTests = allPassed.length;
  
  console.log(`✅ Pruebas pasadas: ${passedTests}/${totalTests}`);
  console.log(`📊 Porcentaje de éxito: ${(passedTests / totalTests * 100).toFixed(2)}%`);
  console.log(`🎯 Estado general: ${passedTests === totalTests ? '🟢 EXCELENTE' : 
                                   passedTests >= totalTests * 0.8 ? '🟡 BUENO' : 
                                   passedTests >= totalTests * 0.6 ? '🟠 ADVERTENCIA' : '🔴 CRÍTICO'}`);
  
  console.log('\n🎉 **Pruebas de rendimiento completadas**');
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  runPerformanceTests().catch(console.error);
}

export { runPerformanceTests }; 