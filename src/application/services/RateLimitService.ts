import { Logger } from 'winston';
import { v4 as uuidv4 } from 'uuid';
import { 
  RateLimitService, 
  RateLimitPort, 
  RateLimitRequest, 
  RateLimitServiceOptions,
  RateLimitServiceStatus
} from '../../domain/ports/RateLimitPort';
import { 
  RateLimitRule, 
  RateLimitResult, 
  RateLimitEntry, 
  RateLimitViolation,
  DEFAULT_RATE_LIMITS 
} from '../../domain/models/RateLimit';
import { MetricsCollectorService } from './MetricsCollectorService';

export class TGRateLimitService implements RateLimitService {
  private isRunning: boolean = false;
  private cleanupTimer: NodeJS.Timeout | null = null;
  private startTime: Date = new Date();
  private violationCount: Map<string, number> = new Map();

  private config: RateLimitServiceOptions = {
    enabled: true,
    defaultRules: true,
    whitelistedUsers: [],
    whitelistedChannels: [],
    emergencyMode: false,
    cleanupInterval: 300000, // 5 minutos
    maxEntries: 10000,
    violationThreshold: 5,
    notificationChannels: []
  };

  constructor(
    private readonly rateLimitPort: RateLimitPort,
    private readonly metricsCollector: MetricsCollectorService,
    private readonly logger: Logger
  ) {}

  async start(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('RateLimitService ya está en ejecución');
      return;
    }

    try {
      this.logger.info('Iniciando RateLimitService...');
      
      // Cargar reglas por defecto si está habilitado
      if (this.config.defaultRules) {
        await this.loadDefaultRules();
      }

      // Iniciar limpieza automática
      this.startCleanupTimer();

      this.isRunning = true;
      this.startTime = new Date();
      
      this.logger.info('RateLimitService iniciado exitosamente');
      
      await this.metricsCollector.recordSystem({
        component: 'rate_limit',
        metric: 'service_started',
        value: 1,
        unit: 'count',
        status: 'normal'
      });
    } catch (error) {
      this.logger.error('Error iniciando RateLimitService:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      this.logger.warn('RateLimitService ya está detenido');
      return;
    }

    try {
      this.logger.info('Deteniendo RateLimitService...');
      
      // Detener limpieza automática
      if (this.cleanupTimer) {
        clearInterval(this.cleanupTimer);
        this.cleanupTimer = null;
      }

      // Limpiar entradas expiradas una última vez
      await this.rateLimitPort.cleanupExpiredEntries();

      this.isRunning = false;
      
      this.logger.info('RateLimitService detenido exitosamente');
      
      await this.metricsCollector.recordSystem({
        component: 'rate_limit',
        metric: 'service_stopped',
        value: 1,
        unit: 'count',
        status: 'normal'
      });
    } catch (error) {
      this.logger.error('Error deteniendo RateLimitService:', error);
      throw error;
    }
  }

  async isAllowed(request: RateLimitRequest): Promise<RateLimitResult> {
    if (!this.config.enabled) {
      return {
        allowed: true,
        limit: Infinity,
        remaining: Infinity,
        resetTime: new Date(Date.now() + 86400000), // 24 horas
        key: 'disabled'
      };
    }

    try {
      // Verificar whitelist
      if (this.isWhitelisted(request)) {
        await this.metricsCollector.recordUsage({
          event: 'rate_limit_whitelisted',
          userId: request.userId || 'system',
          channel: request.channel || 'system',
          properties: { reason: 'whitelisted' }
        });

        return {
          allowed: true,
          limit: Infinity,
          remaining: Infinity,
          resetTime: new Date(Date.now() + 86400000),
          key: 'whitelisted'
        };
      }

      // Obtener reglas aplicables
      const rules = await this.getApplicableRules(request);
      
      // Verificar cada regla (la más restrictiva gana)
      let mostRestrictiveResult: RateLimitResult | null = null;

      for (const rule of rules) {
        const result = await this.checkRule(request, rule);
        
        if (!result.allowed) {
          await this.handleViolation(request, rule, result);
          return result;
        }

        // Actualizar el resultado más restrictivo
        if (!mostRestrictiveResult || result.remaining < mostRestrictiveResult.remaining) {
          mostRestrictiveResult = result;
        }
      }

      // Si llegamos aquí, está permitido
      const result = mostRestrictiveResult || {
        allowed: true,
        limit: Infinity,
        remaining: Infinity,
        resetTime: new Date(Date.now() + 86400000),
        key: 'no_rules'
      };

      // Registrar métricas de éxito
      await this.metricsCollector.recordUsage({
        event: 'rate_limit_allowed',
        userId: request.userId || 'system',
        channel: request.channel || 'system',
        properties: { 
          command: request.command,
          remaining: result.remaining 
        }
      });

      return result;
    } catch (error) {
      this.logger.error('Error verificando rate limit:', error);
      
      await this.metricsCollector.recordError({
        errorType: 'rate_limit_error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        userId: request.userId,
        channel: request.channel,
        commandType: request.command,
        severity: 'medium'
      });

      // En caso de error, permitir la operación por defecto
      return {
        allowed: true,
        limit: Infinity,
        remaining: Infinity,
        resetTime: new Date(Date.now() + 86400000),
        key: 'error'
      };
    }
  }

