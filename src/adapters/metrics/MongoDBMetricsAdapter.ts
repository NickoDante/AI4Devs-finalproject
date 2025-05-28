import { Collection, MongoClient } from 'mongodb';
import { Logger } from 'winston';
import { v4 as uuidv4 } from 'uuid';
import { MetricsPort } from '../../domain/ports/MetricsPort';
import { 
  Metric, 
  MetricAggregation, 
  MetricAlert, 
  MetricsDashboard, 
  MetricFilter, 
  MetricStats 
} from '../../domain/models/Metrics';

export class MongoDBMetricsAdapter implements MetricsPort {
  private client: MongoClient;
  private metrics!: Collection<Metric>;
  private aggregations!: Collection<MetricAggregation>;
  private alerts!: Collection<MetricAlert>;
  private dashboards!: Collection<MetricsDashboard>;
  
  constructor(
    private readonly uri: string,
    private readonly logger: Logger
  ) {
    this.client = new MongoClient(uri);
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
      this.logger.info('Conectado a MongoDB para métricas');
      
      const db = this.client.db('theguardian_metrics');
      this.metrics = db.collection('metrics');
      this.aggregations = db.collection('aggregations');
      this.alerts = db.collection('alerts');
      this.dashboards = db.collection('dashboards');

      // Crear índices para optimizar consultas
      await this.createIndexes();
    } catch (error) {
      this.logger.error('Error conectando a MongoDB para métricas:', error);
      throw error;
    }
  }

  private async createIndexes(): Promise<void> {
    try {
      // Índices para métricas
      await this.metrics.createIndex({ timestamp: -1 });
      await this.metrics.createIndex({ type: 1, timestamp: -1 });
      await this.metrics.createIndex({ 'userId': 1, timestamp: -1 });
      await this.metrics.createIndex({ 'channel': 1, timestamp: -1 });
      await this.metrics.createIndex({ 'commandType': 1, timestamp: -1 });
      await this.metrics.createIndex({ source: 1, category: 1 });
      await this.metrics.createIndex({ tags: 1 });

      // Índices para agregaciones
      await this.aggregations.createIndex({ period: 1, startTime: -1 });
      await this.aggregations.createIndex({ category: 1, period: 1 });

      // Índices para alertas
      await this.alerts.createIndex({ enabled: 1 });
      await this.alerts.createIndex({ metricType: 1 });

      // Índices para dashboards
      await this.dashboards.createIndex({ createdBy: 1 });
      await this.dashboards.createIndex({ isPublic: 1 });

      this.logger.info('Índices de métricas creados exitosamente');
    } catch (error) {
      this.logger.error('Error creando índices de métricas:', error);
    }
  }

  async disconnect(): Promise<void> {
    await this.client.close();
    this.logger.info('Desconectado de MongoDB para métricas');
  }

  // Operaciones básicas de métricas
  async saveMetric(metric: Metric): Promise<void> {
    try {
      if (!metric.id) {
        metric.id = uuidv4();
      }
      
      await this.metrics.insertOne(metric);
      this.logger.debug('Métrica guardada:', { id: metric.id, type: metric.type });
    } catch (error) {
      this.logger.error('Error guardando métrica:', error);
      throw error;
    }
  }

  async saveMetrics(metrics: Metric[]): Promise<void> {
    try {
      // Asignar IDs si no los tienen
      const metricsWithIds = metrics.map(metric => ({
        ...metric,
        id: metric.id || uuidv4()
      }));

      await this.metrics.insertMany(metricsWithIds);
      this.logger.debug('Métricas guardadas en lote:', { count: metrics.length });
    } catch (error) {
      this.logger.error('Error guardando métricas en lote:', error);
      throw error;
    }
  }

  async getMetrics(filter: MetricFilter): Promise<Metric[]> {
    try {
      const query = this.buildMetricQuery(filter);
      
      let cursor = this.metrics.find(query);
      
      // Aplicar ordenamiento
      if (filter.sortBy) {
        const sortOrder = filter.sortOrder === 'desc' ? -1 : 1;
        cursor = cursor.sort({ [filter.sortBy]: sortOrder });
      } else {
        cursor = cursor.sort({ timestamp: -1 });
      }
      
      // Aplicar paginación
      if (filter.offset) {
        cursor = cursor.skip(filter.offset);
      }
      
      if (filter.limit) {
        cursor = cursor.limit(filter.limit);
      }
      
      return await cursor.toArray();
    } catch (error) {
      this.logger.error('Error obteniendo métricas:', error);
      throw error;
    }
  }

  async getMetricById(metricId: string): Promise<Metric | null> {
    try {
      return await this.metrics.findOne({ id: metricId });
    } catch (error) {
      this.logger.error('Error obteniendo métrica por ID:', error);
      throw error;
    }
  }

  async deleteMetric(metricId: string): Promise<boolean> {
    try {
      const result = await this.metrics.deleteOne({ id: metricId });
      return result.deletedCount > 0;
    } catch (error) {
      this.logger.error('Error eliminando métrica:', error);
      throw error;
    }
  }

  // Agregaciones
  async createAggregation(aggregation: MetricAggregation): Promise<MetricAggregation> {
    try {
      if (!aggregation.id) {
        aggregation.id = uuidv4();
      }
      
      await this.aggregations.insertOne(aggregation);
      return aggregation;
    } catch (error) {
      this.logger.error('Error creando agregación:', error);
      throw error;
    }
  }

  async getAggregations(filter: Partial<MetricAggregation>): Promise<MetricAggregation[]> {
    try {
      return await this.aggregations.find(filter).sort({ startTime: -1 }).toArray();
    } catch (error) {
      this.logger.error('Error obteniendo agregaciones:', error);
      throw error;
    }
  }

  async processAggregations(period: 'minute' | 'hour' | 'day'): Promise<void> {
    try {
      const now = new Date();
      let startTime: Date;
      let endTime: Date;

      // Calcular el rango de tiempo según el período
      switch (period) {
        case 'minute':
          startTime = new Date(now.getTime() - 60 * 1000);
          endTime = now;
          break;
        case 'hour':
          startTime = new Date(now.getTime() - 60 * 60 * 1000);
          endTime = now;
          break;
        case 'day':
          startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          endTime = now;
          break;
      }

      // Procesar agregaciones de rendimiento
      await this.processPerformanceAggregations(period, startTime, endTime);
      
      // Procesar agregaciones de uso
      await this.processUsageAggregations(period, startTime, endTime);

      this.logger.info('Agregaciones procesadas:', { period, startTime, endTime });
    } catch (error) {
      this.logger.error('Error procesando agregaciones:', error);
      throw error;
    }
  }

  private async processPerformanceAggregations(
    period: string, 
    startTime: Date, 
    endTime: Date
  ): Promise<void> {
    const pipeline = [
      {
        $match: {
          type: 'performance',
          timestamp: { $gte: startTime, $lte: endTime }
        }
      },
      {
        $group: {
          _id: '$commandType',
          avgResponseTime: { $avg: '$responseTime' },
          maxResponseTime: { $max: '$responseTime' },
          minResponseTime: { $min: '$responseTime' },
          totalCount: { $sum: 1 },
          successCount: { $sum: { $cond: ['$success', 1, 0] } },
          avgMemoryUsage: { $avg: '$memoryUsage' }
        }
      }
    ];

    const results = await this.metrics.aggregate(pipeline).toArray();
    
    for (const result of results) {
      const aggregation: MetricAggregation = {
        id: uuidv4(),
        period: period as any,
        startTime,
        endTime,
        category: `performance_${result._id}`,
        aggregationType: 'avg',
        value: result.avgResponseTime,
        sampleCount: result.totalCount,
        metadata: {
          commandType: result._id,
          maxResponseTime: result.maxResponseTime,
          minResponseTime: result.minResponseTime,
          successRate: result.successCount / result.totalCount,
          avgMemoryUsage: result.avgMemoryUsage
        }
      };

      await this.createAggregation(aggregation);
    }
  }

  private async processUsageAggregations(
    period: string,
    startTime: Date,
    endTime: Date
  ): Promise<void> {
    const pipeline = [
      {
        $match: {
          type: 'usage',
          timestamp: { $gte: startTime, $lte: endTime }
        }
      },
      {
        $group: {
          _id: '$event',
          totalCount: { $sum: '$count' },
          uniqueUsers: { $addToSet: '$userId' },
          uniqueChannels: { $addToSet: '$channel' }
        }
      }
    ];

    const results = await this.metrics.aggregate(pipeline).toArray();
    
    for (const result of results) {
      const aggregation: MetricAggregation = {
        id: uuidv4(),
        period: period as any,
        startTime,
        endTime,
        category: `usage_${result._id}`,
        aggregationType: 'sum',
        value: result.totalCount,
        sampleCount: result.totalCount,
        metadata: {
          event: result._id,
          uniqueUsers: result.uniqueUsers.length,
          uniqueChannels: result.uniqueChannels.length
        }
      };

      await this.createAggregation(aggregation);
    }
  }

  // Estadísticas
  async getMetricStats(filter: MetricFilter): Promise<MetricStats> {
    try {
      const query = this.buildMetricQuery(filter);
      
      // Estadísticas básicas
      const totalCount = await this.metrics.countDocuments(query);
      
      // Tasa de éxito para métricas de rendimiento
      const successQuery = { ...query, type: 'performance', success: true };
      const successCount = await this.metrics.countDocuments(successQuery);
      const performanceQuery = { ...query, type: 'performance' };
      const performanceCount = await this.metrics.countDocuments(performanceQuery);
      const successRate = performanceCount > 0 ? successCount / performanceCount : 0;

      // Tiempo de respuesta promedio
      const avgResponsePipeline = [
        { $match: { ...query, type: 'performance' } },
        { $group: { _id: null, avgResponseTime: { $avg: '$responseTime' } } }
      ];
      const avgResponseResult = await this.metrics.aggregate(avgResponsePipeline).toArray();
      const averageResponseTime = avgResponseResult[0]?.avgResponseTime || 0;

      // Tasa de error
      const errorQuery = { ...query, type: 'error' };
      const errorCount = await this.metrics.countDocuments(errorQuery);
      const errorRate = totalCount > 0 ? errorCount / totalCount : 0;

      // Top comandos, usuarios, canales y errores
      const [topCommands, topUsers, topChannels, topErrors, timeDistribution] = await Promise.all([
        this.getTopCommands(query),
        this.getTopUsers(query),
        this.getTopChannels(query),
        this.getTopErrors(query),
        this.getTimeDistribution(query)
      ]);

      // Tendencias (comparar con período anterior)
      const trends = await this.getTrendsData(filter);

      return {
        totalCount,
        successRate,
        averageResponseTime,
        errorRate,
        topCommands,
        topUsers,
        topChannels,
        topErrors,
        timeDistribution,
        trends
      };
    } catch (error) {
      this.logger.error('Error obteniendo estadísticas de métricas:', error);
      throw error;
    }
  }

  private buildMetricQuery(filter: MetricFilter): any {
    const query: any = {};

    if (filter.type) {
      query.type = Array.isArray(filter.type) ? { $in: filter.type } : filter.type;
    }

    if (filter.category) {
      query.category = Array.isArray(filter.category) ? { $in: filter.category } : filter.category;
    }

    if (filter.source) {
      query.source = Array.isArray(filter.source) ? { $in: filter.source } : filter.source;
    }

    if (filter.userId) {
      query.userId = Array.isArray(filter.userId) ? { $in: filter.userId } : filter.userId;
    }

    if (filter.channel) {
      query.channel = Array.isArray(filter.channel) ? { $in: filter.channel } : filter.channel;
    }

    if (filter.commandType) {
      query.commandType = Array.isArray(filter.commandType) ? { $in: filter.commandType } : filter.commandType;
    }

    if (filter.startTime || filter.endTime) {
      query.timestamp = {};
      if (filter.startTime) query.timestamp.$gte = filter.startTime;
      if (filter.endTime) query.timestamp.$lte = filter.endTime;
    }

    if (filter.tags && filter.tags.length > 0) {
      query.tags = { $in: filter.tags };
    }

    if (filter.severity) {
      query.severity = Array.isArray(filter.severity) ? { $in: filter.severity } : filter.severity;
    }

    if (filter.success !== undefined) {
      query.success = filter.success;
    }

    return query;
  }

  private async getTopCommands(query: any): Promise<Array<{ command: string; count: number; avgTime: number }>> {
    const pipeline = [
      { $match: { ...query, type: 'performance' } },
      {
        $group: {
          _id: '$commandType',
          count: { $sum: 1 },
          avgTime: { $avg: '$responseTime' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ];

    const results = await this.metrics.aggregate(pipeline).toArray();
    return results.map(r => ({
      command: r._id,
      count: r.count,
      avgTime: Math.round(r.avgTime)
    }));
  }

  private async getTopUsers(query: any): Promise<Array<{ userId: string; count: number }>> {
    const pipeline = [
      { $match: { ...query, userId: { $exists: true } } },
      {
        $group: {
          _id: '$userId',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ];

    const results = await this.metrics.aggregate(pipeline).toArray();
    return results.map(r => ({
      userId: r._id,
      count: r.count
    }));
  }

  private async getTopChannels(query: any): Promise<Array<{ channel: string; count: number }>> {
    const pipeline = [
      { $match: { ...query, channel: { $exists: true } } },
      {
        $group: {
          _id: '$channel',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ];

    const results = await this.metrics.aggregate(pipeline).toArray();
    return results.map(r => ({
      channel: r._id,
      count: r.count
    }));
  }

  private async getTopErrors(query: any): Promise<Array<{ error: string; count: number }>> {
    const pipeline = [
      { $match: { ...query, type: 'error' } },
      {
        $group: {
          _id: '$errorType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ];

    const results = await this.metrics.aggregate(pipeline).toArray();
    return results.map(r => ({
      error: r._id,
      count: r.count
    }));
  }

  private async getTimeDistribution(query: any): Promise<Array<{ hour: number; count: number }>> {
    const pipeline = [
      { $match: query },
      {
        $group: {
          _id: { $hour: '$timestamp' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ];

    const results = await this.metrics.aggregate(pipeline).toArray();
    return results.map(r => ({
      hour: r._id,
      count: r.count
    }));
  }

  private async getTrendsData(filter: MetricFilter): Promise<any> {
    // Implementación simplificada de tendencias
    return {
      responseTime: { current: 0, previous: 0, change: 0 },
      usage: { current: 0, previous: 0, change: 0 },
      errors: { current: 0, previous: 0, change: 0 }
    };
  }

  // Implementaciones requeridas por la interfaz
  async getTopMetrics(type: string, limit: number, timeRange: string): Promise<any[]> {
    // Implementación simplificada
    return [];
  }

  async getTrends(metricType: string, timeRange: string): Promise<any> {
    // Implementación simplificada
    return {};
  }

  async createAlert(alert: MetricAlert): Promise<MetricAlert> {
    if (!alert.id) {
      alert.id = uuidv4();
    }
    await this.alerts.insertOne(alert);
    return alert;
  }

  async getAlerts(enabled?: boolean): Promise<MetricAlert[]> {
    const query = enabled !== undefined ? { enabled } : {};
    return await this.alerts.find(query).toArray();
  }

  async updateAlert(alertId: string, updates: Partial<MetricAlert>): Promise<MetricAlert | null> {
    const result = await this.alerts.findOneAndUpdate(
      { id: alertId },
      { $set: updates },
      { returnDocument: 'after' }
    );
    return result as unknown as MetricAlert;
  }

  async deleteAlert(alertId: string): Promise<boolean> {
    const result = await this.alerts.deleteOne({ id: alertId });
    return result.deletedCount > 0;
  }

  async checkAlerts(): Promise<MetricAlert[]> {
    // Implementación simplificada
    return [];
  }

  async createDashboard(dashboard: MetricsDashboard): Promise<MetricsDashboard> {
    if (!dashboard.id) {
      dashboard.id = uuidv4();
    }
    await this.dashboards.insertOne(dashboard);
    return dashboard;
  }

  async getDashboards(userId?: string): Promise<MetricsDashboard[]> {
    const query = userId ? { $or: [{ createdBy: userId }, { isPublic: true }] } : { isPublic: true };
    return await this.dashboards.find(query).toArray();
  }

  async getDashboard(dashboardId: string): Promise<MetricsDashboard | null> {
    return await this.dashboards.findOne({ id: dashboardId });
  }

  async updateDashboard(dashboardId: string, updates: Partial<MetricsDashboard>): Promise<MetricsDashboard | null> {
    const result = await this.dashboards.findOneAndUpdate(
      { id: dashboardId },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    return result as unknown as MetricsDashboard;
  }

  async deleteDashboard(dashboardId: string): Promise<boolean> {
    const result = await this.dashboards.deleteOne({ id: dashboardId });
    return result.deletedCount > 0;
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.client.db().command({ ping: 1 });
      return true;
    } catch (error) {
      return false;
    }
  }

  async getMetricCounts(): Promise<{ total: number; byType: Record<string, number> }> {
    const total = await this.metrics.countDocuments({});
    
    const pipeline = [
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ];

    const results = await this.metrics.aggregate(pipeline).toArray();
    const byType: Record<string, number> = {};
    
    for (const result of results) {
      byType[result._id] = result.count;
    }

    return { total, byType };
  }

  async cleanupOldMetrics(retentionDays: number): Promise<number> {
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    const result = await this.metrics.deleteMany({ timestamp: { $lt: cutoffDate } });
    
    this.logger.info('Métricas antiguas eliminadas:', { 
      count: result.deletedCount, 
      cutoffDate, 
      retentionDays 
    });
    
    return result.deletedCount;
  }
} 