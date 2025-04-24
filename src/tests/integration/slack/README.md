# Pruebas de Integración de Slack

Este directorio contiene las pruebas de integración específicas para el adaptador de Slack.

## Pruebas Implementadas

1. **Inicialización del adaptador**: Verifica que el adaptador se inicialice correctamente.
2. **Procesamiento de mensajes**: Comprueba que los mensajes directos se procesen adecuadamente.
3. **Procesamiento de comandos**: Valida el correcto funcionamiento de los comandos slash (como `/tg-search`).
4. **Formato de respuestas**: Asegura que las respuestas se formateen correctamente para Slack.

## Ejecución

```bash
# Ejecutar solo las pruebas de Slack
npm run test:slack
```

## Mockeo

Para estas pruebas, se utilizan los siguientes mocks:

1. **@slack/bolt**: Se simula la API de Slack para evitar conexiones reales.
2. **CachePort**: Se proporciona una implementación mock para el puerto de caché.
3. **Variables de entorno**: Se establecen tokens de prueba durante la ejecución.

## Cuidados Especiales

- Estas pruebas no envían mensajes reales a Slack.
- No requieren acceso a una instancia real de Slack.
- Los métodos privados se acceden utilizando casts de TypeScript para pruebas.

## Próximas Mejoras

- Pruebas para eventos app_mention
- Validación de mensajes con hilos
- Pruebas para escenarios de error y recuperación 