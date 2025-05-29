// Modelos de dominio para el sistema de seguridad

export interface SecurityContext {
  userId: string;
  username: string;
  channel: string;
  roles: string[];
  permissions: string[];
  sessionId: string;
  ipAddress?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface AuthenticationResult {
  authenticated: boolean;
  userId?: string;
  username?: string;
  roles?: string[];
  token?: string;
  expiresAt?: Date;
  reason?: string;
  metadata?: Record<string, any>;
}

export interface AuthorizationResult {
  authorized: boolean;
  permission: string;
  resource?: string;
  reason?: string;
  requiredRoles?: string[];
  userRoles?: string[];
}

export interface SecurityRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  
  // Configuración de la regla
  type: 'authentication' | 'authorization' | 'input_validation' | 'rate_limiting' | 'content_filtering';
  condition: string; // Expresión para evaluar cuándo aplicar la regla
  action: 'allow' | 'deny' | 'warn' | 'log';
  
  // Criterios de aplicación
  scope: SecurityRuleScope;
  targets: SecurityTarget[];
  
  // Configuración de respuesta
  message?: string;
  logLevel: 'info' | 'warn' | 'error' | 'critical';
  alertChannels?: string[];
  
  // Metadatos
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  priority: number;
  tags?: string[];
}

export type SecurityRuleScope = 
  | 'global'
  | 'user'
  | 'channel' 
  | 'command'
  | 'admin'
  | 'custom';

export interface SecurityTarget {
  type: 'user' | 'channel' | 'command' | 'role' | 'pattern';
  value: string;
  operator?: 'equals' | 'contains' | 'regex' | 'in' | 'not_in';
}

export interface SecurityViolation {
  id: string;
  type: 'authentication_failure' | 'authorization_denied' | 'input_validation_failed' | 'suspicious_activity' | 'rate_limit_exceeded';
  severity: 'low' | 'medium' | 'high' | 'critical';
  
  // Contexto del incidente
  userId?: string;
  username?: string;
  channel?: string;
  command?: string;
  ipAddress?: string;
  
  // Detalles del incidente
  description: string;
  details: Record<string, any>;
  ruleId?: string;
  timestamp: Date;
  
  // Estado del incidente
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  assignedTo?: string;
  resolvedAt?: Date;
  resolution?: string;
  
  // Metadatos
  metadata?: Record<string, any>;
}

export interface SecurityAuditLog {
  id: string;
  eventType: string;
  userId: string;
  username: string;
  channel: string;
  command?: string;
  
  // Detalles del evento
  action: string;
  resource: string;
  result: 'success' | 'failure' | 'partial';
  details: Record<string, any>;
  
  // Contexto de seguridad
  securityContext: SecurityContext;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  
  // Metadatos del sistema
  timestamp: Date;
  sessionId: string;
  ipAddress?: string;
  userAgent?: string;
  geolocation?: string;
  
  metadata?: Record<string, any>;
}

export interface InputValidationRule {
  id: string;
  name: string;
  field: string; // Campo a validar
  type: 'string' | 'number' | 'email' | 'url' | 'custom';
  required: boolean;
  
  // Validaciones de string
  minLength?: number;
  maxLength?: number;
  pattern?: string; // Regex
  allowedValues?: string[];
  blacklistedValues?: string[];
  
  // Validaciones de número
  min?: number;
  max?: number;
  
  // Validaciones personalizadas
  customValidator?: string; // Nombre de función validadora
  
  // Sanitización
  sanitize: boolean;
  sanitizationRules?: string[];
  
