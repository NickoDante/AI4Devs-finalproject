import { Logger } from 'winston';
import { v4 as uuidv4 } from 'uuid';
import { 
  RateLimitPort, 
  RateLimitRequest, 
  RateLimitStatistics,
  ViolationFilter 
} from '../../domain/ports/RateLimitPort';
import { 
  RateLimitRule, 
  RateLimitEntry, 
  RateLimitResult, 
  RateLimitViolation 
} from '../../domain/models/RateLimit';

export class MemoryRateLimitAdapter implements RateLimitPort {
  private rules: Map<string, RateLimitRule> = new Map();
  private entries: Map<string, RateLimitEntry> = new Map();
  private violations: RateLimitViolation[] = [];

  constructor(private readonly logger: Logger) {}

  // Gestión de reglas
  async createRule(rule: RateLimitRule): Promise<RateLimitRule> {
    if (!rule.id) {
      rule.id = uuidv4();
    }
    
    this.rules.set(rule.id, rule);
    this.logger.debug('Rate limit rule created:', { id: rule.id, name: rule.name });
    return rule;
  }

  async updateRule(ruleId: string, updates: Partial<RateLimitRule>): Promise<RateLimitRule | null> {
    const rule = this.rules.get(ruleId);
    if (!rule) return null;

    const updatedRule = { ...rule, ...updates, updatedAt: new Date() };
    this.rules.set(ruleId, updatedRule);
    
    this.logger.debug('Rate limit rule updated:', { id: ruleId });
    return updatedRule;
  }

  async deleteRule(ruleId: string): Promise<boolean> {
    const deleted = this.rules.delete(ruleId);
    if (deleted) {
      this.logger.debug('Rate limit rule deleted:', { id: ruleId });
    }
    return deleted;
  }

  async getRule(ruleId: string): Promise<RateLimitRule | null> {
    return this.rules.get(ruleId) || null;
  }

  async getRules(enabled?: boolean): Promise<RateLimitRule[]> {
    const rules = Array.from(this.rules.values());
    if (enabled !== undefined) {
      return rules.filter(rule => rule.enabled === enabled);
    }
    return rules;
  }

  // Verificación de límites
  async checkLimit(request: RateLimitRequest): Promise<RateLimitResult> {
    const applicableRules = await this.getApplicableRules(request);
    
    for (const rule of applicableRules) {
      const key = this.generateKey(request, rule);
      const entry = await this.getEntry(key, rule.id);
      
      if (entry) {
        const now = new Date();
        
        // Verificar si la ventana ha expirado
        if (now > entry.resetTime) {
          // Resetear el contador
          entry.count = 0;
          entry.resetTime = new Date(now.getTime() + rule.windowMs);
          entry.updatedAt = now;
        }
        
        // Verificar el límite
        if (entry.count >= rule.limit) {
          const retryAfter = Math.ceil((entry.resetTime.getTime() - now.getTime()) / 1000);
          
          return {
            allowed: false,
            limit: rule.limit,
            remaining: 0,
            resetTime: entry.resetTime,
            retryAfter,
            rule,
            key
          };
        }
      }
    }

    // Si llegamos aquí, está permitido
    return {
      allowed: true,
      limit: Infinity,
      remaining: Infinity,
      resetTime: new Date(Date.now() + 86400000),
      key: 'allowed'
    };
  }

  async incrementCounter(request: RateLimitRequest): Promise<RateLimitResult> {
    const applicableRules = await this.getApplicableRules(request);
    
    for (const rule of applicableRules) {
      const key = this.generateKey(request, rule);
      let entry = await this.getEntry(key, rule.id);
      
      const now = new Date();
      
      if (!entry) {
        // Crear nueva entrada
        entry = {
          id: uuidv4(),
          ruleId: rule.id,
          key,
          count: 0,
          resetTime: new Date(now.getTime() + rule.windowMs),
          createdAt: now,
          updatedAt: now
        };
        
        await this.createEntry(entry);
      }
      
      // Verificar si la ventana ha expirado
      if (now > entry.resetTime) {
        entry.count = 0;
        entry.resetTime = new Date(now.getTime() + rule.windowMs);
        entry.updatedAt = now;
      }
      
      // Incrementar contador
      entry.count++;
      entry.updatedAt = now;
      
      // Verificar límite
      if (entry.count > rule.limit) {
        const retryAfter = Math.ceil((entry.resetTime.getTime() - now.getTime()) / 1000);
        
        return {
          allowed: false,
          limit: rule.limit,
          remaining: 0,
          resetTime: entry.resetTime,
          retryAfter,
          rule,
          key
        };
      }
      
      // Calcular restantes
      const remaining = Math.max(0, rule.limit - entry.count);
      
      return {
        allowed: true,
        limit: rule.limit,
        remaining,
        resetTime: entry.resetTime,
        rule,
        key
      };
    }

    // Sin reglas aplicables
    return {
      allowed: true,
      limit: Infinity,
      remaining: Infinity,
      resetTime: new Date(Date.now() + 86400000),
      key: 'no_rules'
    };
  }

  // Gestión de entradas
  async getEntry(key: string, ruleId: string): Promise<RateLimitEntry | null> {
    const entryKey = `${ruleId}:${key}`;
    return this.entries.get(entryKey) || null;
  }

  async createEntry(entry: RateLimitEntry): Promise<RateLimitEntry> {
    if (!entry.id) {
      entry.id = uuidv4();
    }
    
    const entryKey = `${entry.ruleId}:${entry.key}`;
    this.entries.set(entryKey, entry);
    
    return entry;
  }

