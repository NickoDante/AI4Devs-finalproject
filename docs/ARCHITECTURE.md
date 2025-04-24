# Arquitectura de TG-TheGuardian

Este documento describe la arquitectura y estructura del proyecto TG-TheGuardian.

## Visión general

TG-TheGuardian sigue una arquitectura hexagonal (también conocida como "Ports and Adapters") que proporciona un diseño modular y de alta cohesión, facilitando el mantenimiento y las pruebas del sistema.

## Estructura de directorios

```
src/
├── domain/           # Capa de dominio (modelos y puertos)
│   ├── models/       # Entidades y objetos de valor
│   └── ports/        # Interfaces que definen las operaciones
├── application/      # Capa de aplicación (casos de uso)
│   └── use-cases/    # Implementación de la lógica de negocio
│       ├── message/      # Casos de uso relacionados con mensajes
│       ├── conversation/ # Casos de uso para gestión de conversaciones
│       └── knowledge/    # Casos de uso relacionados con conocimiento
├── adapters/         # Implementaciones concretas de los puertos
│   ├── auth/         # Adaptadores de autenticación
│   ├── cache/        # Adaptadores para caché (Redis)
│   ├── confluence/   # Adaptadores para Confluence
│   ├── llm/          # Adaptadores para modelos de lenguaje
│   ├── persistence/  # Adaptadores de persistencia (MongoDB)
│   └── slack/        # Adaptadores para Slack
├── infrastructure/   # Componentes técnicos y configuración
│   ├── cache/        # Configuración de caché
│   ├── di/           # Inyección de dependencias
│   ├── errors/       # Manejo de errores
│   ├── logging/      # Configuración de logs
│   └── middleware/   # Middlewares de la aplicación
├── config/           # Configuraciones de la aplicación
├── tests/            # Pruebas unitarias e integración
│   ├── integration/  # Pruebas de integración
│   └── mocks/        # Objetos mock para pruebas
└── index.ts          # Punto de entrada de la aplicación
```

## Arquitectura Hexagonal (Ports & Adapters)

### Capa de Dominio

La capa de dominio contiene:
- **Modelos**: Entidades y objetos de valor que representan el dominio de negocio.
- **Puertos**: Interfaces que definen cómo la aplicación se comunica con el exterior.

Ejemplos de puertos:
- `MessagePort`: Para envío y recepción de mensajes
- `PersistencePort`: Para almacenamiento y recuperación de datos
- `CachePort`: Para operaciones de caché
- `KnowledgePort`: Para búsqueda y recuperación de conocimiento

### Capa de Aplicación

La capa de aplicación contiene casos de uso que implementan la lógica de negocio. Estos casos de uso:
- Coordinan entre diferentes puertos
- Implementan reglas de negocio
- No tienen dependencias directas con infraestructura

Ejemplos de casos de uso:
- `ProcessMessageUseCase`: Procesa mensajes entrantes
- `ManageConversationContextUseCase`: Gestiona el contexto de conversaciones
- `ManageKnowledgeUseCase`: Gestiona el acceso al conocimiento

### Adaptadores

Los adaptadores son implementaciones concretas de los puertos que conectan con servicios externos:
- `SlackAdapter`: Implementa `MessagePort` para integración con Slack
- `MongoDBAdapter`: Implementa `PersistencePort` para persistencia en MongoDB
- `RedisAdapter`: Implementa `CachePort` para caché con Redis
- `OpenAIAdapter`: Implementa `AIAdapter` para integración con OpenAI

### Infraestructura

La capa de infraestructura proporciona servicios técnicos como:
- **Logging**: Configuración centralizada de logs
- **Error Handling**: Manejo uniforme de errores
- **Dependency Injection**: Inyección de dependencias
- **Middleware**: Interceptores para procesamiento de peticiones

## Flujo de datos

1. El usuario envía un mensaje a través de Slack
2. `SlackAdapter` recibe el mensaje y lo convierte al formato interno
3. `ProcessMessageUseCase` procesa el mensaje utilizando:
   - `MongoDBAdapter` para persistencia
   - `RedisAdapter` para caché
   - `OpenAIAdapter` para procesamiento de lenguaje natural
4. Se construye una respuesta y se envía de vuelta al usuario

## Patrones de diseño utilizados

- **Singleton**: Para gestionar instancias únicas (logger, contenedor DI)
- **Adapter**: Para adaptar interfaces externas a los puertos internos
- **Factory**: Para crear conexiones (RedisConnectionFactory)
- **Repository**: Para acceso a datos a través de PersistencePort
- **Strategy**: Para diferentes implementaciones de procesamiento de mensajes

## Gestión de errores

El sistema implementa un manejo centralizado de errores con:
- Jerarquía de excepciones basada en `BaseError`
- Middleware para captura de errores no manejados
- Formato consistente de errores para clientes
- Logging detallado para diagnóstico

## Logging

El sistema utiliza Winston como biblioteca de logging con:
- Niveles configurables (ERROR, WARN, INFO, DEBUG)
- Rotación de archivos de log
- Formato para desarrollo y producción
- Captura de metadatos y stack traces

## Inyección de dependencias

Se utiliza un contenedor de DI personalizado que:
- Inicializa componentes en el orden correcto
- Gestiona el ciclo de vida de los servicios
- Proporciona acceso a las implementaciones a través de getters
- Facilita las pruebas mediante la sustitución de dependencias 