  private async checkRule(request: RateLimitRequest, rule: RateLimitRule): Promise<RateLimitResult> {
    const key = this.generateKey(request, rule);
    
    // Incrementar contador y verificar límite
    return await this.rateLimitPort.incrementCounter({
      ...request,
      metadata: { ...request.metadata, ruleId: rule.id, key }
    });
  }

  private async handleViolation(
    request: RateLimitRequest, 
    rule: RateLimitRule, 
    result: RateLimitResult
  ): Promise<void> {
    // Crear violación
    const violation: RateLimitViolation = {
      id: uuidv4(),
      ruleId: rule.id,
      key: result.key,
      userId: request.userId,
      channel: request.channel,
      command: request.command,
      ip: request.ip,
      timestamp: new Date(),
      attemptedCount: result.limit + 1,
      limit: result.limit,
      windowMs: rule.windowMs,
      metadata: request.metadata
    };

    await this.rateLimitPort.recordViolation(violation);

    // Incrementar contador de violaciones
    const userKey = request.userId || 'unknown';
    const currentCount = this.violationCount.get(userKey) || 0;
    this.violationCount.set(userKey, currentCount + 1);

    // Registrar métricas
    await this.metricsCollector.recordUsage({
      event: 'rate_limit_violated',
      userId: request.userId || 'system',
      channel: request.channel || 'system',
      properties: {
        ruleId: rule.id,
        ruleName: rule.name,
        command: request.command,
        limit: result.limit,
        attempted: violation.attemptedCount
      }
    });

    // Verificar si necesitamos enviar alerta
    if (currentCount >= this.config.violationThreshold) {
      await this.sendViolationAlert(request, rule, currentCount);
    }

    this.logger.warn('Rate limit violation detected:', {
      userId: request.userId,
      channel: request.channel,
      command: request.command,
      rule: rule.name,
      limit: result.limit,
      attempted: violation.attemptedCount
    });
  }

  private async sendViolationAlert(
    request: RateLimitRequest, 
    rule: RateLimitRule, 
    violationCount: number
  ): Promise<void> {
    // TODO: Implementar notificación a Slack cuando esté disponible
    this.logger.error('Rate limit violation alert:', {
      userId: request.userId,
      channel: request.channel,
      ruleName: rule.name,
      violationCount,
      threshold: this.config.violationThreshold
    });

    await this.metricsCollector.recordError({
      errorType: 'rate_limit_threshold_exceeded',
      errorMessage: `User ${request.userId} exceeded violation threshold: ${violationCount}`,
      userId: request.userId,
      channel: request.channel,
      commandType: request.command,
      severity: 'high'
    });
  }

  private isWhitelisted(request: RateLimitRequest): boolean {
    if (request.userId && this.config.whitelistedUsers.includes(request.userId)) {
      return true;
    }
    
    if (request.channel && this.config.whitelistedChannels.includes(request.channel)) {
      return true;
    }
    
    return false;
  }

  private async getApplicableRules(request: RateLimitRequest): Promise<RateLimitRule[]> {
    const allRules = await this.rateLimitPort.getRules(true);
    
    return allRules
      .filter(rule => this.ruleApplies(request, rule))
      .filter(rule => !request.skipRules?.includes(rule.id))
      .sort((a, b) => a.priority - b.priority); // Menor prioridad = más importante
  }

  private ruleApplies(request: RateLimitRequest, rule: RateLimitRule): boolean {
    // Verificar scope
    switch (rule.scope) {
      case 'global':
        return true;
      case 'user':
        return !!request.userId;
      case 'channel':
        return !!request.channel;
      case 'command':
        return !!request.command;
      case 'user_command':
        return !!(request.userId && request.command);
      case 'channel_command':
        return !!(request.channel && request.command);
      case 'ip':
        return !!request.ip;
      default:
        return false;
    }
  }

  private generateKey(request: RateLimitRequest, rule: RateLimitRule): string {
    const parts: string[] = [rule.scope];

    switch (rule.scope) {
      case 'global':
        return 'global';
      case 'user':
        parts.push(request.userId || 'unknown');
        break;
      case 'channel':
        parts.push(request.channel || 'unknown');
        break;
      case 'command':
        parts.push(request.command || 'unknown');
        break;
      case 'user_command':
        parts.push(request.userId || 'unknown', request.command || 'unknown');
        break;
      case 'channel_command':
        parts.push(request.channel || 'unknown', request.command || 'unknown');
        break;
      case 'ip':
        parts.push(request.ip || 'unknown');
        break;
    }

    return parts.join(':');
  }

