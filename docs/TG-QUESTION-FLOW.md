# Flujo del Comando /tg-question

## Descripción
El comando `/tg-question` permite a los usuarios hacer preguntas en lenguaje natural sobre documentación, políticas o cualquier información de la empresa directamente desde Slack.

## Formato del Comando
```
/tg-question <pregunta en lenguaje natural>
```

### Parámetros
- `<pregunta en lenguaje natural>`: La pregunta que el usuario desea realizar al sistema

### Ejemplos
```
/tg-question ¿Cómo funciona el sistema de combate?
/tg-question ¿Cuál es la política de vacaciones?
/tg-question ¿Dónde puedo encontrar documentación sobre el proyecto NVP?
```

## Flujo de Ejecución
1. El usuario ingresa el comando en Slack con una pregunta
2. El sistema valida el formato de entrada
3. Se buscan documentos relevantes en la base de conocimiento
4. Se recupera el contexto de conversación previo (si existe)
5. Se combina la pregunta, documentos relevantes y contexto previo
6. Se procesa mediante el LLM local (Llama)
7. La respuesta y el contexto actualizado se almacenan en Redis
8. Se devuelve la respuesta al usuario en Slack

## Manejo de Errores
- Si no se proporciona una pregunta válida
- Si hay errores en la conexión con la base de conocimiento
- Si el modelo de LLM no está disponible o falla
- Si hay errores en el procesamiento de la pregunta

## Notas Técnicas
- El sistema utiliza un modelo local de Llama para procesar las preguntas
- El contexto se almacena en Redis con un TTL de 30 minutos
- Se limita a mostrar los 3 documentos más relevantes para el contexto
- El historial de conversación se limita a los últimos 5 mensajes

## Descripción General
El comando `/tg-question` implementa un sistema avanzado de conversación contextual que permite a los usuarios realizar preguntas en lenguaje natural y recibir respuestas precisas basadas en la documentación interna de la empresa. A diferencia del comando de búsqueda, este comando utiliza procesamiento de lenguaje natural para entender el contexto de la pregunta y proporcionar respuestas directas en lugar de solo enlaces a documentos.

## Componentes Principales

### Sistema de Contexto
El comando implementa un sistema avanzado de contexto que mejora significativamente la calidad de las respuestas:

1. **Búsqueda vectorial**: Busca documentos relevantes relacionados con la pregunta.
2. **Memoria de conversación**: Mantiene el historial de preguntas y respuestas previas.
3. **Prompts enriquecidos**: Combina la pregunta, el contexto y extractos de documentos.
4. **Almacenamiento persistente**: El contexto se almacena en Redis para conversaciones continuas.

### Integración con Llama LLM
El comando utiliza un modelo local de Llama (Large Language Model) para procesar las preguntas y generar respuestas, lo que proporciona:

1. **Privacidad y seguridad**: Los datos sensibles no salen del servidor.
2. **Sin costos variables**: No hay tarifas por uso como en servicios cloud.
3. **Personalización**: El modelo puede ser fine-tuned con información específica.

## Flujo de Interacción

### 1. Entrada del Usuario
```
Usuario: /tg-question ¿Cómo funciona el sistema de combate?
```

### 2. Procesamiento del Comando
1. El bot recibe el comando `/tg-question` con la pregunta
2. Se valida que la pregunta no esté vacía
3. Se prepara la consulta para procesamiento y tracking

### 3. Búsqueda de Conocimiento
1. Se buscan documentos relevantes en la base de conocimiento
2. Se seleccionan hasta 3 documentos con mayor relevancia
3. Se extraen fragmentos clave de estos documentos

### 4. Gestión de Contexto
1. Se recupera cualquier contexto previo de conversación
2. Se guarda la pregunta actual en el contexto
3. Se construye un prompt enriquecido con toda la información

### 5. Procesamiento con LLM
1. Se envía el prompt enriquecido al modelo Llama
2. El modelo genera una respuesta contextualizada 
3. La respuesta se formatea para presentación en Slack

### 6. Actualización de Contexto
1. Se guarda la respuesta en el contexto de conversación
2. Se actualiza el registro de documentos relevantes
3. Se almacena todo el contexto actualizado en Redis

### 7. Ejemplo de Respuesta
```
*Respuesta:*
El sistema de combate se basa en turnos estratégicos donde cada personaje puede realizar 
acciones según su iniciativa. Los ataques usan un sistema de dados d20 para determinar 
aciertos y daños. Las habilidades especiales consumen puntos de energía y pueden causar 
efectos secundarios...

[Información extraída de la documentación de diseño de juego y manuales de combate]
```

## Casos de Uso

### Caso 1: Primera Pregunta
- Usuario hace una pregunta por primera vez
- Sistema busca documentos relevantes
- Sistema genera respuesta sin contexto previo
- Se crea nuevo contexto de conversación

### Caso 2: Pregunta de Seguimiento
- Usuario hace una pregunta relacionada con anterior
- Sistema recupera contexto previo
- Sistema busca documentos adicionales
- Genera respuesta considerando la conversación completa

### Caso 3: Modelo No Disponible
- Usuario hace una pregunta
- Modelo Llama no está disponible
- Sistema proporciona respuesta de fallback
- Sugiere descargar/configurar el modelo

## Consideraciones Técnicas

### Límites
- Máximo 3 documentos por consulta
- Historial limitado a 5 mensajes recientes
- TTL del contexto: 30 minutos
- Tamaño máximo de prompt según capacidad del modelo

### Seguridad
- Datos procesados localmente
- Sanitización de entradas
- Logs detallados de operaciones
- Validación de permisos de usuario

## Diagrama del Flujo

```
Usuario (Slack) → SlackAdapter → ProcessQuestionUseCase → KnowledgePort
                                        ↓
                                        → ManageConversationContextUseCase
                                        ↓
                                        → LlamaAdapter
                                        ↓
                                        → CachePort (guardar contexto)
                                        ↓
Usuario (Slack) ← SlackAdapter ← Respuesta formateada
```

## Mejoras Futuras
- Implementación de embeddings para búsqueda vectorial más precisa
- Fine-tuning del modelo con documentación específica de la empresa
- Interface web para visualización de conversaciones
- Análisis de sentimiento y detección de intención 