# Documentación de TG-TheGuardian

Bienvenido a la documentación de TG-TheGuardian, el chatbot corporativo para Teravision Games.

## Índice de documentación

### Guías principales

1. [Instalación](./INSTALLATION.md) - Instrucciones detalladas para instalar y configurar el proyecto
2. [Arquitectura](./ARCHITECTURE.md) - Descripción de la arquitectura y estructura del proyecto
3. [Configuración](./CONFIGURATION.md) - Opciones de configuración disponibles
4. [Desarrollo](./DEVELOPMENT.md) - Guía para desarrolladores que deseen contribuir al proyecto
5. [Despliegue](./DEPLOYMENT.md) - Guía detallada para el despliegue en diferentes entornos

### Documentación adicional

- [README de scripts](../scripts/README.md) - Información sobre los scripts de utilidad
- [README de pruebas de integración](../src/tests/integration/README.md) - Guía para las pruebas de integración

## Tecnologías principales

TG-TheGuardian está construido utilizando:

- **Node.js** - Entorno de ejecución
- **TypeScript** - Lenguaje de programación
- **Slack API** - Para la interfaz de usuario
- **MongoDB** - Para almacenar mensajes y documentos
- **Redis** - Para caché y gestión de contexto
- **OpenAI API** - Para procesamiento de lenguaje natural
- **Winston** - Para logging
- **Jest** - Para pruebas
- **Docker** - Para despliegue con contenedores

## Estructura del proyecto

```
TG-TheGuardian/
├── docs/                  # Documentación principal
├── scripts/               # Scripts de utilidad
├── src/                   # Código fuente
│   ├── adapters/          # Adaptadores para servicios externos
│   ├── application/       # Casos de uso
│   ├── config/            # Configuración
│   ├── domain/            # Modelos y puertos
│   ├── infrastructure/    # Infraestructura técnica
│   └── tests/             # Pruebas
└── ... archivos de configuración
```

## Cómo empezar

Para comenzar rápidamente con TG-TheGuardian:

1. Consulta la [guía de instalación](./INSTALLATION.md)
2. Configura las [variables de entorno](./CONFIGURATION.md)
3. Ejecuta el proyecto en [modo desarrollo](./DEVELOPMENT.md)
4. Para despliegue en producción, revisa la [guía de despliegue](./DEPLOYMENT.md)

## Ayuda y soporte

Si encuentras problemas o tienes preguntas sobre TG-TheGuardian:

1. Revisa la documentación existente
2. Consulta los [problemas conocidos](https://github.com/NickoDante/AI4Devs-finalproject/issues)
3. Crea un nuevo issue si el problema no está reportado 