  private async loadDefaultRules(): Promise<void> {
    this.logger.info('Cargando reglas de rate limiting por defecto...');

    for (const [name, config] of Object.entries(DEFAULT_RATE_LIMITS)) {
      const rule: RateLimitRule = {
        id: uuidv4(),
        name: `default_${name.toLowerCase()}`,
        description: `Default rate limit for ${name}`,
        enabled: true,
        limit: config.limit,
        windowMs: config.windowMs,
        scope: config.scope,
        targets: 'targets' in config ? [...config.targets] : [],
        message: 'Rate limit exceeded. Please wait before trying again.',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        priority: 100, // Prioridad baja para reglas por defecto
        tags: ['default', 'system']
      };

      try {
        await this.rateLimitPort.createRule(rule);
        this.logger.debug('Regla por defecto creada:', { name: rule.name });
      } catch (error) {
        this.logger.warn('Error creando regla por defecto:', { name: rule.name, error });
      }
    }

    this.logger.info('Reglas por defecto cargadas exitosamente');
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(async () => {
      try {
        const cleaned = await this.rateLimitPort.cleanupExpiredEntries();
        if (cleaned > 0) {
          this.logger.debug('Entradas de rate limit limpiadas:', { count: cleaned });
          
          await this.metricsCollector.recordSystem({
            component: 'rate_limit',
            metric: 'cleanup_entries',
            value: cleaned,
            unit: 'count'
          });
        }
      } catch (error) {
        this.logger.error('Error en limpieza automática de rate limit:', error);
      }
    }, this.config.cleanupInterval);
  }

  // Implementaciones de la interfaz
  async getUserLimits(userId: string): Promise<RateLimitResult[]> {
    const rules = await this.rateLimitPort.getRules(true);
    const results: RateLimitResult[] = [];

    for (const rule of rules) {
      if (this.ruleApplies({ userId }, rule)) {
        const key = this.generateKey({ userId }, rule);
        const entry = await this.rateLimitPort.getEntry(key, rule.id);
        
        if (entry) {
          const remaining = Math.max(0, rule.limit - entry.count);
          results.push({
            allowed: remaining > 0,
            limit: rule.limit,
            remaining,
            resetTime: entry.resetTime,
            rule,
            key
          });
        }
      }
    }

    return results;
  }

  async resetUserLimits(userId: string): Promise<void> {
    await this.rateLimitPort.resetLimit(`user:${userId}`);
    
    await this.metricsCollector.recordUsage({
      event: 'rate_limit_reset',
      userId,
      channel: 'system',
      properties: { type: 'user' }
    });
  }

  async getChannelLimits(channel: string): Promise<RateLimitResult[]> {
    const rules = await this.rateLimitPort.getRules(true);
    const results: RateLimitResult[] = [];

    for (const rule of rules) {
      if (this.ruleApplies({ channel }, rule)) {
        const key = this.generateKey({ channel }, rule);
        const entry = await this.rateLimitPort.getEntry(key, rule.id);
        
        if (entry) {
          const remaining = Math.max(0, rule.limit - entry.count);
          results.push({
            allowed: remaining > 0,
            limit: rule.limit,
            remaining,
            resetTime: entry.resetTime,
            rule,
            key
          });
        }
      }
    }

    return results;
  }

  async resetChannelLimits(channel: string): Promise<void> {
    await this.rateLimitPort.resetLimit(`channel:${channel}`);
    
    await this.metricsCollector.recordUsage({
      event: 'rate_limit_reset',
      userId: 'system',
      channel,
      properties: { type: 'channel' }
    });
  }

  async getCommandLimits(command: string): Promise<RateLimitResult[]> {
    const rules = await this.rateLimitPort.getRules(true);
    const results: RateLimitResult[] = [];

    for (const rule of rules) {
      if (this.ruleApplies({ command }, rule)) {
        const key = this.generateKey({ command }, rule);
        const entry = await this.rateLimitPort.getEntry(key, rule.id);
        
        if (entry) {
          const remaining = Math.max(0, rule.limit - entry.count);
          results.push({
            allowed: remaining > 0,
            limit: rule.limit,
            remaining,
            resetTime: entry.resetTime,
            rule,
            key
          });
        }
      }
    }

    return results;
  }

  async configure(options: RateLimitServiceOptions): Promise<void> {
    this.config = { ...this.config, ...options };
    this.logger.info('RateLimitService configurado:', this.config);
    
    await this.metricsCollector.recordUsage({
      event: 'rate_limit_configured',
      userId: 'system',
      channel: 'system',
      properties: { options }
    });
  }

  getConfiguration(): RateLimitServiceOptions {
    return { ...this.config };
  }

  async status(): Promise<RateLimitServiceStatus> {
    const stats = await this.rateLimitPort.getStatistics();
    
    return {
      enabled: this.config.enabled,
      rulesLoaded: stats.activeRules,
      entriesActive: stats.totalEntries,
      violationsRecent: stats.recentViolations.length,
      memoryUsage: stats.memoryUsage?.estimatedBytes || 0,
      lastCleanup: new Date(), // TODO: Implementar tracking real
      uptime: Date.now() - this.startTime.getTime()
    };
  }
} 