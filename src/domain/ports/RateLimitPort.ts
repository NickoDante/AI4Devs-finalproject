import { 
  RateLimitRule, 
  RateLimitEntry, 
  RateLimitResult, 
  RateLimitViolation,
  RateLimitScope,
  RateLimitTarget 
} from '../models/RateLimit';

export interface RateLimitPort {
  // Gestión de reglas
  createRule(rule: RateLimitRule): Promise<RateLimitRule>;
  updateRule(ruleId: string, updates: Partial<RateLimitRule>): Promise<RateLimitRule | null>;
  deleteRule(ruleId: string): Promise<boolean>;
  getRule(ruleId: string): Promise<RateLimitRule | null>;
  getRules(enabled?: boolean): Promise<RateLimitRule[]>;
  
  // Verificación de límites
  checkLimit(request: RateLimitRequest): Promise<RateLimitResult>;
  incrementCounter(request: RateLimitRequest): Promise<RateLimitResult>;
  
  // Gestión de entradas
  getEntry(key: string, ruleId: string): Promise<RateLimitEntry | null>;
  createEntry(entry: RateLimitEntry): Promise<RateLimitEntry>;
  updateEntry(entryId: string, updates: Partial<RateLimitEntry>): Promise<RateLimitEntry | null>;
  deleteEntry(entryId: string): Promise<boolean>;
  
  // Violaciones
  recordViolation(violation: RateLimitViolation): Promise<void>;
  getViolations(filters?: ViolationFilter): Promise<RateLimitViolation[]>;
  
  // Utilidades
  resetLimit(key: string, ruleId?: string): Promise<void>;
  cleanupExpiredEntries(): Promise<number>;
  getStatistics(): Promise<RateLimitStatistics>;
  healthCheck(): Promise<boolean>;
}

export interface RateLimitRequest {
  userId?: string;
  channel?: string;
  command?: string;
  ip?: string;
  metadata?: Record<string, any>;
  skipRules?: string[];  // IDs de reglas a omitir
}

export interface ViolationFilter {
  ruleId?: string;
  userId?: string;
  channel?: string;
  command?: string;
  startTime?: Date;
  endTime?: Date;
  limit?: number;
}

export interface RateLimitStatistics {
  totalRules: number;
  activeRules: number;
  totalEntries: number;
  totalViolations: number;
  topViolatedRules: Array<{ ruleId: string; count: number }>;
  topViolatingUsers: Array<{ userId: string; count: number }>;
  topViolatingChannels: Array<{ channel: string; count: number }>;
  recentViolations: RateLimitViolation[];
  memoryUsage?: {
    entries: number;
    violations: number;
    estimatedBytes: number;
  };
}

// Interfaz para el servicio de rate limiting
export interface RateLimitService {
  // Verificación principal
  isAllowed(request: RateLimitRequest): Promise<RateLimitResult>;
  
  // Operaciones de usuario
  getUserLimits(userId: string): Promise<RateLimitResult[]>;
  resetUserLimits(userId: string): Promise<void>;
  
  // Operaciones de canal
  getChannelLimits(channel: string): Promise<RateLimitResult[]>;
  resetChannelLimits(channel: string): Promise<void>;
  
  // Operaciones de comando
  getCommandLimits(command: string): Promise<RateLimitResult[]>;
  
  // Configuración
  configure(options: RateLimitServiceOptions): Promise<void>;
  getConfiguration(): RateLimitServiceOptions;
  
  // Gestión
  start(): Promise<void>;
  stop(): Promise<void>;
  status(): Promise<RateLimitServiceStatus>;
}

export interface RateLimitServiceOptions {
  enabled: boolean;
  defaultRules: boolean;
  whitelistedUsers: string[];
  whitelistedChannels: string[];
  emergencyMode: boolean;
  cleanupInterval: number;
  maxEntries: number;
  violationThreshold: number;  // Número de violaciones antes de alerta
  notificationChannels: string[];  // Canales donde notificar violaciones
}

export interface RateLimitServiceStatus {
  enabled: boolean;
  rulesLoaded: number;
  entriesActive: number;
  violationsRecent: number;
  memoryUsage: number;
  lastCleanup: Date;
  uptime: number;
}

// Interfaz para generadores de claves personalizados
export interface RateLimitKeyGenerator {
  generateKey(request: RateLimitRequest, rule: RateLimitRule): string;
}

// Interfaz para estrategias de rate limiting
export interface RateLimitStrategy {
  name: string;
  check(entry: RateLimitEntry, rule: RateLimitRule): Promise<RateLimitResult>;
  increment(entry: RateLimitEntry, rule: RateLimitRule): Promise<RateLimitEntry>;
  reset(entry: RateLimitEntry): Promise<RateLimitEntry>;
}

// Tipos de estrategias predefinidas
export type RateLimitStrategyType = 
  | 'fixed_window'      // Ventana fija
  | 'sliding_window'    // Ventana deslizante
  | 'token_bucket'      // Bucket de tokens
  | 'leaky_bucket';     // Bucket con fugas 