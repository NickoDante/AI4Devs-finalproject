# Guía de Desarrollo para TG-TheGuardian

Esta guía proporciona información para desarrolladores que deseen contribuir al proyecto TG-TheGuardian.

## Entorno de desarrollo

### Requisitos

- Node.js 18.x o superior
- MongoDB 6.0 o superior
- Redis 6.0 o superior
- Git
- Editor de código (recomendado: VS Code)

### Configuración inicial

1. Clonar el repositorio:
```bash
git clone https://github.com/NickoDante/AI4Devs-finalproject.git
cd AI4Devs-finalproject
```

2. Crear archivo de configuración local:
```bash
cp .env.example .env.local
```

3. Instalar dependencias:
```bash
npm install
```

4. Iniciar el proyecto en modo desarrollo:
```bash
npm run dev:script
```

## Flujo de trabajo de desarrollo

### Ciclo de desarrollo

1. **Iniciar servicios** (MongoDB y Redis)
   - En Windows: Usar `TG-Guardian_SlackBot_Test(Local-StartServices).bat`
   - En Linux/macOS: Iniciar manualmente o con Docker

2. **Iniciar la aplicación**
   - Usar `npm run dev:local` para desarrollo
   - Los cambios en el código se recargarán automáticamente

3. **Ejecutar pruebas**
   - Pruebas unitarias: `npm run test:unit`
   - Pruebas de integración: `npm run test:integration`
   - Pruebas con cobertura: `npm run test:coverage`

### Estructura de ramas

- **main**: Rama principal, solo para código estable
- **develop**: Rama de desarrollo activo
- **feature/xxx**: Ramas para nuevas características
- **bugfix/xxx**: Ramas para corrección de errores
- **release/xxx**: Ramas para preparación de versiones

## Estándares de código

TG-TheGuardian sigue estándares de código específicos para mantener la calidad y coherencia:

### TypeScript

- Usar tipos explícitos siempre que sea posible
- Evitar el uso de `any` cuando se pueda usar un tipo más específico
- Utilizar interfaces para modelos y tipos de datos

### Estilo de código

Este proyecto utiliza ESLint y Prettier para mantener un estilo de código coherente:

- Ejecutar `npm run lint` para verificar el estilo
- Ejecutar `npm run lint:fix` para corregir automáticamente problemas de estilo

### Convenciones de nombres

- **Archivos**: Usar formato PascalCase para clases y kebab-case para otros archivos
- **Clases**: PascalCase (ej. `SlackAdapter`)
- **Interfaces**: PascalCase (ej. `MessagePort`)
- **Métodos y variables**: camelCase (ej. `processMessage`)
- **Constantes**: UPPER_SNAKE_CASE (ej. `DEFAULT_TTL`)

## Cómo añadir nuevas características

### 1. Actualizar o crear modelos

Si la nueva característica requiere nuevos modelos, añádelos en `src/domain/models/`.

### 2. Definir puertos

Si la característica necesita integración con servicios externos, define un puerto en `src/domain/ports/`.

### 3. Implementar casos de uso

Crea un nuevo caso de uso en `src/application/use-cases/` dentro de la categoría adecuada (mensaje, conversación, conocimiento).

### 4. Implementar adaptadores

Si has definido un nuevo puerto, crea el adaptador correspondiente en `src/adapters/`.

### 5. Actualizar inyección de dependencias

Actualiza `src/infrastructure/di/index.ts` para registrar los nuevos componentes.

### 6. Escribir pruebas

Añade pruebas unitarias para tus nuevos componentes y pruebas de integración si es necesario.

## Arquitectura

Este proyecto sigue una arquitectura hexagonal. Consulta el archivo `ARCHITECTURE.md` para más detalles.

## Manejo de errores

### Principios generales

- Usar excepciones específicas en lugar de errores genéricos
- Registrar siempre los errores con información contextual
- Manejar adecuadamente las excepciones en los límites de la aplicación

### Jerarquía de errores

- `BaseError`: Clase base para todos los errores de la aplicación
- Errores específicos para cada dominio (ej. `ValidationError`, `AuthenticationError`)

### Ejemplo de manejo de errores

```typescript
try {
  // Código que puede lanzar una excepción
} catch (error) {
  if (error instanceof ValidationError) {
    // Manejo específico para errores de validación
    logger.warn('Error de validación:', error);
  } else {
    // Manejo genérico para otros errores
    logger.error('Error inesperado:', error);
    throw new InternalServerError('Ocurrió un error inesperado', { cause: error });
  }
}
```

## Logging

Usa el logger centralizado para registrar información:

```typescript
import logger from '../../infrastructure/logging/Logger';

// Niveles de log disponibles
logger.error('Mensaje de error crítico');
logger.warn('Advertencia importante');
logger.info('Información general');
logger.debug('Información detallada para depuración');

// Logging con metadatos
logger.info('Operación completada', { 
  userId: '123', 
  operation: 'update',
  duration: 250
});
```

## Recursos adicionales

- [Documentación de TypeScript](https://www.typescriptlang.org/docs/)
- [Documentación de Jest](https://jestjs.io/docs/getting-started)
- [Arquitectura Hexagonal](https://alistair.cockburn.us/hexagonal-architecture/)
- [Documentación de Slack API](https://api.slack.com/docs)
- [Documentación de MongoDB Node.js Driver](https://mongodb.github.io/node-mongodb-native/) 