import winston, { Logger, format } from 'winston';

// Formato personalizado con timestamp y colores
const customFormat = format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
);

// Formato de consola con colores
const consoleFormat = format.combine(
    format.colorize(),
    format.timestamp({ format: 'HH:mm:ss' }),
    format.printf(({ level, message, timestamp, ...metadata }) => {
        let msg = `${timestamp} [${level}]: ${message}`;
        
        // Agregar metadata si existe
        if (Object.keys(metadata).length > 0 && metadata.stack === undefined) {
            msg += ` ${JSON.stringify(metadata)}`;
        }
        
        // Agregar stack trace para errores
        if (metadata.stack) {
            msg += `\n${metadata.stack}`;
        }
        
        return msg;
    })
);

// Crear el logger con múltiples transportes
const logger: Logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: customFormat,
    defaultMeta: { service: 'theguardian' },
    transports: [
        // Consola con formato amigable
        new winston.transports.Console({
            format: consoleFormat
        }),
        
        // Archivo para todos los logs (combinado)
        new winston.transports.File({
            filename: 'logs/combined.log',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        
        // Archivo específico para errores
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        
        // Archivo específico para logs críticos con rotación diaria
        new winston.transports.File({
            filename: `logs/critical-${new Date().toISOString().split('T')[0]}.log`,
            level: 'error',
            maxsize: 1048576 // 1MB
        })
    ]
});

// Asegurar que los logs críticos se envíen inmediatamente
if (process.env.NODE_ENV === 'production') {
    logger.exitOnError = false; // No salir en producción por errores en el logger
} else {
    // En desarrollo, mostrar solo en consola si así se configura
    if (process.env.CONSOLE_ONLY === 'true') {
        logger.clear(); // Eliminar transportes existentes
        logger.add(new winston.transports.Console({
            format: consoleFormat
        }));
    }
}

export default logger; 