import { Logger } from 'winston';
import { TGRateLimitService } from '../services/RateLimitService';
import { MetricsCollectorService } from '../services/MetricsCollectorService';
import { Message } from '../../domain/models/Message';
import { RateLimitRequest } from '../../domain/ports/RateLimitPort';
import { RateLimitResult } from '../../domain/models/RateLimit';

export interface RateLimitMiddleware {
  checkRateLimit(message: Message): Promise<RateLimitCheckResult>;
}

export interface RateLimitCheckResult {
  allowed: boolean;
  result: RateLimitResult;
  message?: string;
  headers?: Record<string, string>;
}

export class TGRateLimitMiddleware implements RateLimitMiddleware {
  constructor(
    private readonly rateLimitService: TGRateLimitService,
    private readonly metricsCollector: MetricsCollectorService,
    private readonly logger: Logger
  ) {}

  async checkRateLimit(message: Message): Promise<RateLimitCheckResult> {
    try {
      // Construir request de rate limiting
      const request: RateLimitRequest = {
        userId: message.userId,
        channel: message.channel,
        command: this.extractCommandType(message),
        metadata: {
          messageId: message.timestamp?.getTime() || Date.now(),
          username: message.username,
          content: message.content.substring(0, 100), // Primeros 100 caracteres
          messageType: message.type
        }
      };

      // Verificar rate limit
      const result = await this.rateLimitService.isAllowed(request);

      // Construir respuesta
      const checkResult: RateLimitCheckResult = {
        allowed: result.allowed,
        result,
        headers: this.buildRateLimitHeaders(result)
      };

      if (!result.allowed) {
        checkResult.message = this.buildRateLimitMessage(result);
        
        // Registrar violación en métricas
        await this.metricsCollector.recordUsage({
          event: 'rate_limit_blocked',
          userId: message.userId,
          channel: message.channel,
          properties: {
            command: request.command,
            limit: result.limit,
            retryAfter: result.retryAfter
          }
        });

        this.logger.warn('Rate limit exceeded for user:', {
          userId: message.userId,
          channel: message.channel,
          command: request.command,
          limit: result.limit,
          remaining: result.remaining,
          retryAfter: result.retryAfter
        });
      } else {
        // Registrar uso permitido
        await this.metricsCollector.recordUsage({
          event: 'rate_limit_passed',
          userId: message.userId,
          channel: message.channel,
          properties: {
            command: request.command,
            remaining: result.remaining
          }
        });

        this.logger.debug('Rate limit check passed:', {
          userId: message.userId,
          command: request.command,
          remaining: result.remaining
        });
      }

      return checkResult;
    } catch (error) {
      this.logger.error('Error checking rate limit:', error);
      
      await this.metricsCollector.recordError({
        errorType: 'rate_limit_middleware_error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        userId: message.userId,
        channel: message.channel,
        severity: 'medium'
      });

      // En caso de error, permitir la operación
      return {
        allowed: true,
        result: {
          allowed: true,
          limit: Infinity,
          remaining: Infinity,
          resetTime: new Date(Date.now() + 86400000),
          key: 'error'
        }
      };
    }
  }

  private extractCommandType(message: Message): string {
    if (message.metadata?.command) {
      return message.metadata.command;
    }

    const content = message.content.trim().toLowerCase();
    
    if (content.startsWith('/tg-search')) return 'search';
    if (content.startsWith('/tg-question')) return 'question';
    if (content.startsWith('/tg-summary')) return 'summary';
    if (content.startsWith('/tg-feedback')) return 'feedback';
    if (content.startsWith('/tg-help')) return 'help';
    if (content.startsWith('/tg-metrics')) return 'metrics';
    
    return 'unknown';
  }

  private buildRateLimitHeaders(result: RateLimitResult): Record<string, string> {
    const headers: Record<string, string> = {
      'X-RateLimit-Limit': result.limit.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': Math.floor(result.resetTime.getTime() / 1000).toString()
    };

    if (result.retryAfter) {
      headers['Retry-After'] = result.retryAfter.toString();
    }

    if (result.rule) {
      headers['X-RateLimit-Rule'] = result.rule.name;
    }

    return headers;
  }

