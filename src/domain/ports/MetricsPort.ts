import { 
  Metric, 
  MetricAggregation, 
  MetricAlert, 
  MetricsDashboard, 
  MetricFilter, 
  MetricStats 
} from '../models/Metrics';

export interface MetricsPort {
  // Operaciones básicas de métricas
  saveMetric(metric: Metric): Promise<void>;
  saveMetrics(metrics: Metric[]): Promise<void>;
  getMetrics(filter: MetricFilter): Promise<Metric[]>;
  getMetricById(metricId: string): Promise<Metric | null>;
  deleteMetric(metricId: string): Promise<boolean>;
  
  // Agregaciones
  createAggregation(aggregation: MetricAggregation): Promise<MetricAggregation>;
  getAggregations(filter: Partial<MetricAggregation>): Promise<MetricAggregation[]>;
  processAggregations(period: 'minute' | 'hour' | 'day'): Promise<void>;
  
  // Estadísticas
  getMetricStats(filter: MetricFilter): Promise<MetricStats>;
  getTopMetrics(type: string, limit: number, timeRange: string): Promise<any[]>;
  getTrends(metricType: string, timeRange: string): Promise<any>;
  
  // Alertas
  createAlert(alert: MetricAlert): Promise<MetricAlert>;
  getAlerts(enabled?: boolean): Promise<MetricAlert[]>;
  updateAlert(alertId: string, updates: Partial<MetricAlert>): Promise<MetricAlert | null>;
  deleteAlert(alertId: string): Promise<boolean>;
  checkAlerts(): Promise<MetricAlert[]>; // Retorna alertas que se dispararon
  
  // Dashboard
  createDashboard(dashboard: MetricsDashboard): Promise<MetricsDashboard>;
  getDashboards(userId?: string): Promise<MetricsDashboard[]>;
  getDashboard(dashboardId: string): Promise<MetricsDashboard | null>;
  updateDashboard(dashboardId: string, updates: Partial<MetricsDashboard>): Promise<MetricsDashboard | null>;
  deleteDashboard(dashboardId: string): Promise<boolean>;
  
  // Utilidades
  healthCheck(): Promise<boolean>;
  getMetricCounts(): Promise<{ total: number; byType: Record<string, number> }>;
  cleanupOldMetrics(retentionDays: number): Promise<number>; // Retorna número de métricas eliminadas
}

// Interfaz para el colector de métricas
export interface MetricsCollector {
  // Métricas de rendimiento
  recordPerformance(data: {
    commandType: string;
    responseTime: number;
    memoryUsage: number;
    success: boolean;
    userId: string;
    channel: string;
    errorType?: string;
    metadata?: Record<string, any>;
  }): Promise<void>;
  
  // Métricas de uso
  recordUsage(data: {
    event: string;
    userId: string;
    channel: string;
    count?: number;
    value?: number;
    properties?: Record<string, any>;
  }): Promise<void>;
  
  // Métricas de sistema
  recordSystem(data: {
    component: string;
    metric: string;
    value: number;
    unit: string;
    threshold?: number;
    status?: 'normal' | 'warning' | 'critical';
  }): Promise<void>;
  
  // Métricas de error
  recordError(data: {
    errorType: string;
    errorMessage: string;
    errorCode?: string;
    stackTrace?: string;
    userId?: string;
    channel?: string;
    commandType?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
  }): Promise<void>;
  
  // Incrementadores simples
  incrementCounter(name: string, tags?: string[]): Promise<void>;
  recordTiming(name: string, duration: number, tags?: string[]): Promise<void>;
  setGauge(name: string, value: number, tags?: string[]): Promise<void>;
}

// Interfaz para el procesador de alertas
export interface AlertProcessor {
  processAlert(alert: MetricAlert, metrics: Metric[]): Promise<boolean>;
  sendAlert(alert: MetricAlert, value: number, metrics: Metric[]): Promise<void>;
  checkThreshold(alert: MetricAlert, value: number): boolean;
} 