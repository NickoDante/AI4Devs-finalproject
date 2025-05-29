import { 
  SecurityContext,
  AuthenticationResult,
  AuthorizationResult,
  SecurityRule,
  SecurityViolation,
  SecurityAuditLog,
  InputValidationRule,
  EncryptedData,
  SecurityConfiguration
} from '../models/Security';
import { Message } from '../models/Message';

export interface SecurityPort {
  // Gestión de reglas de seguridad
  createSecurityRule(rule: SecurityRule): Promise<SecurityRule>;
  updateSecurityRule(ruleId: string, updates: Partial<SecurityRule>): Promise<SecurityRule | null>;
  deleteSecurityRule(ruleId: string): Promise<boolean>;
  getSecurityRule(ruleId: string): Promise<SecurityRule | null>;
  getSecurityRules(enabled?: boolean): Promise<SecurityRule[]>;
  
  // Gestión de violaciones
  recordViolation(violation: SecurityViolation): Promise<void>;
  getViolations(filters?: ViolationFilter): Promise<SecurityViolation[]>;
  updateViolationStatus(violationId: string, status: string, resolution?: string): Promise<boolean>;
  
  // Gestión de logs de auditoría
  createAuditLog(log: SecurityAuditLog): Promise<void>;
  getAuditLogs(filters?: AuditLogFilter): Promise<SecurityAuditLog[]>;
  exportAuditLogs(filters?: AuditLogFilter, format?: 'json' | 'csv' | 'xml'): Promise<string>;
  
  // Gestión de reglas de validación
  createValidationRule(rule: InputValidationRule): Promise<InputValidationRule>;
  getValidationRules(field?: string): Promise<InputValidationRule[]>;
  updateValidationRule(ruleId: string, updates: Partial<InputValidationRule>): Promise<InputValidationRule | null>;
  deleteValidationRule(ruleId: string): Promise<boolean>;
  
  // Encriptación y protección de datos
  encrypt(data: string, keyId?: string): Promise<EncryptedData>;
  decrypt(encryptedData: EncryptedData): Promise<string>;
  rotateKeys(): Promise<string[]>; // Retorna IDs de las nuevas claves
  
  // Utilidades
  healthCheck(): Promise<boolean>;
  getStatistics(): Promise<SecurityStatistics>;
  cleanupOldData(retentionDays: number): Promise<{ violations: number; auditLogs: number }>;
}

export interface AuthenticationService {
  // Autenticación básica
  authenticate(credentials: AuthenticationCredentials): Promise<AuthenticationResult>;
  validateToken(token: string): Promise<AuthenticationResult>;
  refreshToken(token: string): Promise<AuthenticationResult>;
  
  // Gestión de sesiones
  createSession(userId: string, metadata?: Record<string, any>): Promise<string>;
  validateSession(sessionId: string): Promise<boolean>;
  destroySession(sessionId: string): Promise<boolean>;
  
  // Slack específico
  validateSlackToken(token: string, teamId: string): Promise<AuthenticationResult>;
  validateSlackSignature(timestamp: string, signature: string, body: string): Promise<boolean>;
  
  // Configuración
  configure(config: SecurityConfiguration['authentication']): Promise<void>;
  getFailedAttempts(userId: string): Promise<number>;
  isUserLocked(userId: string): Promise<boolean>;
  lockUser(userId: string, duration?: number): Promise<void>;
  unlockUser(userId: string): Promise<void>;
}

export interface AuthorizationService {
  // Verificación de permisos
  hasPermission(context: SecurityContext, permission: string, resource?: string): Promise<AuthorizationResult>;
  hasRole(context: SecurityContext, role: string): Promise<boolean>;
  hasAnyRole(context: SecurityContext, roles: string[]): Promise<boolean>;
  
  // Gestión de roles y permisos
  assignRole(userId: string, role: string): Promise<boolean>;
  removeRole(userId: string, role: string): Promise<boolean>;
  getUserRoles(userId: string): Promise<string[]>;
  getRolePermissions(role: string): Promise<string[]>;
  
  // Cache de permisos
  clearUserCache(userId: string): Promise<void>;
  clearAllCache(): Promise<void>;
  
  // Configuración
  configure(config: SecurityConfiguration['authorization']): Promise<void>;
}

export interface InputValidationService {
  // Validación
  validateInput(field: string, value: any): Promise<ValidationResult>;
  validateMessage(message: Message): Promise<ValidationResult>;
  validateObject(obj: Record<string, any>, rules?: InputValidationRule[]): Promise<ValidationResult>;
  
  // Sanitización
  sanitizeInput(field: string, value: string): Promise<string>;
  sanitizeMessage(message: Message): Promise<Message>;
  
