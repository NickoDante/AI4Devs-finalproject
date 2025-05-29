import { Logger } from 'winston';
import { createHmac, createCipher, createDecipher, randomBytes, pbkdf2 } from 'crypto';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import {
  AuthenticationService,
  AuthorizationService,
  InputValidationService,
  SecurityAuditService,
  AuthenticationCredentials,
  ValidationResult,
  MaliciousContentResult,
  SecurityAuditEvent,
  TimeRange,
  SecurityAnalysis,
  SecurityAnomaly,
  SecurityAlert,
  SecurityReport
} from '../../domain/ports/SecurityPort';
import {
  SecurityContext,
  AuthenticationResult,
  AuthorizationResult,
  SecurityConfiguration,
  EncryptedData,
  DEFAULT_SECURITY_CONFIG
} from '../../domain/models/Security';
import { Message } from '../../domain/models/Message';
import { MetricsCollectorService } from './MetricsCollectorService';

const pbkdf2Async = promisify(pbkdf2);

export class TGSecurityService {
  private config: SecurityConfiguration = DEFAULT_SECURITY_CONFIG;
  private failedAttempts: Map<string, { count: number; lastAttempt: Date; lockedUntil?: Date }> = new Map();
  private activeSessions: Map<string, { userId: string; createdAt: Date; metadata?: Record<string, any> }> = new Map();
  private userRoles: Map<string, string[]> = new Map();
  private rolePermissions: Map<string, string[]> = new Map();
  private permissionCache: Map<string, { permissions: string[]; expiresAt: Date }> = new Map();
  private encryptionKeys: Map<string, { key: Buffer; createdAt: Date }> = new Map();
  private currentKeyId: string;

  constructor(
    private readonly metricsCollector: MetricsCollectorService,
    private readonly logger: Logger
  ) {
    this.initializeDefaults();
    this.currentKeyId = this.generateEncryptionKey();
  }

  private initializeDefaults(): void {
    // Roles predefinidos
    this.rolePermissions.set('admin', [
      'system.admin',
      'user.manage',
      'channel.manage',
      'command.all',
      'metrics.view',
      'security.manage'
    ]);
    
    this.rolePermissions.set('moderator', [
      'user.moderate',
      'channel.moderate',
      'command.moderate',
      'metrics.view'
    ]);
    
    this.rolePermissions.set('user', [
      'command.search',
      'command.question',
      'command.summary',
      'command.feedback',
      'command.help'
    ]);

    // Usuarios con roles predefinidos (ejemplo)
    this.userRoles.set('admin_user', ['admin']);
    this.userRoles.set('mod_user', ['moderator']);
  }

  private generateEncryptionKey(): string {
    const keyId = uuidv4();
    const key = randomBytes(32); // 256 bits
    this.encryptionKeys.set(keyId, { key, createdAt: new Date() });
    return keyId;
  }

  // ==================== AUTHENTICATION SERVICE ====================

  async authenticate(credentials: AuthenticationCredentials): Promise<AuthenticationResult> {
    try {
      if (!this.config.authentication.enabled) {
        return {
          authenticated: true,
          userId: credentials.userId || 'anonymous',
          username: credentials.username || 'anonymous',
          roles: ['user'],
          reason: 'authentication_disabled'
        };
      }

      // Verificar si el usuario está bloqueado
      if (credentials.userId && await this.isUserLocked(credentials.userId)) {
        const lockInfo = this.failedAttempts.get(credentials.userId);
        return {
          authenticated: false,
          reason: `User locked until ${lockInfo?.lockedUntil?.toISOString()}`
        };
      }

      let result: AuthenticationResult;

      switch (credentials.type) {
        case 'slack_token':
          result = await this.authenticateSlackToken(credentials);
          break;
        case 'api_key':
          result = await this.authenticateApiKey(credentials);
          break;
        default:
          result = {
            authenticated: false,
            reason: 'unsupported_authentication_type'
          };
      }

      // Registrar intento de autenticación
      if (credentials.userId) {
        if (result.authenticated) {
          this.failedAttempts.delete(credentials.userId);
        } else {
          await this.recordFailedAttempt(credentials.userId);
        }
      }

      await this.metricsCollector.recordUsage({
        event: 'authentication_attempt',
        userId: credentials.userId || 'unknown',
        channel: 'system',
        properties: {
          type: credentials.type,
          success: result.authenticated,
          reason: result.reason
        }
      });

      return result;
    } catch (error) {
      this.logger.error('Error durante autenticación:', error);
      return {
        authenticated: false,
        reason: 'authentication_error'
      };
    }
  }

