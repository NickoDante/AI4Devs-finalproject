# Pruebas de Integración - TG: The Guardian

Este directorio contiene las pruebas de integración para el proyecto TG: The Guardian.

## Estructura

- `/slack`: Pruebas de integración para el adaptador de Slack
- `/mongodb`: Pruebas de integración para el adaptador de MongoDB (próximamente)
- `/redis`: Pruebas de integración para el adaptador de Redis (próximamente)

## Ejecución de pruebas

Para ejecutar todas las pruebas de integración:

```bash
npm run test:integration
```

Para ejecutar solo las pruebas de Slack:

```bash
npm run test:slack
```

## Consideraciones importantes

1. Las pruebas utilizan mocks para evitar dependencias externas.
2. Las variables de entorno se cargan desde `.env.local`.
3. No se requieren credenciales reales de servicios externos para ejecutar estas pruebas.

## Desarrollo de nuevas pruebas

Al añadir nuevas pruebas de integración:

1. Mantener independencia entre pruebas
2. Usar mocks apropiados para servicios externos
3. Seguir la estructura de directorios existente
4. Documentar cualquier configuración especial necesaria 