  // Detección de contenido malicioso
  detectMaliciousContent(content: string): Promise<MaliciousContentResult>;
  
  // Configuración
  configure(config: SecurityConfiguration['inputValidation']): Promise<void>;
}

export interface SecurityAuditService {
  // Registro de eventos
  logEvent(event: SecurityAuditEvent): Promise<void>;
  logAuthentication(userId: string, result: AuthenticationResult, context: SecurityContext): Promise<void>;
  logAuthorization(permission: string, result: AuthorizationResult, context: SecurityContext): Promise<void>;
  logCommand(message: Message, result: 'success' | 'failure', context: SecurityContext): Promise<void>;
  
  // Análisis de eventos
  analyzeSecurityEvents(timeRange: TimeRange): Promise<SecurityAnalysis>;
  detectAnomalies(userId: string, timeRange: TimeRange): Promise<SecurityAnomaly[]>;
  generateSecurityReport(timeRange: TimeRange): Promise<SecurityReport>;
  
  // Alertas
  checkAlertConditions(): Promise<SecurityAlert[]>;
  sendAlert(alert: SecurityAlert): Promise<boolean>;
}

// Interfaces auxiliares
export interface AuthenticationCredentials {
  type: 'slack_token' | 'username_password' | 'api_key';
  userId?: string;
  username?: string;
  password?: string;
  token?: string;
  apiKey?: string;
  teamId?: string;
  metadata?: Record<string, any>;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  sanitized?: any;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface ValidationError {
  field: string;
  rule: string;
  message: string;
  value: any;
  expectedFormat?: string;
}

export interface MaliciousContentResult {
  isMalicious: boolean;
  threats: ThreatInfo[];
  riskScore: number; // 0-100
  blockedPatterns: string[];
}

export interface ThreatInfo {
  type: 'xss' | 'sql_injection' | 'command_injection' | 'path_traversal' | 'malicious_script' | 'phishing';
  severity: 'low' | 'medium' | 'high' | 'critical';
  pattern: string;
  description: string;
}

export interface SecurityAuditEvent {
  eventType: string;
  userId: string;
  username: string;
  channel: string;
  action: string;
  resource: string;
  result: 'success' | 'failure' | 'partial';
  details: Record<string, any>;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
}

export interface ViolationFilter {
  type?: string[];
  severity?: string[];
  userId?: string;
  channel?: string;
  status?: string[];
  startTime?: Date;
  endTime?: Date;
  limit?: number;
  offset?: number;
}

export interface AuditLogFilter {
  eventType?: string[];
  userId?: string;
  channel?: string;
  action?: string[];
  result?: string[];
  riskLevel?: string[];
  startTime?: Date;
  endTime?: Date;
  limit?: number;
  offset?: number;
}

export interface TimeRange {
  startTime: Date;
  endTime: Date;
}

export interface SecurityStatistics {
  totalRules: number;
  activeRules: number;
  totalViolations: number;
  criticalViolations: number;
  totalAuditLogs: number;
  authenticatedUsers: number;
  failedLogins: number;
  topViolationTypes: Array<{ type: string; count: number }>;
  topViolatingUsers: Array<{ userId: string; count: number }>;
  riskDistribution: Record<string, number>;
  trendsLastWeek: SecurityTrends;
}

export interface SecurityTrends {
  violations: Array<{ date: string; count: number }>;
  authentications: Array<{ date: string; successful: number; failed: number }>;
  riskLevels: Array<{ date: string; high: number; critical: number }>;
}

export interface SecurityAnalysis {
  summary: {
    totalEvents: number;
    successRate: number;
    failureRate: number;
    averageRiskLevel: number;
  };
  patterns: {
    mostActiveUsers: Array<{ userId: string; eventCount: number }>;
    mostActiveChannels: Array<{ channel: string; eventCount: number }>;
    peakHours: Array<{ hour: number; eventCount: number }>;
    riskDistribution: Record<string, number>;
  };
  anomalies: SecurityAnomaly[];
  recommendations: string[];
}

export interface SecurityAnomaly {
  id: string;
  type: 'unusual_activity' | 'failed_login_spike' | 'permission_escalation' | 'suspicious_pattern';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  userId: string;
  detectedAt: Date;
  evidence: Record<string, any>;
  recommendation: string;
}

export interface SecurityAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  conditions: string[];
  channels: string[];
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface SecurityReport {
  id: string;
  title: string;
  period: TimeRange;
  generatedAt: Date;
  summary: SecurityAnalysis['summary'];
  details: {
    violations: SecurityViolation[];
    topRisks: string[];
    recommendations: string[];
    trends: SecurityTrends;
  };
  format: 'json' | 'pdf' | 'html';
  data: string; // Contenido serializado del reporte
} 