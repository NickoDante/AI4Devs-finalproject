# Pruebas de Integración de MongoDB

Este directorio contiene las pruebas de integración específicas para el adaptador de MongoDB.

## Pruebas Implementadas

1. **Conexión a MongoDB**: Verifica la conexión y el healthcheck
2. **Operaciones CRUD para usuarios**: Prueba guardar, buscar, actualizar y eliminar usuarios
3. **Operaciones CRUD para documentos**: Prueba guardar, obtener y eliminar documentos
4. **Operaciones CRUD para mensajes**: Prueba guardar, listar y eliminar mensajes

## Ejecución

```bash
# Ejecutar solo las pruebas de MongoDB
npm run test:mongodb
```

## Detalles Técnicos

Para estas pruebas se utiliza **mongodb-memory-server**, que ejecuta una instancia de MongoDB en memoria durante las pruebas. Esto proporciona:

- Pruebas rápidas sin dependencia de servicios externos
- Entorno limpio para cada ejecución de pruebas
- Sin necesidad de configurar credenciales o bases de datos reales

## Estructura de Fixtures

Los datos de prueba se organizan en:

- `user.fixture.ts`: Generación de datos de usuario para pruebas
- `document.fixture.ts`: Generación de datos de documentos para pruebas
- `message.fixture.ts`: Generación de datos de mensajes para pruebas

## Consideraciones importantes

- Las pruebas son independientes entre sí
- Cada prueba crea sus propios datos de prueba
- La base de datos se reinicia entre ejecuciones de prueba

## Próximas Mejoras

- Pruebas de rendimiento
- Pruebas de concurrencia
- Simulación de fallos de conexión 