  // Configuración de error
  errorMessage?: string;
  logViolations: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface EncryptionConfig {
  algorithm: 'aes-256-gcm' | 'aes-256-cbc';
  keyDerivation: 'pbkdf2' | 'scrypt';
  keyLength: number;
  ivLength: number;
  tagLength?: number; // Para GCM
  iterations?: number; // Para PBKDF2
  
  // Rotación de claves
  keyRotationInterval: number; // días
  maxKeyAge: number; // días
  autoRotate: boolean;
}

export interface EncryptedData {
  algorithm: string;
  iv: string; // Base64
  tag?: string; // Base64, para GCM
  data: string; // Base64
  keyId: string;
  timestamp: Date;
}

export interface SecurityConfiguration {
  // Autenticación
  authentication: {
    enabled: boolean;
    tokenExpiry: number; // segundos
    maxFailedAttempts: number;
    lockoutDuration: number; // segundos
    requireStrongPasswords: boolean;
    twoFactorAuth: boolean;
  };
  
  // Autorización
  authorization: {
    enabled: boolean;
    defaultRole: string;
    inheritanceEnabled: boolean;
    cachePermissions: boolean;
    cacheTTL: number; // segundos
  };
  
  // Validación de entrada
  inputValidation: {
    enabled: boolean;
    strictMode: boolean;
    sanitizeInputs: boolean;
    maxInputLength: number;
    blacklistedPatterns: string[];
  };
  
  // Encriptación
  encryption: {
    enabled: boolean;
    algorithm: string;
    keyRotationInterval: number;
    encryptMetadata: boolean;
    encryptLogs: boolean;
  };
  
  // Auditoría
  auditing: {
    enabled: boolean;
    logAllEvents: boolean;
    retentionDays: number;
    sensitiveFields: string[];
    exportFormat: 'json' | 'csv' | 'xml';
  };
  
  // Alertas
  alerting: {
    enabled: boolean;
    realTimeAlerts: boolean;
    alertChannels: string[];
    escalationRules: EscalationRule[];
  };
}

export interface EscalationRule {
  id: string;
  name: string;
  condition: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  actions: EscalationAction[];
  cooldown: number; // segundos
}

export interface EscalationAction {
  type: 'notify' | 'block_user' | 'block_channel' | 'alert_admin' | 'webhook';
  target: string;
  message?: string;
  parameters?: Record<string, any>;
}

// Headers de seguridad estándar
export const SECURITY_HEADERS = {
  CONTENT_SECURITY_POLICY: 'Content-Security-Policy',
  X_FRAME_OPTIONS: 'X-Frame-Options',
  X_CONTENT_TYPE_OPTIONS: 'X-Content-Type-Options',
  X_XSS_PROTECTION: 'X-XSS-Protection',
  STRICT_TRANSPORT_SECURITY: 'Strict-Transport-Security',
  REFERRER_POLICY: 'Referrer-Policy'
} as const;

// Configuraciones predefinidas de seguridad
export const DEFAULT_SECURITY_CONFIG: SecurityConfiguration = {
  authentication: {
    enabled: true,
    tokenExpiry: 3600, // 1 hora
    maxFailedAttempts: 5,
    lockoutDuration: 900, // 15 minutos
    requireStrongPasswords: true,
    twoFactorAuth: false
  },
  authorization: {
    enabled: true,
    defaultRole: 'user',
    inheritanceEnabled: true,
    cachePermissions: true,
    cacheTTL: 300 // 5 minutos
  },
  inputValidation: {
    enabled: true,
    strictMode: true,
    sanitizeInputs: true,
    maxInputLength: 10000,
    blacklistedPatterns: [
      '<script[^>]*>.*?</script>',
      'javascript:',
      'data:text/html',
      'vbscript:',
      'onload=',
      'onerror='
    ]
  },
  encryption: {
    enabled: true,
    algorithm: 'aes-256-gcm',
    keyRotationInterval: 30, // 30 días
    encryptMetadata: true,
    encryptLogs: false
  },
  auditing: {
    enabled: true,
    logAllEvents: false,
    retentionDays: 90,
    sensitiveFields: ['password', 'token', 'apiKey', 'secret'],
    exportFormat: 'json'
  },
  alerting: {
    enabled: true,
    realTimeAlerts: true,
    alertChannels: [],
    escalationRules: []
  }
}; 