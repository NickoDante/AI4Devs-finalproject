# Configuración de TG-TheGuardian

Este documento detalla todas las opciones de configuración disponibles para TG-TheGuardian.

## Variables de entorno

TG-TheGuardian utiliza archivos `.env` para la configuración. Existen varias variantes:
- `.env`: Configuración principal, usada en producción
- `.env.local`: Configuración para desarrollo local
- `.env.example`: Plantilla con ejemplos de configuración

### Variables del servidor

| Variable    | Descripción                                 | Valor por defecto | Obligatorio |
|-------------|---------------------------------------------|-------------------|-------------|
| PORT        | Puerto en el que se ejecuta la aplicación   | 3000              | No          |
| NODE_ENV    | Entorno de ejecución                        | development       | No          |
| LOG_LEVEL   | Nivel de detalle de los logs                | info              | No          |

### Configuración de MongoDB

| Variable    | Descripción                                 | Valor por defecto | Obligatorio |
|-------------|---------------------------------------------|-------------------|-------------|
| MONGODB_URI | URI de conexión a MongoDB                   | mongodb://localhost:27017/tg-guardian | No |

### Configuración de Redis

| Variable    | Descripción                                 | Valor por defecto | Obligatorio |
|-------------|---------------------------------------------|-------------------|-------------|
| REDIS_HOST  | Host del servidor Redis                     | localhost         | No          |
| REDIS_PORT  | Puerto del servidor Redis                   | 6379              | No          |
| REDIS_PASSWORD | Contraseña de Redis (si está configurada) | -                 | No          |
| REDIS_DB    | Base de datos de Redis a utilizar           | 0                 | No          |

### Configuración de Slack

| Variable           | Descripción                                      | Valor por defecto | Obligatorio |
|--------------------|--------------------------------------------------|-------------------|-------------|
| SLACK_BOT_TOKEN    | Token del bot de Slack                           | -                 | Sí          |
| SLACK_SIGNING_SECRET | Secreto de firma para verificación de peticiones | -                 | Sí          |
| SLACK_APP_TOKEN    | Token de la aplicación de Slack                  | -                 | Sí          |

### Configuración de OpenAI

| Variable        | Descripción                                 | Valor por defecto | Obligatorio |
|-----------------|---------------------------------------------|-------------------|-------------|
| OPENAI_API_KEY  | Clave API para acceder a servicios de OpenAI | -                 | No          |
| OPENAI_MODEL    | Modelo de OpenAI a utilizar                 | gpt-3.5-turbo     | No          |

### Configuración de Confluence

| Variable               | Descripción                                      | Valor por defecto | Obligatorio |
|------------------------|--------------------------------------------------|-------------------|-------------|
| CONFLUENCE_HOST        | URL del host de Confluence                       | -                 | No          |
| CONFLUENCE_USERNAME    | Usuario para autenticación en Confluence         | -                 | No          |
| CONFLUENCE_API_TOKEN   | Token API para autenticación en Confluence       | -                 | No          |
| CONFLUENCE_SPACE_KEY   | Clave del espacio de Confluence a utilizar       | -                 | No          |

## Configuración de logging

El sistema utiliza Winston para el logging, con la siguiente configuración:

- **Niveles de log**: ERROR, WARN, INFO, DEBUG
- **Formatos**: JSON para archivos, texto colorizado para consola
- **Archivos de log**:
  - `logs/combined.log`: Todos los logs
  - `logs/error.log`: Solo errores
  - `logs/critical-{date}.log`: Logs críticos con rotación diaria

Esta configuración se puede ajustar en `src/infrastructure/logging/Logger.ts`.

## Configuración de Docker

Para entornos Docker, se utilizan las siguientes configuraciones:

- **Dockerfile**: Define la imagen para la aplicación
- **docker-compose.yml**: Define los servicios y volúmenes

### Servicios definidos

- **app**: Aplicación Node.js
- **mongodb**: Base de datos MongoDB
- **redis**: Servidor Redis

### Volúmenes persistentes

- **mongodb_data**: Almacena datos de MongoDB
- **redis_data**: Almacena datos de Redis

## Configuración de Jest para pruebas

La configuración de pruebas se encuentra en `jest.config.js`:

- **Entorno**: Node.js
- **Raíces de prueba**: `<rootDir>/src`
- **Patrones de archivos**: `**/__tests__/**/*.ts`, `**/?(*.)+(spec|test).ts`
- **Transformadores**: TypeScript a través de ts-jest
- **Configuración adicional**: `src/tests/setup.ts`

## Scripts disponibles

Los scripts de utilidad para el proyecto se encuentran en la carpeta `scripts/`:

- **dev.ps1/dev.sh**: Iniciar en modo desarrollo
- **build.ps1/build.sh**: Construir para producción
- **test.ps1/test.sh**: Ejecutar pruebas

## Archivo de configuración central

El archivo `src/config/app.config.ts` centraliza todas las configuraciones de la aplicación y proporciona validación.

### Estructura

```typescript
export interface AppConfig {
  // MongoDB
  mongoDbUri: string;
  
  // Redis
  redis: RedisConfig;
  
  // OpenAI
  openAiApiKey?: string;
  
  // Slack
  slackPort: number;
  slack: typeof slackConfig;
  
  // Logging
  logLevel: string;
}
```

### Función de validación

La función `validateConfig()` verifica que todas las configuraciones necesarias estén presentes y sean válidas. 