  private buildRateLimitMessage(result: RateLimitResult): string {
    const timeUntilReset = result.resetTime.getTime() - Date.now();
    const minutesUntilReset = Math.ceil(timeUntilReset / (60 * 1000));

    let message = `🚫 **Rate limit exceeded**\n\n`;
    message += `📊 **Limit:** ${result.limit} requests\n`;
    message += `⏰ **Reset in:** ${minutesUntilReset} minutes\n`;
    
    if (result.retryAfter) {
      message += `🔄 **Try again in:** ${result.retryAfter} seconds\n`;
    }

    if (result.rule) {
      message += `📋 **Rule:** ${result.rule.name}\n`;
      
      if (result.rule.message) {
        message += `\n💬 ${result.rule.message}`;
      }
    }

    message += `\n\n*Please wait before trying again.*`;

    return message;
  }
}

// Decorator para aplicar automáticamente rate limiting
export function withRateLimit<T extends any[], R>(
  rateLimitMiddleware: RateLimitMiddleware,
  logger: Logger
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<(...args: T) => Promise<R>>
  ) {
    const originalMethod = descriptor.value!;

    descriptor.value = async function (...args: T): Promise<R> {
      const message = args[0] as Message; // Asumimos que el primer argumento es Message
      
      try {
        // Verificar rate limit
        const rateLimitCheck = await rateLimitMiddleware.checkRateLimit(message);
        
        if (!rateLimitCheck.allowed) {
          // Crear respuesta de rate limit exceeded
          const rateLimitResponse = {
            content: rateLimitCheck.message || 'Rate limit exceeded',
            userId: message.userId,
            username: 'TG-TheGuardian',
            channel: message.channel,
            timestamp: new Date(),
            type: 'response' as const,
            metadata: {
              rateLimit: true,
              headers: rateLimitCheck.headers,
              originalCommand: message.content
            }
          };

          logger.warn('Command blocked by rate limit:', {
            userId: message.userId,
            command: message.content,
            limit: rateLimitCheck.result.limit,
            remaining: rateLimitCheck.result.remaining
          });

          return rateLimitResponse as R;
        }

        // Si está permitido, ejecutar el método original
        return await originalMethod.apply(this, args);
      } catch (error) {
        logger.error('Error in rate limit decorator:', error);
        // En caso de error, ejecutar el método original
        return await originalMethod.apply(this, args);
      }
    };

    return descriptor;
  };
}

// Factory para crear el middleware configurado
export function createRateLimitMiddleware(
  rateLimitService: TGRateLimitService,
  metricsCollector: MetricsCollectorService,
  logger: Logger
): TGRateLimitMiddleware {
  return new TGRateLimitMiddleware(rateLimitService, metricsCollector, logger);
}

// Clase helper para verificar rate limits en diferentes contextos
export class RateLimitHelper {
  constructor(
    private readonly rateLimitService: TGRateLimitService,
    private readonly logger: Logger
  ) {}

  async checkUserLimit(userId: string, command?: string): Promise<RateLimitResult> {
    return await this.rateLimitService.isAllowed({
      userId,
      command
    });
  }

  async checkChannelLimit(channel: string, command?: string): Promise<RateLimitResult> {
    return await this.rateLimitService.isAllowed({
      channel,
      command
    });
  }

  async checkGlobalLimit(command?: string): Promise<RateLimitResult> {
    return await this.rateLimitService.isAllowed({
      command
    });
  }

  async resetUserLimits(userId: string): Promise<void> {
    await this.rateLimitService.resetUserLimits(userId);
    this.logger.info('User rate limits reset:', { userId });
  }

  async resetChannelLimits(channel: string): Promise<void> {
    await this.rateLimitService.resetChannelLimits(channel);
    this.logger.info('Channel rate limits reset:', { channel });
  }

  async getUserStatus(userId: string): Promise<RateLimitResult[]> {
    return await this.rateLimitService.getUserLimits(userId);
  }

  async getChannelStatus(channel: string): Promise<RateLimitResult[]> {
    return await this.rateLimitService.getChannelLimits(channel);
  }

  async getServiceStatus() {
    return await this.rateLimitService.status();
  }
} 