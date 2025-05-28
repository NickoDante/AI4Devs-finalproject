// Modelos de dominio para el sistema de rate limiting

export interface RateLimitRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  
  // Configuración del límite
  limit: number;           // Número máximo de requests
  windowMs: number;        // Ventana de tiempo en milisegundos
  
  // Criterios de aplicación
  scope: RateLimitScope;
  targets: RateLimitTarget[];
  
  // Configuración de comportamiento
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: string;   // Función personalizada para generar claves
  
  // Configuración de respuesta cuando se excede
  message?: string;
  statusCode?: number;
  headers?: Record<string, string>;
  
  // Metadatos
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  priority: number;        // Orden de aplicación (menor = mayor prioridad)
  tags?: string[];
}

export type RateLimitScope = 
  | 'global'           // Todo el sistema
  | 'user'             // Por usuario específico
  | 'channel'          // Por canal específico
  | 'command'          // Por tipo de comando
  | 'ip'               // Por dirección IP
  | 'user_command'     // Por usuario y comando
  | 'channel_command'  // Por canal y comando
  | 'custom';          // Criterio personalizado

export interface RateLimitTarget {
  type: 'user' | 'channel' | 'command' | 'ip' | 'pattern';
  value: string;
  operator?: 'equals' | 'contains' | 'regex' | 'in';
}

export interface RateLimitEntry {
  id: string;
  ruleId: string;
  key: string;           // Clave única que identifica el límite (ej: "user:123", "cmd:search")
  count: number;         // Número actual de requests
  resetTime: Date;       // Cuándo se reinicia el contador
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: Date;
  retryAfter?: number;   // Segundos hasta que pueda intentar de nuevo
  rule?: RateLimitRule;
  key: string;
}

export interface RateLimitViolation {
  id: string;
  ruleId: string;
  key: string;
  userId?: string;
  channel?: string;
  command?: string;
  ip?: string;
  timestamp: Date;
  attemptedCount: number;
  limit: number;
  windowMs: number;
  metadata?: Record<string, any>;
}

// Configuraciones predefinidas de rate limiting
export const DEFAULT_RATE_LIMITS = {
  // Límites globales
  GLOBAL_COMMANDS: {
    limit: 100,
    windowMs: 60 * 1000,    // 1 minuto
    scope: 'global' as RateLimitScope
  },
  
  // Límites por usuario
  USER_COMMANDS: {
    limit: 30,
    windowMs: 60 * 1000,    // 1 minuto
    scope: 'user' as RateLimitScope
  },
  
  // Límites por canal
  CHANNEL_COMMANDS: {
    limit: 50,
    windowMs: 60 * 1000,    // 1 minuto
    scope: 'channel' as RateLimitScope
  },
  
  // Límites específicos por comando
  SEARCH_COMMAND: {
    limit: 10,
    windowMs: 60 * 1000,    // 1 minuto
    scope: 'user_command' as RateLimitScope,
    targets: [{ type: 'command' as const, value: 'search' }]
  },
  
  QUESTION_COMMAND: {
    limit: 5,
    windowMs: 60 * 1000,    // 1 minuto
    scope: 'user_command' as RateLimitScope,
    targets: [{ type: 'command' as const, value: 'question' }]
  },
  
  SUMMARY_COMMAND: {
    limit: 3,
    windowMs: 60 * 1000,    // 1 minuto
    scope: 'user_command' as RateLimitScope,
    targets: [{ type: 'command' as const, value: 'summary' }]
  },
  
  FEEDBACK_COMMAND: {
    limit: 20,
    windowMs: 60 * 1000,    // 1 minuto
    scope: 'user_command' as RateLimitScope,
    targets: [{ type: 'command' as const, value: 'feedback' }]
  }
} as const;

// Configuración de rate limiting por entorno
export interface RateLimitConfig {
  enabled: boolean;
  defaultRules: boolean;           // Aplicar reglas por defecto
  customRules: RateLimitRule[];    // Reglas personalizadas
  whitelistedUsers: string[];      // Usuarios exentos
  whitelistedChannels: string[];   // Canales exentos
  emergencyMode: boolean;          // Modo de emergencia (límites más estrictos)
  cleanupInterval: number;         // Intervalo de limpieza en ms
  maxEntries: number;              // Máximo número de entradas a mantener
  storage: 'memory' | 'redis' | 'mongodb';
}

// Headers estándar para rate limiting
export const RATE_LIMIT_HEADERS = {
  LIMIT: 'X-RateLimit-Limit',
  REMAINING: 'X-RateLimit-Remaining', 
  RESET: 'X-RateLimit-Reset',
  RETRY_AFTER: 'Retry-After'
} as const; 