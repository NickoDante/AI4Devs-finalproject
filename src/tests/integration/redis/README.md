# Pruebas de Integración de Redis

Este directorio contiene las pruebas de integración específicas para el adaptador de Redis.

## Pruebas Implementadas

1. **Conexión a Redis**: Verifica la conexión y el healthcheck
2. **Operaciones básicas**: Prueba set, get, delete y exists
3. **Operaciones TTL**: Prueba getTTL y updateTTL
4. **Operaciones de listas**: Prueba pushToList y getList
5. **Operaciones de hash**: Prueba setHash y getHash
6. **Manejo de contexto**: Prueba setConversationContext y getConversationContext

## Ejecución

```bash
# Ejecutar solo las pruebas de Redis
npm run test:redis
```

## Detalles Técnicos

Para estas pruebas se utiliza **mocks de Jest** para simular una instancia de Redis. Esto proporciona:

- Pruebas rápidas sin dependencia de servicios externos
- Entorno controlado para cada ejecución de pruebas
- Sin necesidad de configurar credenciales o instancias reales
- Control total sobre el comportamiento de cada método de Redis

## Estructura de Fixtures

Los datos de prueba se organizan en:

- `context.fixture.ts`: Generación de datos de contexto de conversación para pruebas

## Consideraciones importantes

- Las pruebas son independientes entre sí
- Cada prueba crea sus propios datos de prueba
- Los mocks se reinician entre cada prueba con jest.clearAllMocks()

## Próximas Mejoras

- Pruebas de rendimiento
- Pruebas de concurrencia
- Simulación de fallos de conexión 