import { Logger } from 'winston';

/**
 * Middleware para configurar manejadores de errores no capturados a nivel global
 */
export class UncaughtErrorMiddleware {
  constructor(private readonly logger: Logger) {
    this.setupHandlers();
  }

  private setupHandlers(): void {
    // Capturar excepciones no manejadas
    process.on('uncaughtException', (error) => {
      this.logger.error('Error no capturado:', {
        error: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // Log de detalles y esperar a que el log se escriba antes de finalizar
      this.logger.on('finish', () => {
        process.exit(1);
      });
      
      // Establecer un timeout para asegurar que se finalice incluso si el logger no termina
      setTimeout(() => {
        process.exit(1);
      }, 1000);
    });

    // Capturar promesas rechazadas no manejadas
    process.on('unhandledRejection', (reason, promise) => {
      this.logger.error('Promesa rechazada no manejada:', {
        reason: reason instanceof Error ? reason.message : reason,
        stack: reason instanceof Error ? reason.stack : null,
        promise
      });
    });
  }

  public initialize(): void {
    this.logger.info('Manejadores de errores no capturados configurados');
  }
} 