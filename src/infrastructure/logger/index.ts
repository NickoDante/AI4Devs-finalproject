import winston, { Logger, format } from 'winston';
import defaultLogger from '../logging/Logger';

/**
 * Función que crea un logger específico para un módulo o componente
 * @param moduleName Nombre del módulo o componente que utilizará el logger
 * @returns Una instancia configurada de Winston Logger
 */
export function createLogger(moduleName: string): Logger {
  // Formato de consola con colores similar al default pero con el nombre del módulo
  const consoleFormat = format.combine(
    format.colorize(),
    format.timestamp({ format: 'HH:mm:ss' }),
    format.printf(({ level, message, timestamp, ...metadata }) => {
      let msg = `${timestamp} [${level}] [${moduleName}]: ${message}`;
      
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

  // Crear un nuevo logger con la configuración específica para el módulo
  return winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: format.json(),
    defaultMeta: { 
      service: 'theguardian',
      module: moduleName 
    },
    transports: [
      // Solo transporte a consola para loggers de módulos específicos
      new winston.transports.Console({
        format: consoleFormat
      })
    ]
  });
}

// Exportar el logger por defecto para compatibilidad
export default defaultLogger; 