  private async authenticateSlackToken(credentials: AuthenticationCredentials): Promise<AuthenticationResult> {
    // Simulación de validación de token Slack
    if (!credentials.token || !credentials.teamId) {
      return {
        authenticated: false,
        reason: 'missing_token_or_team_id'
      };
    }

    // En un entorno real, aquí se validaría con la API de Slack
    const isValidToken = credentials.token.startsWith('xoxb-') && credentials.token.length > 50;
    
    if (isValidToken) {
      const userId = credentials.userId || `slack_user_${Date.now()}`;
      const roles = this.userRoles.get(userId) || ['user'];
      
      return {
        authenticated: true,
        userId,
        username: credentials.username || userId,
        roles,
        token: credentials.token,
        expiresAt: new Date(Date.now() + this.config.authentication.tokenExpiry * 1000)
      };
    }

    return {
      authenticated: false,
      reason: 'invalid_slack_token'
    };
  }

  private async authenticateApiKey(credentials: AuthenticationCredentials): Promise<AuthenticationResult> {
    // Simulación de validación de API key
    if (!credentials.apiKey) {
      return {
        authenticated: false,
        reason: 'missing_api_key'
      };
    }

    // En un entorno real, aquí se verificaría la API key en la base de datos
    const isValidApiKey = credentials.apiKey.length === 64; // Ejemplo de formato
    
    if (isValidApiKey) {
      const userId = credentials.userId || `api_user_${credentials.apiKey.substring(0, 8)}`;
      const roles = this.userRoles.get(userId) || ['user'];
      
      return {
        authenticated: true,
        userId,
        username: credentials.username || userId,
        roles,
        expiresAt: new Date(Date.now() + this.config.authentication.tokenExpiry * 1000)
      };
    }

    return {
      authenticated: false,
      reason: 'invalid_api_key'
    };
  }

  async validateToken(token: string): Promise<AuthenticationResult> {
    // Implementación simplificada
    if (token.startsWith('xoxb-') && token.length > 50) {
      return {
        authenticated: true,
        userId: 'token_user',
        username: 'Token User',
        roles: ['user']
      };
    }
    
    return {
      authenticated: false,
      reason: 'invalid_token'
    };
  }

  async refreshToken(token: string): Promise<AuthenticationResult> {
    const validation = await this.validateToken(token);
    if (validation.authenticated && validation.userId) {
      return {
        ...validation,
        token: `${token}_refreshed_${Date.now()}`,
        expiresAt: new Date(Date.now() + this.config.authentication.tokenExpiry * 1000)
      };
    }
    
    return validation;
  }

  async createSession(userId: string, metadata?: Record<string, any>): Promise<string> {
    const sessionId = uuidv4();
    this.activeSessions.set(sessionId, {
      userId,
      createdAt: new Date(),
      metadata
    });
    
    this.logger.info('Session created:', { sessionId, userId });
    return sessionId;
  }

  async validateSession(sessionId: string): Promise<boolean> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return false;
    
    // Verificar expiración (ejemplo: 24 horas)
    const sessionAge = Date.now() - session.createdAt.getTime();
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas
    
    if (sessionAge > maxAge) {
      this.activeSessions.delete(sessionId);
      return false;
    }
    
