import winston from 'winston';
import path from 'path';

const { createLogger, format, transports } = winston;
const { combine, timestamp, printf } = format;

export class Logger {
    private static instance: Logger;
    private logger: winston.Logger;

    private constructor() {
        const logDir = 'logs';
        const errorLog = path.join(logDir, 'error.log');
        const combinedLog = path.join(logDir, 'combined.log');

        // Formato personalizado para los logs
        const customFormat = printf((info: winston.Logform.TransformableInfo) => {
            return `${info.timestamp} [${info.level}]: ${info.message}${info.stack ? '\n' + info.stack : ''}`;
        });

        this.logger = createLogger({
            level: 'info',
            format: combine(
                timestamp(),
                customFormat
            ),
            transports: [
                new transports.File({ filename: errorLog, level: 'error' }),
                new transports.File({ filename: combinedLog }),
                new transports.Console({
                    format: combine(
                        format.colorize(),
                        customFormat
                    )
                })
            ]
        });
    }

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    // Métodos básicos de logging
    public info(message: string, meta?: any): void {
        this.logger.info(message, meta);
    }

    public error(message: string, error?: Error): void {
        if (error) {
            this.logger.error(message, { stack: error.stack });
        } else {
            this.logger.error(message);
        }
    }

    public warn(message: string, meta?: any): void {
        this.logger.warn(message, meta);
    }

    public debug(message: string, meta?: any): void {
        this.logger.debug(message, meta);
    }

    // Métodos especializados
    public logPerformance(operation: string, duration: number): void {
        this.info(`Performance - ${operation}: ${duration}ms`);
    }

    public logSecurity(event: string, details: any): void {
        this.info(`Security - ${event}`, details);
    }

    public logAccess(userId: string, action: string): void {
        this.info(`Access - User: ${userId}, Action: ${action}`);
    }
} 