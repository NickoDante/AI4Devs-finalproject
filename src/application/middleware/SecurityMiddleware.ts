import { Logger } from 'winston';
import { Message } from '../../domain/models/Message';
import { SecurityContext, AuthenticationResult, AuthorizationResult } from '../../domain/models/Security';
import { TGSecurityService } from '../services/SecurityService';
import { MetricsCollectorService } from '../services/MetricsCollectorService';

export interface SecurityMiddlewareConfig {
  enableAuthentication: boolean;
  enableAuthorization: boolean;
  enableInputValidation: boolean;
  enableAuditLogging: boolean;
  bypassUsers?: string[];
  bypassChannels?: string[];
}

export class SecurityMiddleware {
  private config: SecurityMiddlewareConfig = {
    enableAuthentication: true,
    enableAuthorization: true,
    enableInputValidation: true,
    enableAuditLogging: true,
    bypassUsers: ['system', 'bot'],
    bypassChannels: ['admin', 'security']
  };

  constructor(
    private readonly securityService: TGSecurityService,
    private readonly metricsCollector: MetricsCollectorService,
    private readonly logger: Logger
  ) {}

  async beforeCommand(message: Message): Promise<{ allowed: boolean; reason?: string; sanitizedMessage?: Message }> {
    try {
      const startTime = Date.now();
      
      // Crear contexto de seguridad
      const securityContext = this.securityService.createSecurityContext(message);
      
      // Verificar bypass
      if (this.shouldBypass(message)) {
        this.logger.debug('Security check bypassed for user/channel:', {
          userId: message.userId,
          channel: message.channel
        });
        return { allowed: true, sanitizedMessage: message };
      }

      // 1. Validación de entrada
      if (this.config.enableInputValidation) {
        const validationResult = await this.securityService.validateMessage(message);
        if (!validationResult.valid) {
          await this.logSecurityEvent('input_validation_failed', message, securityContext, {
            errors: validationResult.errors,
            riskLevel: validationResult.riskLevel
          });
          
          return {
            allowed: false,
            reason: `Input validation failed: ${validationResult.errors.map(e => e.message).join(', ')}`
          };
        }
        
        // Usar mensaje sanitizado si está disponible
        if (validationResult.sanitized) {
          message = validationResult.sanitized as Message;
        }
      }

      // 2. Autenticación (simulada para Slack)
      if (this.config.enableAuthentication) {
        const authResult = await this.authenticateUser(message);
        if (!authResult.authenticated) {
          await this.logSecurityEvent('authentication_failed', message, securityContext, {
            reason: authResult.reason
          });
          
          return {
            allowed: false,
            reason: `Authentication failed: ${authResult.reason}`
          };
        }
      }

      // 3. Autorización
      if (this.config.enableAuthorization) {
        const command = this.extractCommand(message.content);
        const permission = this.getRequiredPermission(command);
        
        if (permission) {
          const authzResult = await this.securityService.hasPermission(securityContext, permission);
          if (!authzResult.authorized) {
            await this.logSecurityEvent('authorization_denied', message, securityContext, {
              permission,
              reason: authzResult.reason
            });
            
            return {
              allowed: false,
              reason: `Authorization denied: ${authzResult.reason}`
            };
          }
        }
      }

      // 4. Logging de auditoría
      if (this.config.enableAuditLogging) {
        await this.securityService.logCommand(message, 'success', securityContext);
      }

      // Registrar métricas de seguridad
      const duration = Date.now() - startTime;
      await this.metricsCollector.recordUsage({
        event: 'security_check_completed',
        userId: message.userId,
        channel: message.channel,
        properties: {
          duration,
          success: true,
          validationEnabled: this.config.enableInputValidation,
          authenticationEnabled: this.config.enableAuthentication,
          authorizationEnabled: this.config.enableAuthorization
        }
      });

      return { allowed: true, sanitizedMessage: message };
    } catch (error) {
      this.logger.error('Error in security middleware:', error);
      
      await this.metricsCollector.recordError({
        errorType: 'security_middleware_error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // En caso de error, permitir por defecto pero registrar
      return { allowed: true, sanitizedMessage: message };
    }
  }

  async afterCommand(message: Message, result: 'success' | 'failure', error?: Error): Promise<void> {
    try {
      const securityContext = this.securityService.createSecurityContext(message);
      
      if (this.config.enableAuditLogging) {
        await this.securityService.logCommand(message, result, securityContext);
        
        if (result === 'failure' && error) {
          await this.logSecurityEvent('command_execution_failed', message, securityContext, {
            error: error.message,
            stack: error.stack
          });
        }
      }
    } catch (auditError) {
      this.logger.error('Error in security audit logging:', auditError);
    }
  }

  private shouldBypass(message: Message): boolean {
    const bypassUser = this.config.bypassUsers?.includes(message.userId) || false;
    const bypassChannel = this.config.bypassChannels?.includes(message.channel) || false;
    return bypassUser || bypassChannel;
  }

  private async authenticateUser(message: Message): Promise<AuthenticationResult> {
    // Para Slack, simulamos autenticación basada en el formato del userId
    if (message.userId.startsWith('U') && message.userId.length === 11) {
      return {
        authenticated: true,
        userId: message.userId,
        username: message.username,
        roles: ['user']
      };
    }
    
    return {
      authenticated: false,
      reason: 'invalid_slack_user_id'
    };
  }

  private extractCommand(content: string): string {
    const parts = content.trim().split(' ');
    return parts[0].toLowerCase();
  }

  private getRequiredPermission(command: string): string | null {
    const commandPermissions: Record<string, string> = {
      'search': 'command.search',
      'question': 'command.question',
      'summary': 'command.summary',
      'feedback': 'command.feedback',
      'help': 'command.help',
      'admin': 'system.admin',
      'metrics': 'metrics.view',
      'security': 'security.manage'
    };
    
    return commandPermissions[command] || null;
  }

  private async logSecurityEvent(
    eventType: string,
    message: Message,
    context: SecurityContext,
    details: Record<string, any>
  ): Promise<void> {
    await this.securityService.logEvent({
      eventType,
      userId: message.userId,
      username: message.username,
      channel: message.channel,
      action: 'security_check',
      resource: message.content.split(' ')[0],
      result: 'failure',
      details,
      riskLevel: this.determineRiskLevel(eventType, details)
    });
  }

  private determineRiskLevel(eventType: string, details: Record<string, any>): 'low' | 'medium' | 'high' | 'critical' {
    switch (eventType) {
      case 'input_validation_failed':
        return details.riskLevel || 'medium';
      case 'authentication_failed':
        return 'high';
      case 'authorization_denied':
        return 'medium';
      case 'command_execution_failed':
        return 'low';
      default:
        return 'medium';
    }
  }

  configure(config: Partial<SecurityMiddlewareConfig>): void {
    this.config = { ...this.config, ...config };
    this.logger.info('Security middleware configured:', this.config);
  }

  getConfiguration(): SecurityMiddlewareConfig {
    return { ...this.config };
  }
}

// Decorator para aplicar automáticamente el middleware de seguridad
export function withSecurity(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;

  descriptor.value = async function (this: any, ...args: any[]) {
    const securityMiddleware = this.securityMiddleware as SecurityMiddleware;
    
    if (!securityMiddleware) {
      console.warn('Security middleware not found, executing without security checks');
      return method.apply(this, args);
    }

    // Asumir que el primer argumento es el mensaje
    const message = args[0] as Message;
    
    if (!message || !message.userId) {
      console.warn('Invalid message format for security check');
      return method.apply(this, args);
    }

    const securityResult = await securityMiddleware.beforeCommand(message);
    
    if (!securityResult.allowed) {
      throw new Error(securityResult.reason || 'Security check failed');
    }

    // Usar mensaje sanitizado si está disponible
    if (securityResult.sanitizedMessage) {
      args[0] = securityResult.sanitizedMessage;
    }

    try {
      const result = await method.apply(this, args);
      await securityMiddleware.afterCommand(message, 'success');
      return result;
    } catch (error) {
      await securityMiddleware.afterCommand(message, 'failure', error as Error);
      throw error;
    }
  };

  return descriptor;
} 