    return true;
  }

  async destroySession(sessionId: string): Promise<boolean> {
    return this.activeSessions.delete(sessionId);
  }

  async validateSlackToken(token: string, teamId: string): Promise<AuthenticationResult> {
    return await this.authenticate({
      type: 'slack_token',
      token,
      teamId
    });
  }

  async validateSlackSignature(timestamp: string, signature: string, body: string): Promise<boolean> {
    // Implementación de validación de firma Slack
    const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;
    if (!slackSigningSecret) return false;
    
    const hmac = createHmac('sha256', slackSigningSecret);
    const expectedSignature = 'v0=' + hmac.update(`v0:${timestamp}:${body}`).digest('hex');
    
    return signature === expectedSignature;
  }

  async getFailedAttempts(userId: string): Promise<number> {
    return this.failedAttempts.get(userId)?.count || 0;
  }

  async isUserLocked(userId: string): Promise<boolean> {
    const info = this.failedAttempts.get(userId);
    if (!info?.lockedUntil) return false;
    
    if (new Date() > info.lockedUntil) {
      this.failedAttempts.delete(userId);
      return false;
    }
    
    return true;
  }

  async lockUser(userId: string, duration?: number): Promise<void> {
    const lockDuration = duration || this.config.authentication.lockoutDuration;
    const lockedUntil = new Date(Date.now() + lockDuration * 1000);
    
    this.failedAttempts.set(userId, {
      count: this.config.authentication.maxFailedAttempts,
      lastAttempt: new Date(),
      lockedUntil
    });
    
    this.logger.warn('User locked:', { userId, lockedUntil });
  }

  async unlockUser(userId: string): Promise<void> {
    this.failedAttempts.delete(userId);
    this.logger.info('User unlocked:', { userId });
  }

  private async recordFailedAttempt(userId: string): Promise<void> {
    const current = this.failedAttempts.get(userId) || { count: 0, lastAttempt: new Date() };
    current.count++;
    current.lastAttempt = new Date();
    
    if (current.count >= this.config.authentication.maxFailedAttempts) {
      current.lockedUntil = new Date(Date.now() + this.config.authentication.lockoutDuration * 1000);
    }
    
    this.failedAttempts.set(userId, current);
  }

  // ==================== AUTHORIZATION SERVICE ====================

  async hasPermission(context: SecurityContext, permission: string, resource?: string): Promise<AuthorizationResult> {
    if (!this.config.authorization.enabled) {
      return {
        authorized: true,
        permission,
        reason: 'authorization_disabled'
      };
    }

    try {
      // Verificar cache
      const cacheKey = `${context.userId}:${permission}:${resource || 'global'}`;
      const cached = this.permissionCache.get(cacheKey);
      
      if (cached && cached.expiresAt > new Date()) {
        const hasPermission = cached.permissions.includes(permission);
        return {
          authorized: hasPermission,
          permission,
          resource,
          reason: hasPermission ? 'permission_granted' : 'permission_denied',
          userRoles: context.roles
        };
      }

      // Obtener permisos del usuario
      const userPermissions = await this.getUserPermissions(context.userId);
      
      // Actualizar cache
      this.permissionCache.set(cacheKey, {
        permissions: userPermissions,
        expiresAt: new Date(Date.now() + this.config.authorization.cacheTTL * 1000)
      });

      const hasPermission = userPermissions.includes(permission) || userPermissions.includes('*');
      
      return {
        authorized: hasPermission,
        permission,
        resource,
        reason: hasPermission ? 'permission_granted' : 'permission_denied',
        userRoles: context.roles,
        requiredRoles: this.getRequiredRoles(permission)
      };
    } catch (error) {
      this.logger.error('Error checking permission:', error);
      return {
        authorized: false,
        permission,
        reason: 'authorization_error'
      };
    }
  }

  async hasRole(context: SecurityContext, role: string): Promise<boolean> {
    return context.roles.includes(role);
  }

  async hasAnyRole(context: SecurityContext, roles: string[]): Promise<boolean> {
    return roles.some(role => context.roles.includes(role));
  }

  async assignRole(userId: string, role: string): Promise<boolean> {
    const currentRoles = this.userRoles.get(userId) || [];
    if (!currentRoles.includes(role)) {
      currentRoles.push(role);
      this.userRoles.set(userId, currentRoles);
      await this.clearUserCache(userId);
      return true;
    }
    return false;
  }

  async removeRole(userId: string, role: string): Promise<boolean> {
    const currentRoles = this.userRoles.get(userId) || [];
    const index = currentRoles.indexOf(role);
    if (index > -1) {
      currentRoles.splice(index, 1);
      this.userRoles.set(userId, currentRoles);
      await this.clearUserCache(userId);
      return true;
    }
    return false;
  }

  async getUserRoles(userId: string): Promise<string[]> {
    return this.userRoles.get(userId) || [this.config.authorization.defaultRole];
  }

  async getRolePermissions(role: string): Promise<string[]> {
    return this.rolePermissions.get(role) || [];
  }

  async clearUserCache(userId: string): Promise<void> {
    for (const [key] of this.permissionCache.entries()) {
      if (key.startsWith(`${userId}:`)) {
        this.permissionCache.delete(key);
      }
    }
  }

  async clearAllCache(): Promise<void> {
    this.permissionCache.clear();
  }

  private async getUserPermissions(userId: string): Promise<string[]> {
    const roles = await this.getUserRoles(userId);
    const permissions = new Set<string>();
    
    for (const role of roles) {
      const rolePerms = await this.getRolePermissions(role);
      rolePerms.forEach(perm => permissions.add(perm));
    }
    
    return Array.from(permissions);
  }

  private getRequiredRoles(permission: string): string[] {
    const requiredRoles: string[] = [];
    for (const [role, permissions] of this.rolePermissions.entries()) {
      if (permissions.includes(permission)) {
        requiredRoles.push(role);
      }
    }
    return requiredRoles;
  }

  // ==================== INPUT VALIDATION SERVICE ====================

  async validateInput(field: string, value: any): Promise<ValidationResult> {
    const errors: any[] = [];
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';

    if (!this.config.inputValidation.enabled) {
      return { valid: true, errors, riskLevel };
    }

    try {
      // Validación de longitud
      if (typeof value === 'string') {
        if (value.length > this.config.inputValidation.maxInputLength) {
          errors.push({
            field,
            rule: 'max_length',
            message: `Input too long: ${value.length} > ${this.config.inputValidation.maxInputLength}`,
            value: value.substring(0, 100) + '...'
          });
          riskLevel = 'medium';
        }

        // Detección de patrones maliciosos
        const maliciousCheck = await this.detectMaliciousContent(value);
        if (maliciousCheck.isMalicious) {
          errors.push({
            field,
            rule: 'malicious_content',
            message: 'Potentially malicious content detected',
            value: value.substring(0, 100) + '...'
          });
          riskLevel = maliciousCheck.riskScore > 70 ? 'critical' : 'high';
        }
      }

      const valid = errors.length === 0;
      const sanitized = this.config.inputValidation.sanitizeInputs ? 
        await this.sanitizeInput(field, value) : value;

      return { valid, errors, sanitized, riskLevel };
    } catch (error) {
      this.logger.error('Error validating input:', error);
      return {
        valid: false,
        errors: [{ field, rule: 'validation_error', message: 'Validation failed', value }],
        riskLevel: 'medium'
      };
    }
  }

  async validateMessage(message: Message): Promise<ValidationResult> {
    const results: ValidationResult[] = [];
    
    results.push(await this.validateInput('content', message.content));
    results.push(await this.validateInput('userId', message.userId));
    results.push(await this.validateInput('channel', message.channel));

    const allErrors = results.flatMap(r => r.errors);
    const maxRiskLevel = this.getMaxRiskLevel(results.map(r => r.riskLevel));
    
    return {
      valid: allErrors.length === 0,
      errors: allErrors,
      riskLevel: maxRiskLevel,
      sanitized: {
        ...message,
        content: this.config.inputValidation.sanitizeInputs ? 
          await this.sanitizeInput('content', message.content) : message.content
      }
    };
  }

  async validateObject(obj: Record<string, any>, rules?: any[]): Promise<ValidationResult> {
    const errors: any[] = [];
    let maxRiskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';

    for (const [key, value] of Object.entries(obj)) {
      const result = await this.validateInput(key, value);
      errors.push(...result.errors);
      if (this.getRiskLevelScore(result.riskLevel) > this.getRiskLevelScore(maxRiskLevel)) {
        maxRiskLevel = result.riskLevel;
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      riskLevel: maxRiskLevel
    };
  }

  async sanitizeInput(field: string, value: string): Promise<string> {
    if (typeof value !== 'string') return value;
    
    let sanitized = value;
    
    // Sanitización básica
    sanitized = sanitized
      .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remover scripts
      .replace(/javascript:/gi, '') // Remover javascript:
      .replace(/data:text\/html/gi, '') // Remover data URLs HTML
      .replace(/on\w+\s*=/gi, ''); // Remover event handlers
    
    return sanitized.trim();
  }

  async sanitizeMessage(message: Message): Promise<Message> {
    return {
      ...message,
      content: await this.sanitizeInput('content', message.content)
    };
  }

  async detectMaliciousContent(content: string): Promise<MaliciousContentResult> {
    const threats: any[] = [];
    let riskScore = 0;
    const blockedPatterns: string[] = [];

    for (const pattern of this.config.inputValidation.blacklistedPatterns) {
      const regex = new RegExp(pattern, 'gi');
      if (regex.test(content)) {
        const threat = {
          type: this.classifyThreatType(pattern),
          severity: 'medium' as const,
          pattern,
          description: `Matched blacklisted pattern: ${pattern}`
        };
        threats.push(threat);
        blockedPatterns.push(pattern);
        riskScore += 25;
      }
    }

    return {
      isMalicious: threats.length > 0,
      threats,
      riskScore: Math.min(riskScore, 100),
      blockedPatterns
    };
  }

  private classifyThreatType(pattern: string): 'xss' | 'sql_injection' | 'command_injection' | 'path_traversal' | 'malicious_script' | 'phishing' {
    if (pattern.includes('script')) return 'xss';
    if (pattern.includes('javascript')) return 'malicious_script';
    if (pattern.includes('sql')) return 'sql_injection';
    return 'xss'; // default
  }

  private getMaxRiskLevel(levels: string[]): 'low' | 'medium' | 'high' | 'critical' {
    const scores = levels.map(level => this.getRiskLevelScore(level as any));
    const maxScore = Math.max(...scores);
    
    if (maxScore >= 4) return 'critical';
    if (maxScore >= 3) return 'high';
    if (maxScore >= 2) return 'medium';
    return 'low';
  }

  private getRiskLevelScore(level: 'low' | 'medium' | 'high' | 'critical'): number {
    const scores = { low: 1, medium: 2, high: 3, critical: 4 };
    return scores[level];
  }

  // ==================== SECURITY AUDIT SERVICE ====================

  async logEvent(event: SecurityAuditEvent): Promise<void> {
    await this.metricsCollector.recordUsage({
      event: 'security_audit_event',
      userId: event.userId,
      channel: event.channel,
      properties: {
        eventType: event.eventType,
        action: event.action,
        resource: event.resource,
        result: event.result,
        riskLevel: event.riskLevel
      }
    });

    this.logger.info('Security audit event:', event);
  }

  async logAuthentication(userId: string, result: AuthenticationResult, context: SecurityContext): Promise<void> {
    await this.logEvent({
      eventType: 'authentication',
      userId,
      username: context.username,
      channel: context.channel,
      action: 'authenticate',
      resource: 'authentication_service',
      result: result.authenticated ? 'success' : 'failure',
      details: { reason: result.reason },
      riskLevel: result.authenticated ? 'low' : 'medium'
    });
  }

  async logAuthorization(permission: string, result: AuthorizationResult, context: SecurityContext): Promise<void> {
    await this.logEvent({
      eventType: 'authorization',
      userId: context.userId,
      username: context.username,
      channel: context.channel,
      action: 'check_permission',
      resource: permission,
      result: result.authorized ? 'success' : 'failure',
      details: { permission, reason: result.reason },
      riskLevel: result.authorized ? 'low' : 'medium'
    });
  }

  async logCommand(message: Message, result: 'success' | 'failure', context: SecurityContext): Promise<void> {
    await this.logEvent({
      eventType: 'command_execution',
      userId: message.userId,
      username: message.username,
      channel: message.channel,
      action: 'execute_command',
      resource: message.content.split(' ')[0],
      result,
      details: { content: message.content.substring(0, 100) },
      riskLevel: result === 'success' ? 'low' : 'medium'
    });
  }

  async analyzeSecurityEvents(timeRange: TimeRange): Promise<SecurityAnalysis> {
    // Implementación simplificada
    return {
      summary: {
        totalEvents: 0,
        successRate: 0,
        failureRate: 0,
        averageRiskLevel: 0
      },
      patterns: {
        mostActiveUsers: [],
        mostActiveChannels: [],
        peakHours: [],
        riskDistribution: {}
      },
      anomalies: [],
      recommendations: []
    };
  }

  async detectAnomalies(userId: string, timeRange: TimeRange): Promise<SecurityAnomaly[]> {
    // Implementación simplificada
    return [];
  }

  async generateSecurityReport(timeRange: TimeRange): Promise<SecurityReport> {
    const analysis = await this.analyzeSecurityEvents(timeRange);
    
    return {
      id: uuidv4(),
      title: 'Security Report',
      period: timeRange,
      generatedAt: new Date(),
      summary: analysis.summary,
      details: {
        violations: [],
        topRisks: [],
        recommendations: [],
        trends: {
          violations: [],
          authentications: [],
          riskLevels: []
        }
      },
      format: 'json',
      data: JSON.stringify(analysis)
    };
  }

  async checkAlertConditions(): Promise<SecurityAlert[]> {
    // Implementación simplificada
    return [];
  }

  async sendAlert(alert: SecurityAlert): Promise<boolean> {
    this.logger.warn('Security alert:', alert);
    
    await this.metricsCollector.recordError({
      errorType: 'security_alert',
      errorMessage: alert.description,
      severity: alert.severity === 'critical' ? 'critical' : 'medium'
    });
    
    return true;
  }

  // ==================== ENCRYPTION UTILITIES ====================

  async encrypt(data: string, keyId?: string): Promise<EncryptedData> {
    const useKeyId = keyId || this.currentKeyId;
    const keyInfo = this.encryptionKeys.get(useKeyId);
    
    if (!keyInfo) {
      throw new Error('Encryption key not found');
    }

    const iv = randomBytes(16);
    const cipher = createCipher('aes-256-cbc', keyInfo.key);

    let encrypted = cipher.update(data, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    return {
      algorithm: 'aes-256-cbc',
      iv: iv.toString('base64'),
      data: encrypted,
      keyId: useKeyId,
      timestamp: new Date()
    };
  }

  async decrypt(encryptedData: EncryptedData): Promise<string> {
    const keyInfo = this.encryptionKeys.get(encryptedData.keyId);
    
    if (!keyInfo) {
      throw new Error('Decryption key not found');
    }

    const decipher = createDecipher('aes-256-cbc', keyInfo.key);

    let decrypted = decipher.update(encryptedData.data, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  async rotateKeys(): Promise<string[]> {
    const newKeyId = this.generateEncryptionKey();
    this.currentKeyId = newKeyId;
    
    this.logger.info('Encryption key rotated:', { newKeyId });
    return [newKeyId];
  }

  // ==================== GENERAL UTILITIES ====================

  createSecurityContext(message: Message): SecurityContext {
    const roles = this.userRoles.get(message.userId) || ['user'];
    
    return {
      userId: message.userId,
      username: message.username,
      channel: message.channel,
      roles,
      permissions: [],
      sessionId: uuidv4(),
      timestamp: new Date(),
      metadata: message.metadata
    };
  }

  // Configuración general del servicio
  async configureService(config: Partial<SecurityConfiguration>): Promise<void> {
    this.config = { ...this.config, ...config };
    this.logger.info('Security service configured');
  }

  // Métodos configure específicos para cada servicio
  async configureAuthentication(config: SecurityConfiguration['authentication']): Promise<void> {
    this.config.authentication = { ...this.config.authentication, ...config };
    this.logger.info('Authentication service configured');
  }

  async configureAuthorization(config: SecurityConfiguration['authorization']): Promise<void> {
    this.config.authorization = { ...this.config.authorization, ...config };
    this.logger.info('Authorization service configured');
  }

  async configureInputValidation(config: SecurityConfiguration['inputValidation']): Promise<void> {
    this.config.inputValidation = { ...this.config.inputValidation, ...config };
    this.logger.info('Input validation service configured');
  }

  getConfiguration(): SecurityConfiguration {
    return { ...this.config };
  }
} 