  async updateEntry(entryId: string, updates: Partial<RateLimitEntry>): Promise<RateLimitEntry | null> {
    for (const [key, entry] of this.entries.entries()) {
      if (entry.id === entryId) {
        const updatedEntry = { ...entry, ...updates, updatedAt: new Date() };
        this.entries.set(key, updatedEntry);
        return updatedEntry;
      }
    }
    return null;
  }

  async deleteEntry(entryId: string): Promise<boolean> {
    for (const [key, entry] of this.entries.entries()) {
      if (entry.id === entryId) {
        return this.entries.delete(key);
      }
    }
    return false;
  }

  // Violaciones
  async recordViolation(violation: RateLimitViolation): Promise<void> {
    if (!violation.id) {
      violation.id = uuidv4();
    }
    
    this.violations.push(violation);
    
    // Mantener solo las últimas 1000 violaciones
    if (this.violations.length > 1000) {
      this.violations = this.violations.slice(-1000);
    }
    
    this.logger.warn('Rate limit violation recorded:', {
      id: violation.id,
      userId: violation.userId,
      ruleId: violation.ruleId
    });
  }

  async getViolations(filters?: ViolationFilter): Promise<RateLimitViolation[]> {
    let result = [...this.violations];
    
    if (filters) {
      if (filters.ruleId) {
        result = result.filter(v => v.ruleId === filters.ruleId);
      }
      
      if (filters.userId) {
        result = result.filter(v => v.userId === filters.userId);
      }
      
      if (filters.channel) {
        result = result.filter(v => v.channel === filters.channel);
      }
      
      if (filters.command) {
        result = result.filter(v => v.command === filters.command);
      }
      
      if (filters.startTime) {
        result = result.filter(v => v.timestamp >= filters.startTime!);
      }
      
      if (filters.endTime) {
        result = result.filter(v => v.timestamp <= filters.endTime!);
      }
      
      if (filters.limit !== undefined) {
        result = result.slice(0, filters.limit);
      }
    }
    
    return result.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Utilidades
  async resetLimit(key: string, ruleId?: string): Promise<void> {
    if (ruleId) {
      const entryKey = `${ruleId}:${key}`;
      this.entries.delete(entryKey);
    } else {
      // Resetear todas las entradas que contengan la clave
      for (const [entryKey] of this.entries.entries()) {
        if (entryKey.includes(key)) {
          this.entries.delete(entryKey);
        }
      }
    }
    
    this.logger.debug('Rate limit reset:', { key, ruleId });
  }

  async cleanupExpiredEntries(): Promise<number> {
    const now = new Date();
    let cleaned = 0;
    
    for (const [key, entry] of this.entries.entries()) {
      if (now > entry.resetTime) {
        this.entries.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      this.logger.debug('Cleaned expired rate limit entries:', { count: cleaned });
    }
    
    return cleaned;
  }

  async getStatistics(): Promise<RateLimitStatistics> {
    const activeRules = Array.from(this.rules.values()).filter(r => r.enabled);
    
    // Top reglas violadas
    const violationsByRule = new Map<string, number>();
    for (const violation of this.violations) {
      violationsByRule.set(violation.ruleId, (violationsByRule.get(violation.ruleId) || 0) + 1);
    }
    
    const topViolatedRules = Array.from(violationsByRule.entries())
      .map(([ruleId, count]) => ({ ruleId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top usuarios violadores
    const violationsByUser = new Map<string, number>();
    for (const violation of this.violations) {
      if (violation.userId) {
        violationsByUser.set(violation.userId, (violationsByUser.get(violation.userId) || 0) + 1);
      }
    }
    
    const topViolatingUsers = Array.from(violationsByUser.entries())
      .map(([userId, count]) => ({ userId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top canales violadores
    const violationsByChannel = new Map<string, number>();
    for (const violation of this.violations) {
      if (violation.channel) {
        violationsByChannel.set(violation.channel, (violationsByChannel.get(violation.channel) || 0) + 1);
      }
    }
    
    const topViolatingChannels = Array.from(violationsByChannel.entries())
      .map(([channel, count]) => ({ channel, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Violaciones recientes (última hora)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentViolations = this.violations.filter(v => v.timestamp > oneHourAgo);

    return {
      totalRules: this.rules.size,
      activeRules: activeRules.length,
      totalEntries: this.entries.size,
      totalViolations: this.violations.length,
      topViolatedRules,
      topViolatingUsers,
      topViolatingChannels,
      recentViolations,
      memoryUsage: {
        entries: this.entries.size,
        violations: this.violations.length,
        estimatedBytes: this.estimateMemoryUsage()
      }
    };
  }

  async healthCheck(): Promise<boolean> {
    return true; // Memory adapter is always healthy
  }

  // Métodos auxiliares privados
  private async getApplicableRules(request: RateLimitRequest): Promise<RateLimitRule[]> {
    const rules = await this.getRules(true);
    return rules
      .filter(rule => this.ruleApplies(request, rule))
      .sort((a, b) => a.priority - b.priority);
  }

  private ruleApplies(request: RateLimitRequest, rule: RateLimitRule): boolean {
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

  private estimateMemoryUsage(): number {
    let bytes = 0;
    
    // Estimar memoria de reglas
    bytes += this.rules.size * 500; // Aproximadamente 500 bytes por regla
    
    // Estimar memoria de entradas
    bytes += this.entries.size * 200; // Aproximadamente 200 bytes por entrada
    
    // Estimar memoria de violaciones
    bytes += this.violations.length * 300; // Aproximadamente 300 bytes por violación
    
    return bytes;
  }
} 