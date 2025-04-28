# Flujo del Comando /tg-search

## Descripción General
El comando `/tg-search` permite a los usuarios buscar documentación relevante en Confluence utilizando palabras clave. Este comando está diseñado para ser simple y directo, facilitando el acceso rápido a la información necesaria.

## Flujo de Interacción

### 1. Entrada del Usuario
```
Usuario: /tg-search onboarding
```

### 2. Procesamiento del Comando
1. El bot recibe el comando `/tg-search` con las palabras clave
2. Se extraen las palabras clave de la consulta
3. Se valida que la consulta no esté vacía

### 3. Búsqueda en Confluence
1. Se conecta a la API de Confluence
2. Se realiza la búsqueda usando las palabras clave
3. Se obtienen los resultados (mínimo 1 documento)

### 4. Formateo de Respuesta
El bot responde con:
- Lista de documentos encontrados (mínimo 1)
- Enlace directo a cada documento
- Breve resumen del contenido

### 5. Ejemplo de Respuesta
```
He encontrado los siguientes documentos sobre onboarding:

📄 Guía de Bienvenida
🔗 [Ver documento](https://confluence.example.com/onboarding)
📝 Guía completa para nuevos empleados, incluye estructura del equipo y herramientas principales.

📄 Primeros Pasos
🔗 [Ver documento](https://confluence.example.com/first-steps)
📝 Checklist de tareas iniciales y contactos importantes.
```

## Casos de Uso

### Caso 1: Búsqueda Exitosa
- Usuario busca información existente
- Sistema encuentra documentos relevantes
- Bot responde con enlaces y resúmenes

### Caso 2: Sin Resultados
- Usuario busca información no existente
- Sistema no encuentra documentos
- Bot responde con mensaje sugerente

### Caso 3: Error de Conexión
- Problemas con la API de Confluence
- Sistema detecta el error
- Bot responde con mensaje de error amigable

## Consideraciones Técnicas

### Límites
- Máximo 5 documentos por respuesta
- Resumen máximo de 100 caracteres por documento
- Timeout de 10 segundos para la búsqueda

### Seguridad
- Validación de permisos de usuario
- Sanitización de palabras clave
- Logging de búsquedas

## Mejoras Futuras
- Búsqueda en lenguaje natural
- Filtros por tipo de documento
- Sugerencias basadas en búsquedas previas
- Personalización según rol del usuario

## Notas de Implementación
- Mantener la implementación simple y directa
- Priorizar la velocidad de respuesta
- Asegurar mensajes claros y útiles
- Documentar cualquier cambio en el flujo 