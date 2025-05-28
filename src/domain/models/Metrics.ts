// Modelos de dominio para el sistema de métricas

export interface BaseMetric {
  id: string;
  timestamp: Date;
  source: string; // 'command', 'system', 'user', 'error'
  category: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

// Métricas de rendimiento
export interface PerformanceMetric extends BaseMetric {
  type: 'performance';
  commandType: string; // 'search', 'question', 'summary', 'feedback'
  responseTime: number; // milliseconds
  memoryUsage: number; // MB
  cpuUsage?: number; // percentage
  success: boolean;
  errorType?: string;
  userId: string;
  channel: string;
}

// Métricas de uso/negocio
export interface UsageMetric extends BaseMetric {
  type: 'usage';
  event: string; // 'command_executed', 'user_joined', 'document_accessed'
  userId: string;
  channel: string;
  count: number;
  value?: number;
  properties?: Record<string, any>;
}

// Métricas de sistema
export interface SystemMetric extends BaseMetric {
  type: 'system';
  component: string; // 'mongodb', 'redis', 'confluence', 'slack'
  metric: string; // 'connection_count', 'query_time', 'error_rate'
  value: number;
  unit: string; // 'ms', 'bytes', 'percentage', 'count'
  threshold?: number;
  status: 'normal' | 'warning' | 'critical';
}

// Métricas de error
export interface ErrorMetric extends BaseMetric {
  type: 'error';
  errorType: string; // 'validation', 'network', 'database', 'ai_service'
  errorCode?: string;
  errorMessage: string;
  stackTrace?: string;
  userId?: string;
  channel?: string;
  commandType?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// Union type para todas las métricas
export type Metric = PerformanceMetric | UsageMetric | SystemMetric | ErrorMetric;

// Agregaciones de métricas
export interface MetricAggregation {
  id: string;
  period: 'minute' | 'hour' | 'day' | 'week' | 'month';
  startTime: Date;
  endTime: Date;
  category: string;
  aggregationType: 'sum' | 'avg' | 'min' | 'max' | 'count';
  value: number;
  sampleCount: number;
  metadata?: Record<string, any>;
}

// Configuración de alertas
export interface MetricAlert {
  id: string;
  name: string;
  description: string;
  metricType: string;
  condition: 'greater_than' | 'less_than' | 'equals' | 'not_equals';
  threshold: number;
  duration: number; // minutes - how long condition must persist
  severity: 'info' | 'warning' | 'error' | 'critical';
  enabled: boolean;
  lastTriggered?: Date;
  channels: string[]; // Slack channels to notify
  tags?: string[];
}

// Dashboard de métricas
export interface MetricsDashboard {
  id: string;
  name: string;
  description: string;
  widgets: MetricWidget[];
  refreshInterval: number; // seconds
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  isPublic: boolean;
}

export interface MetricWidget {
  id: string;
  type: 'chart' | 'gauge' | 'counter' | 'table' | 'alert_status';
  title: string;
  position: { x: number; y: number; width: number; height: number };
  config: {
    metricQuery: string;
    timeRange: string; // '1h', '24h', '7d', '30d'
    aggregation?: string;
    chartType?: 'line' | 'bar' | 'pie' | 'area';
    thresholds?: { value: number; color: string }[];
  };
}

// Filtros para consultas de métricas
export interface MetricFilter {
  type?: string | string[];
  category?: string | string[];
  source?: string | string[];
  userId?: string | string[];
  channel?: string | string[];
  commandType?: string | string[];
  startTime?: Date;
  endTime?: Date;
  tags?: string[];
  severity?: string | string[];
  success?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Estadísticas agregadas
export interface MetricStats {
  totalCount: number;
  successRate: number;
  averageResponseTime: number;
  errorRate: number;
  topCommands: Array<{ command: string; count: number; avgTime: number }>;
  topUsers: Array<{ userId: string; count: number }>;
  topChannels: Array<{ channel: string; count: number }>;
  topErrors: Array<{ error: string; count: number }>;
  timeDistribution: Array<{ hour: number; count: number }>;
  trends: {
    responseTime: { current: number; previous: number; change: number };
    usage: { current: number; previous: number; change: number };
    errors: { current: number; previous: number; change: number };
  };
} 