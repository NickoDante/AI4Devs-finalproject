// Configuración para pruebas de rendimiento
export interface PerformanceThresholds {
  maxResponseTime: number;  // milisegundos
  maxMemoryUsage: number;   // MB
  minThroughput: number;    // operaciones por segundo
}

export interface PerformanceMetrics {
  responseTime: number;
  memoryUsage: number;
  cpuUsage?: number;
  throughput?: number;
  errorRate: number;
}

export const PERFORMANCE_THRESHOLDS = {
  // Umbrales para comandos individuales
  commands: {
    search: {
      maxResponseTime: 3000,  // 3 segundos max
      maxMemoryUsage: 100,    // 100MB max
      minThroughput: 10       // 10 búsquedas/seg min
    },
    question: {
      maxResponseTime: 8000,  // 8 segundos max (LLM puede ser lento)
      maxMemoryUsage: 200,    // 200MB max
      minThroughput: 5        // 5 preguntas/seg min
    },
    summary: {
      maxResponseTime: 15000, // 15 segundos max (procesamiento pesado)
      maxMemoryUsage: 300,    // 300MB max
      minThroughput: 2        // 2 resúmenes/seg min
    },
    feedback: {
      maxResponseTime: 1000,  // 1 segundo max (operación simple)
      maxMemoryUsage: 50,     // 50MB max
      minThroughput: 50       // 50 feedbacks/seg min
    }
  },
  
  // Umbrales para adaptadores
  adapters: {
    mongodb: {
      maxResponseTime: 500,   // 500ms max para operaciones DB
      maxMemoryUsage: 100,
      minThroughput: 100
    },
    redis: {
      maxResponseTime: 100,   // 100ms max para caché
      maxMemoryUsage: 50,
      minThroughput: 1000
    },
    confluence: {
      maxResponseTime: 2000,  // 2 segundos max para API externa
      maxMemoryUsage: 150,
      minThroughput: 20
    }
  },
  
  // Umbrales para pruebas de carga
  loadTest: {
    concurrentUsers: 50,      // 50 usuarios simultáneos
    testDuration: 300,        // 5 minutos de prueba
    maxErrorRate: 5,          // 5% máximo de errores
    maxResponseTime: 10000    // 10 segundos máximo bajo carga
  }
} as const;

export const PERFORMANCE_CATEGORIES = {
  EXCELLENT: 'excellent',
  GOOD: 'good', 
  WARNING: 'warning',
  CRITICAL: 'critical'
} as const;

export type PerformanceCategory = typeof PERFORMANCE_CATEGORIES[keyof typeof PERFORMANCE_CATEGORIES];

export function categorizePerformance(
  metric: number, 
  threshold: number, 
  type: 'responseTime' | 'memoryUsage' | 'throughput' | 'errorRate'
): PerformanceCategory {
  switch (type) {
    case 'responseTime':
    case 'memoryUsage':
    case 'errorRate':
      // Menor es mejor
      if (metric <= threshold * 0.5) return PERFORMANCE_CATEGORIES.EXCELLENT;
      if (metric <= threshold * 0.8) return PERFORMANCE_CATEGORIES.GOOD;
      if (metric <= threshold) return PERFORMANCE_CATEGORIES.WARNING;
      return PERFORMANCE_CATEGORIES.CRITICAL;
      
    case 'throughput':
      // Mayor es mejor
      if (metric >= threshold * 1.5) return PERFORMANCE_CATEGORIES.EXCELLENT;
      if (metric >= threshold * 1.2) return PERFORMANCE_CATEGORIES.GOOD;
      if (metric >= threshold) return PERFORMANCE_CATEGORIES.WARNING;
      return PERFORMANCE_CATEGORIES.CRITICAL;
  }
} 