# TG: The Guardian - Chatbot de Conocimiento Corporativo

## Descripción General

TG: The Guardian es un chatbot corporativo inteligente diseñado específicamente para Teravision Games, que se integra seamlessly with Slack and Confluence para proporcionar acceso rápido y eficiente al conocimiento y la documentación interna de la empresa. Representado por la icónica mascota de múltiples ojos de la compañía, este asistente virtual aprovecha tecnologías de procesamiento de lenguaje natural para entender consultas conversacionales, localizar información relevante, y presentarla de manera estructurada y accesible. El sistema actúa como intermediario entre los empleados y la base de documentación corporativa, eliminando la necesidad de navegar manualmente a través de múltiples páginas de Confluence para encontrar información específica. The Guardian también puede resumir documentos extensos, responder preguntas administrativas frecuentes, y está diseñado para crecer en capacidades a medida que comprende mejor el contexto único de Teravision Games y sus procesos internos.

## Objetivo

El propósito principal de TG: The Guardian es optimizar el acceso al conocimiento y la documentación interna para los empleados de Teravision Games, reduciendo significativamente el tiempo dedicado a buscar información y aumentando la productividad general del equipo. El producto soluciona el problema fundamental de la información dispersa y de difícil acceso, permitiendo a los desarrolladores, diseñadores, artistas, productores y personal administrativo concentrarse en sus tareas principales en lugar de perder tiempo navegando por repositorios de documentación. Al democratizar el acceso al conocimiento interno mediante una interfaz conversacional en Slack (plataforma que el equipo ya utiliza diariamente), The Guardian elimina barreras tecnológicas y crea un entorno donde la información fluye libremente, beneficiando especialmente a los nuevos empleados y a equipos multidisciplinarios que necesitan acceder rápidamente a documentación fuera de su área de especialización.

---

## Características y Funcionalidades Principales

** 1. Búsqueda de Documentos por Palabras Clave**

Esta funcionalidad permite a los empleados de Teravision Games encontrar rápidamente documentación relevante sin tener que navegar por la estructura de Confluence o recordar ubicaciones exactas de documentos. Los usuarios pueden realizar consultas en lenguaje natural como "¿Dónde está la documentación sobre el sistema de combate?" o "Busca documentos relacionados con el proceso de onboarding", y The Guardian responderá con enlaces directos a las páginas relevantes y una breve descripción del contenido. Esta característica responde directamente a la necesidad expresada por Cyndi de "localizar documentación por medio de palabras clave" y facilita el acceso a información crítica desde cualquier lugar a través de Slack.

** 2. Respuestas a Preguntas Administrativas**

The Guardian puede responder a consultas administrativas frecuentes relacionadas con procesos internos, políticas de la empresa, y procedimientos, aliviando la carga sobre el personal de recursos humanos y administración. Los empleados pueden preguntar sobre temas como "¿Cómo solicito un certificado laboral?", "¿Cuál es el proceso para pedir nuevos equipos?" o "¿Qué pasos debo seguir para solicitar vacaciones?", recibiendo respuestas precisas extraídas directamente de la documentación oficial. Esta funcionalidad aborda específicamente la necesidad identificada por Kata de tener acceso a información sobre "certificado laboral, con acceso a confluence donde esta el Form" y "adquisición de elementos de trabajo", automatizando el primer nivel de soporte para consultas administrativas rutinarias.

** 3. Resumen de Documentos y Páginas de Confluence**

Esta característica permite a los miembros del equipo obtener rápidamente la esencia de documentos extensos sin tener que leerlos completamente, ahorrando tiempo valioso durante la jornada laboral. Los usuarios pueden solicitar a The Guardian que "resuma la página sobre el sistema de monetización" o "dame los puntos clave del documento de diseño del último proyecto", recibiendo un resumen conciso que destaca la información más relevante. Esta funcionalidad responde indirectamente a varias necesidades expresadas por el equipo, particularmente las relacionadas con documentación eficiente (mencionada por Jesus, JJ, Jero, Julian, Duvan, y Cesar), ya que permite a los empleados consumir información técnica y de procesos de manera más eficiente, facilitando la comprensión rápida de documentos complejos y extensos.

## Necesidades que Cubre

TG: The Guardian cubre las siguientes necesidades identificadas por el equipo de Teravision Games:

- Consultas sobre temas de proyectos y documentación desde Slack (CYNDI)
- Localización de documentación por palabras clave (CYNDI)
- Generación de documentación en Confluence (JESUS)
- Creación de documentación siguiendo templates (DUVAN)
- Publicación de notas de reuniones en Slack (CYNDI)
- Extracción de accionables de reuniones (JESUS)
- Respuestas a preguntas laborales con acceso a Confluence (KATA)
- Facilitar el acceso a información administrativa (KATA)
- Centralización del conocimiento corporativo (necesidad general)

## Dificultad

La dificultad general del proyecto se considera **Media**, con los siguientes factores principales:

- **Integración con plataformas externas**: Requiere trabajar con las APIs de Slack y Confluence
- **Procesamiento de lenguaje natural**: Implementación de la integración con LLM para entender consultas
- **Búsqueda semántica**: Desarrollo de algoritmos para encontrar documentos relevantes
- **Extracción y resumen de información**: Implementación de técnicas para resumir documentos

La complejidad se reduce mediante:
- Uso de servicios de LLM existentes (OpenAI/Claude) en lugar de implementaciones propias
- Enfoque en un conjunto limitado de funcionalidades clave para el MVP
- Aprovechamiento de SDKs y librerías establecidas para las integraciones

---

## Tecnologías

### Frontend
- **Interfaz primaria**: Interfaz de Slack mediante comandos y mensajes directos
- **Panel de administración**: Aplicación web simple desarrollada en React
- **Identidad visual**: Incorporación de la mascota de múltiples ojos como identidad del chatbot
- **Framework**: React con TypeScript para el panel de administración

### Backend
- **Lenguaje principal**: Node.js con Express
- **Arquitectura**: API REST para la comunicación entre componentes
- **Gestión de estados**: Sistema de caché para optimizar respuestas frecuentes
- **Despliegue**: Contenedores Docker para facilitar la implementación

### Base de datos
- **Principal**: MongoDB para almacenamiento de configuraciones y registro de consultas
- **Búsqueda semántica**: Vector database (Pinecone o Weaviate) para búsqueda avanzada
- **Caché**: Redis para almacenamiento temporal y mejora de rendimiento

### APIs
- **Slack API**: Para la integración con la plataforma de comunicación
- **Confluence API**: Para acceder y consultar la documentación interna
- **LLM recomendado**: OpenAI GPT-3.5-Turbo como opción más accesible en términos de costo/rendimiento
- **Alternativas LLM**: Claude de Anthropic o Llama-3-8B si se prefiere una solución in-house

## Opciones Predefinidas

The Guardian implementará las siguientes opciones predefinidas para facilitar su uso:

1. **Comandos específicos**:
   - `/tg-search [términos]`: Buscar documentación por palabras clave
   - `/tg-admin [consulta]`: Realizar preguntas administrativas
   - `/tg-summary [URL]`: Solicitar resumen de un documento específico

2. **Templates de documentación**:
   - Plantillas predefinidas para tipos comunes de documentos
   - Estructura estandarizada para resúmenes y respuestas

3. **Flujos guiados**:
   - Asistente paso a paso para tareas complejas
   - Formularios conversacionales para recopilar información necesaria

4. **Sugerencias contextuales**:
   - Recomendaciones basadas en el historial de consultas
   - Sugerencias de documentos relacionados con la consulta actual
---

## Diagrama Recomendado: Diagrama de Componentes

Para el proyecto TG: The Guardian, el **Diagrama de Componentes** es el más adecuado para representar la arquitectura del sistema en esta primera versión. Este tipo de diagrama permite visualizar claramente:

1. Los componentes principales del sistema
2. Las interfaces entre ellos
3. Las dependencias externas (Slack, Confluence, LLMs)
4. El flujo de información entre componentes
5. La estructura técnica general sin entrar en detalles de implementación excesivos

El diagrama de componentes proporcionará una visión de alto nivel pero suficientemente detallada para guiar el desarrollo, facilitar la comunicación con stakeholders y servir como referencia durante la implementación.

---

## Patrón Arquitectónico Recomendado: Arquitectura Hexagonal (Puertos y Adaptadores)

La **Arquitectura Hexagonal** (también conocida como Ports and Adapters) es la más adecuada para este proyecto.

### Justificación

1. **Separación clara de responsabilidades**: La arquitectura hexagonal separa claramente el dominio central del sistema (el "hexágono") de las interfaces externas (los "puertos" y "adaptadores").

2. **Independencia de las tecnologías externas**: La lógica de negocio central queda aislada de los detalles de implementación de Slack, Confluence, OpenAI y otras tecnologías externas.

3. **Facilidad para pruebas**: Al desacoplar la lógica central de las dependencias externas, se facilita enormemente la posibilidad de realizar pruebas automatizadas sin depender de servicios externos.

4. **Flexibilidad para intercambiar componentes**: Si en el futuro se desea cambiar el LLM (de OpenAI a Claude, por ejemplo) o incluso la plataforma de comunicación (de Slack a Microsoft Teams), estos cambios quedarían confinados a los adaptadores correspondientes sin afectar al núcleo de la aplicación.

5. **Evolución independiente**: Cada componente puede evolucionar y escalar de manera independiente, lo cual es crucial para un sistema que irá creciendo en funcionalidades y complejidad.

### Estructura Básica

En la arquitectura hexagonal para TG: The Guardian:

- **Dominio central**: Contiene la lógica de procesamiento de consultas, interpretación de intenciones y orquestación de respuestas.
  
- **Puertos (interfaces)**: Definen cómo debe interactuar el núcleo con el mundo exterior:
  - Puerto de mensajería (para interactuar con Slack)
  - Puerto de documentación (para acceder a Confluence)
  - Puerto de procesamiento de lenguaje (para interactuar con LLMs)
  - Puerto de persistencia (para la base de datos)

- **Adaptadores**: Implementan los puertos para tecnologías específicas:
  - Adaptador de Slack
  - Adaptador de Confluence
  - Adaptador de OpenAI/Claude
  - Adaptador de MongoDB/Redis

### Beneficios Principales

1. **Mantenibilidad**: La clara separación entre componentes facilita el mantenimiento y evolución del sistema.

2. **Escalabilidad**: Cada componente puede escalar de forma independiente según las necesidades.

3. **Testabilidad**: La arquitectura facilita la implementación de pruebas unitarias y de integración.

4. **Adaptabilidad**: Cambiar proveedores de servicios (como el LLM) requiere modificar solo los adaptadores correspondientes.

5. **Claridad conceptual**: El diseño refleja claramente el propósito del sistema y sus interacciones.

### Sacrificios o Déficits

1. **Complejidad inicial**: Implementar una arquitectura hexagonal requiere un esfuerzo de diseño inicial mayor que aproximaciones más directas.

2. **Sobrecarga de abstracción**: Para sistemas muy pequeños, puede parecer excesivo el nivel de abstracción, aunque para TG: The Guardian resulta adecuado dada su integración con múltiples sistemas externos.

3. **Curva de aprendizaje**: Para desarrolladores no familiarizados con el patrón, puede haber una curva de aprendizaje inicial.

4. **Indirección**: El código puede ser algo más verboso debido a las capas de abstracción adicionales.

### Consideraciones Adicionales

Para complementar el Diagrama de Componentes principal, sería recomendable desarrollar también:

1. **Diagrama de Secuencia**: Para las interacciones principales (búsqueda, consulta administrativa, resumen)
2. **Diagrama de Flujo de Usuario**: Para visualizar la experiencia desde la perspectiva del usuario de Slack
3. **Diagrama de Entidad-Relación**: Para el diseño de la base de datos

Estos diagramas adicionales proporcionarían vistas complementarias que ayudarían a comprender mejor aspectos específicos del sistema durante el desarrollo.

### Diagrama en Mermaid
graph TD
  %% Dominio Central
  subgraph Dominio Central
    CoreLogic["🧠 Lógica Central (Interprete de Intenciones)"]
    QueryHandler["📌 Orquestador de Consultas"]
  end

  %% Puertos
  subgraph Puertos
    PortSlack["🛠️ Puerto: Mensajería"]
    PortConfluence["🛠️ Puerto: Acceso Documentación"]
    PortLLM["🛠️ Puerto: Procesamiento Lenguaje Natural"]
    PortDB["🛠️ Puerto: Persistencia"]
  end

  %% Adaptadores
  subgraph Adaptadores
    AdapterSlack["🔌 Adaptador Slack API"]
    AdapterConfluence["🔌 Adaptador Confluence API"]
    AdapterOpenAI["🔌 Adaptador OpenAI GPT-3.5"]
    AdapterMongo["🔌 Adaptador MongoDB"]
    AdapterRedis["🔌 Adaptador Redis"]
    AdapterVectorDB["🔌 Adaptador Pinecone/Weaviate"]
  end

  %% Interfaces externas
  subgraph Externos
    SlackUser["👤 Usuario Slack"]
    Confluence["📚 Confluence"]
    OpenAI["🧠 OpenAI API"]
    MongoDB["🗄️ MongoDB"]
    Redis["⚡ Redis"]
    VectorDB["📊 Vector DB"]
  end

  %% Conexiones del dominio a puertos
  CoreLogic --> QueryHandler
  QueryHandler --> PortSlack
  QueryHandler --> PortConfluence
  QueryHandler --> PortLLM
  QueryHandler --> PortDB

  %% Conexiones de puertos a adaptadores
  PortSlack --> AdapterSlack
  PortConfluence --> AdapterConfluence
  PortLLM --> AdapterOpenAI
  PortDB --> AdapterMongo
  PortDB --> AdapterRedis
  PortDB --> AdapterVectorDB

  %% Conexiones de adaptadores a servicios externos
  AdapterSlack --> SlackUser
  AdapterConfluence --> Confluence
  AdapterOpenAI --> OpenAI
  AdapterMongo --> MongoDB
  AdapterRedis --> Redis
  AdapterVectorDB --> VectorDB

---
  
## Descripción de componentes principales

| Nivel Arquitectónico | Componente                      | Rol Clave                                                                 | Tecnología                         | Importancia del Nivel                                                                 |
|----------------------|----------------------------------|---------------------------------------------------------------------------|------------------------------------|----------------------------------------------------------------------------------------|
| Dominio Central      | CoreLogic (Lógica Central)       | Interpreta intenciones y decide flujo de ejecución                        | Node.js (TypeScript preferido)     | ⭐⭐⭐⭐⭐ Vital: es el cerebro del sistema, contiene la lógica de negocio central         |
|                      | QueryHandler                     | Orquestador de procesos, llama a puertos según necesidad de la consulta   | Node.js                            | ⭐⭐⭐⭐ Es el puente entre el dominio y los puertos, clave para mantener la cohesión     |
|                      | Entidades + Value Objects        | Representan conceptos del negocio (consultas, respuestas, etc.)           | Node.js / TypeScript               | ⭐⭐⭐ Refuerzan la estructura y legibilidad del dominio                                 |

| Puertos              | Puerto de Mensajería             | Interface para recibir y enviar mensajes de Slack                         | Interface en TypeScript            | ⭐⭐⭐⭐ Abstracción crucial para independencia de la plataforma de mensajería            |
|                      | Puerto de Documentación          | Interface para buscar y extraer datos desde Confluence                    | Interface en TypeScript            | ⭐⭐⭐⭐ Permite acceder al conocimiento base del sistema                                 |
|                      | Puerto de Procesamiento LLM      | Interface para generar resúmenes y entender lenguaje natural              | Interface en TypeScript            | ⭐⭐⭐⭐⭐ Esencial: sin LLM, se pierde el valor cognitivo del asistente                   |
|                      | Puerto de Persistencia           | Interface para leer/escribir datos en base de datos y cache               | Interface en TypeScript            | ⭐⭐⭐ Necesario para el estado, logs y configuraciones                                  |

| Adaptadores          | Adaptador Slack API              | Conecta con Slack y formatea la información                               | Slack API + Bolt.js (Node SDK)     | ⭐⭐⭐⭐ Permite la interfaz conversacional base del sistema                              |
|                      | Adaptador Confluence API         | Llama a la API de Confluence para extraer contenido                       | Confluence REST API + Axios        | ⭐⭐⭐⭐ Vital para encontrar y extraer documentación real                                |
|                      | Adaptador OpenAI / Claude        | Comunicación con el modelo LLM para NLP                                   | OpenAI SDK / Claude API            | ⭐⭐⭐⭐⭐ Habilita la inteligencia conversacional                                          |
|                      | Adaptador MongoDB                | Almacena configuraciones, logs, y estructura básica                       | MongoDB + Mongoose                 | ⭐⭐⭐ Base de datos principal del sistema                                                |
|                      | Adaptador Redis                  | Cache para respuestas frecuentes                                          | Redis + ioredis (Node)             | ⭐⭐⭐ Mejora el rendimiento general del bot                                              |
|                      | Adaptador Pinecone / Weaviate    | Búsqueda semántica en documentos                                          | Pinecone SDK / Weaviate API        | ⭐⭐⭐⭐ Clave para encontrar contenido relevante basado en intención                      |

| Interfaces Externas  | Slack                            | Punto de entrada del usuario                                              | Plataforma externa                  | ⭐⭐⭐⭐⭐ Sin Slack, no hay canal de entrada                                                |
|                      | Confluence                       | Fuente de documentación corporativa                                       | Plataforma externa                  | ⭐⭐⭐⭐⭐ Contenedor del conocimiento empresarial                                           |
|                      | OpenAI / Claude / Llama          | Inteligencia para comprender preguntas y generar respuestas               | Plataforma externa                  | ⭐⭐⭐⭐⭐ Núcleo de comprensión semántica                                                   |
|                      | MongoDB, Redis, Pinecone/Weaviate| Infraestructura para persistencia y rendimiento                           | Plataforma externa                  | ⭐⭐⭐ Apoyo técnico para la estabilidad y velocidad del sistema                          |

---

## Estructura de Ficheros
tg-the-guardian/
├── src/
│   ├── domain/                 # Núcleo del sistema (negocio puro, sin dependencias externas)
│   │   ├── models/             # Entidades y value objects (ej: Query, Document, Summary)
│   │   ├── services/           # Lógica de negocio (ej: interprete de intenciones)
│   │   └── ports/              # Interfaces (puertos) que define el dominio
│
│   ├── application/            # Casos de uso / orquestadores
│   │   └── use-cases/          # Coordinan lógica de dominio y puertos
│
│   ├── adapters/               # Adaptadores que implementan los puertos definidos en dominio
│   │   ├── slack/              # Adaptador para Slack API
│   │   ├── confluence/         # Adaptador para Confluence
│   │   ├── llm/                # Adaptador para OpenAI / Claude / Llama
│   │   ├── persistence/        # MongoDB, Redis, Pinecone/Weaviate
│   │   └── utils/              # Adaptadores auxiliares (logs, helpers, etc.)
│
│   ├── infrastructure/         # Inicialización, configuración e integración
│   │   ├── server/             # Configuración del servidor y enrutadores
│   │   ├── config/             # Variables de entorno, settings
│   │   └── di/                 # Inyección de dependencias (IoC Container)
│
│   ├── interfaces/             # Interfaces de entrada: Slack, Web UI (si aplica)
│   │   └── slack/              # Controladores de comandos Slack (slash, DM)
│
│   └── shared/                 # Tipos comunes, errores, constantes
│       ├── types/              # Tipado compartido entre capas
│       └── errors/             # Manejo de errores estructurado
│
├── tests/                      # Tests unitarios e integración
│   ├── domain/
│   ├── adapters/
│   └── use-cases/
│
├── public/                     # Archivos estáticos (si aplica, para panel admin)
├── scripts/                    # Scripts de despliegue, CLI, utilidades
├── .env                        # Variables de entorno
├── Dockerfile                  # Contenedor del bot
├── docker-compose.yml          # Orquestación de contenedores
├── package.json
└── README.md

### Explicacion por nivel
Carpeta 		| Pertenece a 		| Rol clave 									| Relación con arquitectura hexagonal
domain/ 		| Núcleo 			| Define el negocio: entidades, lógica, puertos | ✅ Dominio puro, independiente de frameworks
application/ 	| Núcleo 			| Orquesta los casos de uso 					| ✅ Casos de uso conectan puertos sin acoplarse a adaptadores
adapters/ 		| Infraestructura 	| Implementaciones concretas de puertos 		| ✅ Adaptadores conectan con tecnologías específicas
interfaces/ 	| Entrada 			| Interfaz que el usuario usa (Slack, Web) 		| ✅ Entrada/salida que interactúa con adaptadores
infrastructure/ | Infraestructura 	| Configuración, DI, entorno de ejecución 		| ✅ Configura cómo se unen todos los componentes
shared/ 		| Compartido 		| Tipos globales, errores y constantes 			| ✅ Reutilizable sin acoplarse a otras capas
tests/ 			| Transversal 		| Verifica funcionalidad de cada componente 	| ✅ Ideal para pruebas aisladas gracias a la separación hexagonal

Esta estructura permite:
* Claridad de responsabilidades: Cada carpeta cumple un propósito único.
* Escalabilidad: Puedes añadir nuevos puertos/adaptadores sin modificar el dominio.
* Facilidad de testing: Gracias a la separación de adaptadores y dominio.
* Sustentabilidad: Soporta crecimiento futuro sin convertirse en un monolito caótico.
* Alineación con la arquitectura hexagonal: Perfectamente enmarcada en Ports & Adapters.

---

## Diagrama del modelo de datos

erDiagram

%%------------------------
%% Entidad: Usuario
%%------------------------
User {
  string id PK "MongoDB ObjectId"
  string slackId "ID único en Slack"
  string email "Correo electrónico (opcional)"
  string displayName "Nombre visible"
  string realName "Nombre real (opcional)"
  string avatarUrl "URL de avatar (opcional)"
  string department "Departamento (opcional)"
  string role "Rol en la empresa (opcional)"
  boolean isAdmin "Permisos de administrador"
  string language "Idioma preferido (es/en)"
  boolean notificationsEnabled "Notificaciones activadas"
  string defaultResponseFormat "Formato respuesta (concise/detailed)"
  string[] savedSearches "IDs de búsquedas guardadas"
  int totalQueries "Total de consultas"
  date lastActive "Último acceso"
  string[] topCategories "Categorías más consultadas"
  date createdAt
  date updatedAt
  boolean active "Usuario activo"
}

%%------------------------
%% Entidad: Query
%%------------------------
Query {
  string id PK
  string queryHash "Hash de texto para detectar duplicados"
  string originalText "Texto original del usuario"
  string normalizedText "Texto normalizado"
  string language "Idioma detectado"
  string type "Tipo (search/admin/summary/conversation/unknown)"
  string intent "Intención semántica"
  string command "Comando de Slack utilizado"
  string status "Estado (pending/processing/completed/failed)"
  number processingTime "Tiempo en ms (opcional)"
  string channelId "Canal de Slack (opcional)"
  date createdAt
  date updatedAt
}

%%------------------------
%% Entidad: EntityExtractions (array embebido en Query, simplificado)
%%------------------------
EntityExtraction {
  string id PK
  string type "Tipo de entidad extraída (project, policy, etc.)"
  string value "Valor detectado"
  number confidence "Confianza (0-1)"
}

%%------------------------
%% Entidad: Response
%%------------------------
Response {
  string id PK
  string queryId FK "Relación a Query"
  string userId FK "Usuario que recibió la respuesta"
  string text "Texto de la respuesta generada"
  string type "search/admin/summary"
  string modelUsed "Modelo LLM usado (ej: gpt-3.5)"
  date createdAt
}

%%------------------------
%% Entidad: Document
%%------------------------
Document {
  string id PK
  string confluenceId "ID original en Confluence"
  string spaceKey "Espacio en Confluence"
  string title "Título del documento"
  string url "URL completa"
  string author "Autor original"
  string lastUpdatedBy "Último editor"
  int version
  string[] tags
  string[] categories
  string[] departments
  string plainText "Texto extraído"
  string contentSummary "Resumen generado"
  string[] keyPoints
  string vectorId "ID en VectorDB"
  string embeddingModel "Modelo de embeddings"
  int dimensions "Dimensión del vector"
  date embeddingsUpdatedAt
  string contentHash "Hash del contenido"
  date lastChecked
  boolean isSynced
  boolean active
  date createdAt
  date updatedAt
}

%%------------------------
%% Entidad: Feedback
%%------------------------
Feedback {
  string id PK
  string responseId FK
  string userId FK
  int rating "Valoración (1-5)"
  boolean isHelpful
  string comment "Comentario opcional"
  string[] categories
  string[] tags
  string suggestedImprovements
  string[] documentIds "Referencias"
  date createdAt
  date updatedAt
}

%%------------------------
%% Relaciones
%%------------------------

User ||--o{ Query : "realiza"
User ||--o{ Response : "recibe"
User ||--o{ Feedback : "envía"
Query ||--o{ EntityExtraction : "extrae"
Query ||--|| Response : "genera"
Response ||--o{ Feedback : "es evaluada"
Feedback ||--o{ Document : "refiere a"

### Descripción de entidades principales

#### 📘 Entidad: `User` — *Usuario Interno de Slack*

Representa a cada persona de Teravision que interactúa con el bot desde Slack. Contiene preferencias, datos organizacionales y métricas de uso.

| Campo                     | Tipo       | Descripción                                                                 | Restricciones                   |
|--------------------------|------------|-----------------------------------------------------------------------------|---------------------------------|
| `id`                     | `string`   | ID único generado por MongoDB                                              | `PK`, `not null`                |
| `slackId`                | `string`   | ID único del usuario en Slack                                              | `unique`, `not null`            |
| `email`                  | `string`   | Correo electrónico corporativo                                             | `optional`, `format: email`     |
| `displayName`            | `string`   | Nombre visible (alias o nombre corto)                                      | `not null`, `min: 2`, `max: 50` |
| `realName`               | `string`   | Nombre completo del usuario                                                | `optional`                      |
| `avatarUrl`              | `string`   | URL del avatar de perfil de Slack                                          | `optional`, `format: url`       |
| `department`             | `string`   | Departamento al que pertenece (HR, Tech, etc.)                             | `optional`                      |
| `role`                   | `string`   | Rol dentro de la empresa (ej: desarrollador, diseñador)                    | `optional`                      |
| `isAdmin`                | `boolean`  | Indica si el usuario tiene privilegios de administrador                    | `default: false`, `not null`    |
| `language`               | `string`   | Idioma preferido                                                           | `default: "es"`, `"es"`, `"en"` |
| `notificationsEnabled`   | `boolean`  | Permite o no recibir notificaciones                                        | `default: true`                 |
| `defaultResponseFormat`  | `string`   | Formato preferido para respuestas                                          | `"concise"`, `"detailed"`, `"bullet-points"` |
| `savedSearches`          | `string[]` | IDs de búsquedas guardadas                                                 | `optional`                      |
| `totalQueries`           | `int`      | Total de consultas realizadas                                              | `default: 0`                    |
| `lastActive`             | `date`     | Última vez que interactuó con el bot                                       | `optional`                      |
| `topCategories`          | `string[]` | Categorías más consultadas por el usuario                                  | `optional`                      |
| `createdAt`              | `date`     | Fecha de creación del registro                                              | `not null`                      |
| `updatedAt`              | `date`     | Fecha de última actualización                                              | `not null`                      |
| `active`                 | `boolean`  | Estado del usuario                                                         | `default: true`                 |

**Relaciones**:
- 1 --- * `Query` (realiza)
- 1 --- * `Response` (recibe)
- 1 --- * `Feedback` (envía)

#### 📘 Entidad: `Query` — *Consulta Realizada*
Consulta enviada desde Slack por el usuario. Guarda el texto original, su interpretación y estado de procesamiento.

| Campo              | Tipo       | Descripción                                                                 | Restricciones                            |
|-------------------|------------|-----------------------------------------------------------------------------|------------------------------------------|
| `id`              | `string`   | ID único generado por MongoDB                                              | `PK`, `not null`                         |
| `queryHash`       | `string`   | Hash SHA del texto normalizado, para detectar duplicados                   | `unique`                                 |
| `originalText`    | `string`   | Texto exacto ingresado por el usuario                                       | `not null`, `max: 500`                   |
| `normalizedText`  | `string`   | Texto preprocesado para análisis                                           | `not null`                               |
| `language`        | `string`   | Idioma detectado (es/en)                                                   | `default: "es"`                          |
| `type`            | `string`   | Tipo de consulta                                                            | `"search"`, `"admin"`, `"summary"`, `"conversation"`, `"unknown"` |
| `intent`          | `string`   | Intención detectada por el NLP                                             | `optional`                               |
| `command`         | `string`   | Comando de Slack usado (ej: `/tg-search`)                                  | `optional`                               |
| `status`          | `string`   | Estado de la consulta                                                       | `"pending"`, `"processing"`, `"completed"`, `"failed"` |
| `processingTime`  | `number`   | Tiempo que tomó procesarla en milisegundos                                 | `optional`                               |
| `channelId`       | `string`   | Canal de Slack desde donde se envió la consulta                            | `optional`                               |
| `createdAt`       | `date`     | Fecha de creación                                                          | `not null`                               |
| `updatedAt`       | `date`     | Fecha de última modificación                                               | `not null`                               |

**Relaciones**:
- 1 --- * `EntityExtraction`
- 1 --- 1 `Response`
- * --- 1 `User`

#### 📘 Entidad: `EntityExtraction` — *Entidades Detectadas*
Entidades extraídas de la consulta por el NLP.

| Campo          | Tipo       | Descripción                                         | Restricciones   |
|----------------|------------|-----------------------------------------------------|-----------------|
| `id`           | `string`   | ID único (MongoDB ObjectId)                         | `PK`, `not null`|
| `type`         | `string`   | Tipo de entidad (ej: `project`, `document`)         | `not null`      |
| `value`        | `string`   | Texto detectado                                     | `not null`      |
| `confidence`   | `number`   | Valor de confianza del modelo (rango 0–1)           | `0 <= x <= 1`   |

#### 📘 Entidad: `Response` — *Respuesta Generada*
Texto generado por el bot como respuesta a una consulta.

| Campo         | Tipo       | Descripción                                                      | Restricciones   |
|---------------|------------|------------------------------------------------------------------|-----------------|
| `id`          | `string`   | ID único de la respuesta (MongoDB ObjectId)                      | `PK`, `not null`|
| `queryId`     | `string`   | ID de la consulta asociada                                       | `FK -> Query`, `not null` |
| `userId`      | `string`   | Usuario al que se le generó la respuesta                         | `FK -> User`, `not null`  |
| `text`        | `string`   | Respuesta generada (texto plano)                                 | `not null`      |
| `type`        | `string`   | Tipo de respuesta                                                 | `"search"`, `"admin"`, `"summary"` |
| `modelUsed`   | `string`   | Modelo LLM utilizado (ej: `gpt-3.5-turbo`)                        | `optional`       |
| `createdAt`   | `date`     | Fecha de creación                                                | `not null`       |

**Relaciones**:
- 1 --- * `Feedback`
- * --- 1 `Query`
- * --- 1 `User`

#### 📘 Entidad: `Document` — *Documento Indexado*
Documentos extraídos de Confluence, indexados con embeddings.

| Campo                 | Tipo       | Descripción                                                  | Restricciones               |
|----------------------|------------|--------------------------------------------------------------|-----------------------------|
| `id`                 | `string`   | ID MongoDB del documento                                     | `PK`, `not null`            |
| `confluenceId`       | `string`   | ID original del documento en Confluence                      | `unique`, `not null`        |
| `spaceKey`           | `string`   | Espacio donde se ubica el documento                          | `not null`                  |
| `title`              | `string`   | Título del documento                                         | `not null`, `max: 200`      |
| `url`                | `string`   | URL completa del documento                                  | `not null`, formato URL     |
| `author`             | `string`   | Autor original                                               | `optional`                  |
| `lastUpdatedBy`      | `string`   | Último editor                                                | `optional`                  |
| `version`            | `int`      | Versión del documento                                        | `optional`                  |
| `tags`               | `string[]` | Etiquetas                                                    | `optional`                  |
| `categories`         | `string[]` | Categorías (ej: "onboarding", "hr")                          | `optional`                  |
| `departments`        | `string[]` | Departamentos relevantes                                     | `optional`                  |
| `plainText`          | `string`   | Contenido extraído en texto plano                           | `not null`                  |
| `contentSummary`     | `string`   | Resumen generado                                             | `optional`                  |
| `keyPoints`          | `string[]` | Lista de puntos clave                                        | `optional`                  |
| `vectorId`           | `string`   | ID del vector en base vectorial                              | `optional`                  |
| `embeddingModel`     | `string`   | Modelo que generó el embedding                               | `optional`                  |
| `dimensions`         | `int`      | Dimensiones del vector                                       | `optional`                  |
| `embeddingsUpdatedAt`| `date`     | Fecha de última generación del vector                        | `optional`                  |
| `contentHash`        | `string`   | Hash del contenido actual                                    | `not null`                  |
| `lastChecked`        | `date`     | Última vez que se verificaron cambios                        | `optional`                  |
| `isSynced`           | `boolean`  | Si está sincronizado con Confluence                          | `default: true`             |
| `active`             | `boolean`  | Estado del documento                                         | `default: true`             |
| `createdAt`          | `date`     | Fecha de creación                                            | `not null`                  |
| `updatedAt`          | `date`     | Fecha de última actualización                                | `not null`                  |

#### 📘 Entidad: `Feedback` — *Evaluación de la Respuesta*
Permite a los usuarios calificar la utilidad de las respuestas recibidas.

| Campo                  | Tipo       | Descripción                                                | Restricciones             |
|------------------------|------------|------------------------------------------------------------|---------------------------|
| `id`                   | `string`   | ID MongoDB del feedback                                    | `PK`, `not null`          |
| `responseId`           | `string`   | ID de la respuesta evaluada                                | `FK -> Response`, `not null` |
| `userId`               | `string`   | Usuario que hizo la evaluación                             | `FK -> User`, `not null`  |
| `rating`               | `int`      | Calificación de 1 a 5                                      | `1 <= x <= 5`             |
| `isHelpful`            | `boolean`  | ¿Fue útil la respuesta?                                    | `not null`                |
| `comment`              | `string`   | Comentario libre                                           | `optional`                |
| `categories`           | `string[]` | Categorías del feedback (ej: `accuracy`, `clarity`)        | `optional`                |
| `tags`                 | `string[]` | Etiquetas específicas                                      | `optional`                |
| `suggestedImprovements`| `string`   | Sugerencias de mejora                                      | `optional`                |
| `documentIds`          | `string[]` | Documentos referenciados en la respuesta evaluada          | `optional`                |
| `createdAt`            | `date`     | Fecha de creación                                          | `not null`                |
| `updatedAt`            | `date`     | Fecha de última modificación                               | `not null`                |

---

## Infraestructura y despliegue

### Diagrama de despliegue

El diagrama se centra en las tres características principales:

1. Búsqueda de Documentos por Palabras Clave
El flujo de despliegue prioriza:
- Indexación eficiente de documentos de Confluence en la base de datos vectorial (VectorDB)
- Optimización de consultas semánticas para búsqueda rápida
- Formateo claro de resultados para presentación en Slack

2. Respuestas a Preguntas Administrativas
El despliegue incluye:
- Base de datos MongoDB con información administrativa estructurada
- Cache Redis para respuestas frecuentes, reduciendo latencia
- Mecanismo de actualización automática cuando cambia la documentación fuente

3. Resumen de Documentos
La implementación considera:
- Configuración optimizada del adaptador LLM para generación de resúmenes
- Control de costos mediante cache de resúmenes frecuentes
- Mecanismos de limitación de tamaño para documentos extensos

```
%%{init: {'theme': 'neutral'}}%%
flowchart TD
    %% Usuarios y servicios externos
    UserSlack([Usuario de Teravision\nen Slack])
    SlackAPI([Slack API])
    ConfluenceAPI([Confluence API])
    LLM([Servicio LLM\nOpenAI/Claude])
    
    %% Infraestructura cloud
    subgraph Cloud ["Infraestructura Cloud"]
        %% Componentes de la aplicación
        subgraph AppCluster ["Cluster de Aplicación"]
            ApiGateway["API Gateway\n(Express + Node.js)"]
            CoreService["Servicio Central\n(Dominio Core)"]
            SlackAdapter["Adaptador Slack\n(Bolt.js)"]
            ConfluenceAdapter["Adaptador Confluence"]
            LLMAdapter["Adaptador LLM\n(OpenAI/Claude)"]
        end
        
        %% Bases de datos
        subgraph DataStores ["Almacenamiento de Datos"]
            MongoDB[(MongoDB\nConfiguración y Logs)]
            Redis[(Redis\nCache)]
            VectorDB[(Vector DB\nPinecone/Weaviate)]
        end
        
        %% Servicios de monitoreo
        Logs["Servicio de Logs"]
        Monitor["Monitoreo"]
    end
    
    %% Conexiones entre componentes
    UserSlack -->|Consulta| SlackAPI
    SlackAPI -->|Webhook| ApiGateway
    ApiGateway -->|Adapta mensajes| SlackAdapter
    SlackAdapter -->|Procesa intención| CoreService
    
    %% Búsqueda de documentos (Característica 1)
    CoreService -->|Búsqueda documentos| ConfluenceAdapter
    ConfluenceAdapter -->|Consulta| ConfluenceAPI
    ConfluenceAdapter -->|Indexa| VectorDB
    VectorDB -->|Resultados similares| CoreService
    
    %% Respuestas administrativas (Característica 2)
    CoreService -->|Consulta admin| MongoDB
    MongoDB -->|Obtiene respuestas| CoreService
    CoreService -->|Cache frecuente| Redis
    
    %% Resumen de documentos (Característica 3)
    CoreService -->|Genera resúmenes| LLMAdapter
    LLMAdapter -->|Procesamiento NLP| LLM
    LLM -->|Respuestas procesadas| CoreService
    
    %% Entrega de respuesta al usuario
    CoreService -->|Respuesta formateada| SlackAdapter
    SlackAdapter -->|Envía mensaje| SlackAPI
    SlackAPI -->|Muestra respuesta| UserSlack
    
    %% Monitoreo y logs
    AppCluster -->|Registra eventos| Logs
    DataStores -->|Métricas| Monitor
    
    %% Estilos
    classDef external fill:#D4F1F9,stroke:#05668D,stroke-width:2px
    classDef core fill:#FFEED6,stroke:#F79256,stroke-width:2px
    classDef data fill:#E8E9F3,stroke:#6369D1,stroke-width:2px
    classDef support fill:#D8E1E9,stroke:#6E7E85,stroke-width:2px
    
    class UserSlack,SlackAPI,ConfluenceAPI,LLM external
    class CoreService,SlackAdapter,ConfluenceAdapter,LLMAdapter,ApiGateway core
    class MongoDB,Redis,VectorDB data
    class Logs,Monitor support
```

---

## Épicas para TG: The Guardian - MVP

### Épicas Principales

1. Configuración de Infraestructura Base
**Objetivo:** Establecer la infraestructura fundamental y el entorno de desarrollo necesario para el proyecto.
- Configuración del repositorio con estructura hexagonal
- Implementación de Docker y entorno de desarrollo
- Configuración de CI/CD básico
- Configuración de variables de entorno y secretos

2. Integración con Slack
**Objetivo:** Implementar el punto de entrada para los usuarios a través de Slack.
- Configuración de la App en Slack
- Implementación de webhooks para recibir mensajes
- Desarrollo de comandos básicos de Slack
- Manejo de autenticación y permisos de usuarios

3. Integración con Confluence
**Objetivo:** Permitir la extracción y procesamiento de documentos desde Confluence.
- Implementación del adaptador para la API de Confluence
- Desarrollo del sistema de indexación de documentos
- Implementación de sincronización para mantener la información actualizada
- Mapeo de estructura de Confluence a modelo de datos interno

4. Núcleo de Procesamiento de Lenguaje Natural
**Objetivo:** Implementar la integración con LLM para entender consultas y generar respuestas.
- Configuración del adaptador para OpenAI/Claude
- Implementación de sistemas de prompts para diferentes tipos de consultas
- Desarrollo de procesamiento de intenciones de usuario
- Optimización de la generación de respuestas

5. Búsqueda de Documentos por Palabras Clave
**Objetivo:** Implementar la funcionalidad principal de búsqueda en la documentación.
- Implementación de base de datos vectorial
- Desarrollo de embeddings para documentos
- Implementación de búsqueda semántica
- Formateo de resultados para presentación en Slack

6. Respuestas a Preguntas Administrativas
**Objetivo:** Desarrollar la capacidad de responder a consultas sobre procesos internos.
- Implementación de base de conocimiento para procesos administrativos
- Desarrollo de reconocimiento de intención administrativa
- Implementación de flujos de respuesta para diferentes tipos de consultas
- Integración con documentación específica de HR/Admin

7. Resumen de Documentos y Páginas
**Objetivo:** Implementar la capacidad de resumir contenido extenso de documentos.
- Desarrollo de algoritmos de extracción de contenido relevante
- Implementación de generación de resúmenes con LLM
- Optimización para documentos de diferentes longitudes y formatos
- Formateo de resúmenes para presentación en Slack

8. Persistencia y Caché
**Objetivo:** Implementar el sistema de almacenamiento de datos y caché para optimizar el rendimiento.
- Configuración de MongoDB para datos estructurados
- Implementación de Redis para caché de respuestas frecuentes
- Configuración de base de datos vectorial para búsquedas
- Desarrollo de políticas de expiración y actualización de caché

9. Monitoreo y Observabilidad
**Objetivo:** Implementar sistemas para supervisar el funcionamiento y rendimiento del bot.
- Configuración de logging centralizado
- Implementación de métricas de uso y rendimiento
- Desarrollo de alertas para situaciones críticas
- Implementación de feedback de usuario para mejora continua

### Ejemplos de Stories por Epicas (No oficiales)
**Búsqueda de Documentos**
- Como usuario de Slack, quiero buscar documentación utilizando palabras clave para encontrar información relevante sin tener que navegar por Confluence
- Como nuevo empleado, quiero encontrar rápidamente documentación sobre procesos específicos para adaptarme más rápido

**Respuestas Administrativas**
- Como empleado, quiero conocer el proceso para solicitar un certificado laboral sin tener que consultar a RR.HH.
- Como miembro del equipo, quiero saber cómo solicitar equipos nuevos para agilizar mi flujo de trabajo

**Resumen de Documentos**
- Como líder de equipo, quiero obtener un resumen conciso de documentos extensos para ahorrar tiempo en reuniones
- Como desarrollador, quiero entender rápidamente la esencia de un documento técnico sin tener que leerlo completo

---

## Historias de usuario

### Lista de Historias generales por funcionalidad

#### Funcionalidad 1: Búsqueda de Documentos por Palabras Clave
1. Como un desarrollador backend, quiero buscar documentación sobre el sistema de login para integrarme rápidamente al código existente.
2. Como una diseñadora de niveles, quiero encontrar guías sobre las restricciones de diseño del motor para evitar errores comunes.
3. Como un nuevo empleado, quiero buscar documentación de onboarding para completar mis primeras tareas sin depender de alguien más.
4. Como un QA tester, quiero localizar documentos sobre los criterios de aceptación del proyecto actual para planificar mis pruebas.
5. Como un líder técnico, quiero acceder a los lineamientos de arquitectura para asegurarme de que mi equipo siga las buenas prácticas.
6. Como un artista 3D, quiero buscar especificaciones técnicas sobre texturizado para cumplir con los estándares del proyecto.
7. Como una productora, quiero encontrar las actas de reuniones anteriores para hacer seguimiento de decisiones clave.
8. Como un miembro del equipo de LiveOps, quiero buscar referencias a configuraciones de eventos pasados para reutilizar las mejores prácticas.
9. Como un diseñador de UI, quiero encontrar documentación de estilos de componentes para mantener la coherencia visual.
10. Como un nuevo practicante, quiero buscar información sobre la estructura del equipo y los procesos de comunicación internos.

#### Funcionalidad 2: Respuestas a Preguntas Administrativas
11. Como un empleado nuevo, quiero saber cómo solicitar vacaciones para planificar mi primer viaje personal sin errores.
12. Como un desarrollador senior, quiero conocer el proceso de adquisición de nuevos equipos para pedir un portátil de mejor rendimiento.
13. Como una persona de arte, quiero saber a quién debo acudir si tengo problemas con mi silla ergonómica.
14. Como un empleado, quiero saber cómo solicitar un certificado laboral para poder presentarlo en una solicitud bancaria.
15. Como un productor, quiero consultar cuántos días de permiso me corresponden para planificar mi tiempo libre adecuadamente.
16. Como un miembro de QA, quiero conocer los beneficios de la empresa para entender mis derechos y compensaciones.
17. Como un nuevo miembro del equipo, quiero saber cómo ingresar al sistema de nómina para verificar mis pagos.
18. Como parte del equipo de recursos humanos, quiero revisar fácilmente las políticas de home office para responder dudas comunes.
19. Como cualquier empleado, quiero saber el proceso para reportar ausencias médicas y adjuntar certificados.
20. Como un diseñador, quiero saber si existe un proceso para pedir herramientas de software extra (licencias o plugins).

#### Funcionalidad 3: Resumen de Documentos y Páginas de Confluence
21. Como un desarrollador, quiero obtener un resumen del documento de arquitectura del sistema para entenderlo sin leerlo completo.
22. Como un artista, quiero un resumen del documento de lineamientos visuales del juego para asegurarme de seguir el estilo correcto.
23. Como un nuevo integrante del equipo, quiero que me resuman la documentación de cultura organizacional para adaptarme mejor.
24. Como un líder de proyecto, quiero que me resuman el documento de planificación para compartirlo en la reunión semanal.
25. Como una diseñadora de narrativa, quiero leer un resumen de los documentos de historia para entender el arco principal rápidamente.
26. Como un productor, quiero recibir un resumen de las actualizaciones de herramientas internas para informar al equipo.
27. Como alguien de QA, quiero un resumen del changelog del último sprint para saber qué validar primero.
28. Como un miembro de LiveOps, quiero un resumen de la configuración del evento anterior para decidir si lo replicamos.
29. Como un practicante, quiero resúmenes de documentos largos de onboarding para avanzar más rápido en mi capacitación.
30. Como un administrador, quiero un resumen de las políticas internas actualizadas para distribuirlo fácilmente a los empleados.

### Tabla de Priorizacion de historias de Usuario 
Estas son las 30 historias de usuario organizadas y evaluadas según los 4 criterios:
- Impacto: Valor que aporta en términos de eficiencia.
- Frecuencia: Cuán común es su uso en el flujo diario de trabajo.
- Complejidad: Dificultad técnica estimada para implementarla.
- Riesgo: Grado de riesgo o cantidad de dependencias asociadas.

Escala:
1 = Bajo, 5 = Alto

| #  | Historia                                                               | Impacto | Frecuencia | Complejidad | Riesgo |
|----|-----------------------------------------------------------------------|---------|------------|-------------|--------|
| 1  | Buscar documentación sobre login (Dev Backend)                        | 5       | 4          | 3           | 2      |
| 2  | Guías de restricciones de motor (Diseñadora)                          | 4       | 3          | 3           | 2      |
| 3  | Onboarding documentación (Empleado nuevo)                             | 5       | 5          | 3           | 3      |
| 4  | Criterios de aceptación (QA Tester)                                   | 4       | 4          | 2           | 1      |
| 5  | Lineamientos de arquitectura (Líder técnico)                          | 5       | 3          | 2           | 2      |
| 6  | Especificaciones de texturizado (Artista 3D)                          | 4       | 3          | 3           | 2      |
| 7  | Actas de reuniones (Productora)                                       | 4       | 3          | 2           | 1      |
| 8  | Eventos pasados LiveOps                                               | 3       | 3          | 3           | 2      |
| 9  | Estilos UI (Diseñador)                                                | 3       | 2          | 2           | 1      |
| 10 | Procesos internos y estructura (Practicante)                          | 5       | 4          | 3           | 2      |
| 11 | Solicitar vacaciones (Empleado nuevo)                                 | 5       | 5          | 2           | 1      |
| 12 | Adquisición de equipos (Dev senior)                                   | 4       | 3          | 2           | 2      |
| 13 | Reporte de problemas ergonómicos (Arte)                               | 3       | 2          | 2           | 1      |
| 14 | Certificado laboral (Empleado)                                        | 4       | 4          | 2           | 1      |
| 15 | Consulta de días de permiso (Productor)                               | 4       | 3          | 2           | 1      |
| 16 | Beneficios de la empresa (QA)                                         | 3       | 2          | 2           | 1      |
| 17 | Acceso al sistema de nómina (Empleado nuevo)                          | 4       | 3          | 3           | 2      |
| 18 | Políticas de home office (HR)                                         | 3       | 3          | 2           | 2      |
| 19 | Reportar ausencias médicas (Empleado)                                 | 4       | 3          | 3           | 2      |
| 20 | Solicitud de licencias/plugins (Diseñador)                            | 3       | 2          | 2           | 1      |
| 21 | Resumen de documento de arquitectura (Dev)                            | 5       | 4          | 3           | 2      |
| 22 | Resumen de lineamientos visuales (Arte)                               | 4       | 3          | 3           | 2      |
| 23 | Resumen de cultura organizacional (Nuevo miembro)                     | 5       | 4          | 3           | 3      |
| 24 | Resumen de planificación (Líder de proyecto)                          | 4       | 3          | 3           | 2      |
| 25 | Resumen de narrativa (Diseñadora)                                     | 4       | 3          | 2           | 1      |
| 26 | Resumen de herramientas internas (Productor)                          | 4       | 2          | 2           | 2      |
| 27 | Resumen de changelog de sprint (QA)                                   | 4       | 4          | 3           | 2      |
| 28 | Resumen de eventos anteriores (LiveOps)                               | 3       | 3          | 3           | 2      |
| 29 | Resumen de onboarding (Practicante)                                   | 5       | 5          | 3           | 3      |
| 30 | Resumen de políticas internas (Administrador)                         | 4       | 4          | 2           | 2      |

### Clasificacion de historias usando MOSCOW

Categoría	Significado
M (Must have)	Historias críticas para el éxito del MVP. Alta prioridad en impacto y frecuencia.
S (Should have)	Historias importantes, pero no críticas. Se pueden postergar si hay limitaciones.
C (Could have)	Historias deseables que aportan valor, pero no son urgentes.
W (Won't have for now)	No se implementarán en esta versión. Se dejan para el futuro.

| # | Historia                                                                 | M/S/C/W |
|----|------------------------------------------------------------------------|---------|
| 1  | Buscar documentación sobre login (Dev Backend)                        | M       |
| 2  | Guías de restricciones de motor (Diseñadora)                          | S       |
| 3  | Onboarding documentación (Empleado nuevo)                             | M       |
| 4  | Criterios de aceptación (QA Tester)                                   | S       |
| 5  | Lineamientos de arquitectura (Líder técnico)                          | M       |
| 6  | Especificaciones de texturizado (Artista 3D)                          | C       |
| 7  | Actas de reuniones (Productora)                                       | C       |
| 8  | Eventos pasados LiveOps                                               | C       |
| 9  | Estilos UI (Diseñador)                                                | C       |
| 10 | Procesos internos y estructura (Practicante)                          | M       |
| 11 | Solicitar vacaciones (Empleado nuevo)                                 | M       |
| 12 | Adquisición de equipos (Dev senior)                                   | S       |
| 13 | Reporte de problemas ergonómicos (Arte)                               | W       |
| 14 | Certificado laboral (Empleado)                                        | M       |
| 15 | Consulta de días de permiso (Productor)                               | S       |
| 16 | Beneficios de la empresa (QA)                                         | C       |
| 17 | Acceso al sistema de nómina (Empleado nuevo)                          | S       |
| 18 | Políticas de home office (HR)                                         | C       |
| 19 | Reportar ausencias médicas (Empleado)                                 | S       |
| 20 | Solicitud de licencias/plugins (Diseñador)                            | W       |
| 21 | Resumen de documento de arquitectura (Dev)                            | M       |
| 22 | Resumen de lineamientos visuales (Arte)                               | S       |
| 23 | Resumen de cultura organizacional (Nuevo miembro)                     | M       |
| 24 | Resumen de planificación (Líder de proyecto)                          | S       |
| 25 | Resumen de narrativa (Diseñadora)                                     | C       |
| 26 | Resumen de herramientas internas (Productor)                          | C       |
| 27 | Resumen de changelog de sprint (QA)                                   | S       |
| 28 | Resumen de eventos anteriores (LiveOps)                               | C       |
| 29 | Resumen de onboarding (Practicante)                                   | M       |
| 30 | Resumen de políticas internas (Administrador)                         | S       |

De esta lista , las 10 historias mas importantes, seleccionadas con base en:

Impacto = 4 o 5
Frecuencia = 4 o 5
Y balance entre complejidad y riesgo razonables (≤3)

fueron:

| # | Historia                                                                 | Motivo (resumen)                                   |
|----|------------------------------------------------------------------------|----------------------------------------------------|
| 1  | Buscar documentación sobre login (Dev Backend)                        | Alta demanda, base técnica, alta reutilización     |
| 3  | Onboarding documentación (Empleado nuevo)                             | Esencial para cualquier nuevo ingreso              |
| 5  | Lineamientos de arquitectura (Líder técnico)                          | Alta relevancia técnica, mantiene calidad de código|
| 10 | Procesos internos y estructura (Practicante)                          | Ayuda a nuevos empleados a integrarse              |
| 11 | Solicitar vacaciones (Empleado nuevo)                                 | Casos frecuentes, soporte administrativo clave     |
| 14 | Certificado laboral (Empleado)                                        | Trámite muy solicitado por empleados               |
| 21 | Resumen de documento de arquitectura (Dev)                            | Reduce carga cognitiva, agiliza decisiones         |
| 23 | Resumen de cultura organizacional (Nuevo miembro)                     | Clave para integración al equipo                   |
| 27 | Resumen de changelog de sprint (QA)                                   | Mejora eficiencia en validaciones y testing        |
| 29 | Resumen de onboarding (Practicante)                                   | Ahorra tiempo en capacitaciones básicas            |

### Historias seleccionadas en detalles

#### 1. [Búsqueda] Como un desarrollador backend, quiero buscar documentación sobre el sistema de login para integrarme rápidamente al código existente.

**Descripción:**  
Los desarrolladores nuevos o actuales necesitan acceder rápidamente a la documentación técnica del sistema de login sin depender de compañeros o perder tiempo navegando en Confluence.

**Criterios de Aceptación:**  
- El bot responde a consultas como "documentación del sistema de login".
- La respuesta contiene al menos un enlace válido a Confluence.
- Se incluye un resumen corto (máx 3 líneas) del contenido del documento.
- El documento referenciado está activo y actualizado.

**Notas Adicionales:**  
Permitir sugerencias contextuales si se detectan documentos similares.

**Historias Relacionadas:**  
- Resumen de documento de arquitectura  
- Onboarding técnico para nuevos desarrolladores

#### 2. [Onboarding] Como un nuevo empleado, quiero buscar documentación de onboarding para completar mis primeras tareas sin depender de alguien más.

**Descripción:**  
Facilitar el proceso de integración de nuevos empleados automatizando el acceso a guías de bienvenida, estructura del equipo, y herramientas.

**Criterios de Aceptación:**  
- El bot puede responder a "onboarding", "guía de bienvenida", "primer día".
- La respuesta debe incluir una lista mínima de 3 documentos clave.
- Los documentos deben cubrir: estructura del equipo, herramientas básicas y normas de comunicación.
- Se presentan enlaces a dichos documentos con resúmenes.

**Notas Adicionales:**  
Reforzar con sugerencias del sistema según el rol del usuario.

**Historias Relacionadas:**  
- Resumen de onboarding  
- Procesos internos y estructura del equipo

#### 3. [Búsqueda] Como un líder técnico, quiero acceder a los lineamientos de arquitectura para asegurarme de que mi equipo siga las buenas prácticas.

**Descripción:**  
Evitar decisiones técnicas inconsistentes mediante el acceso rápido a guías de arquitectura aprobadas.

**Criterios de Aceptación:**  
- El bot reconoce términos como "guía arquitectura", "principios técnicos", "patrones backend".
- La respuesta enlaza con documentos activos y clasificados como oficiales.
- Se priorizan documentos revisados en los últimos 6 meses.

**Notas Adicionales:**  
Podría incluir recomendaciones automáticas de documentos relacionados.

**Historias Relacionadas:**  
- Documentación de diseño técnico  
- Resumen de arquitectura

#### 4. [Organización] Como un practicante, quiero buscar información sobre la estructura del equipo y los procesos internos para entender cómo funciona la empresa.

**Descripción:**  
Permitir a nuevos miembros entender con claridad cómo se organiza Teravision y a quién acudir para diferentes tipos de tareas.

**Criterios de Aceptación:**  
- El bot responde a preguntas como "estructura del equipo", "cómo se organizan", "jerarquía".
- Proporciona una lista de al menos 2 documentos que describan la organización y procesos internos.
- Respuestas diferenciadas por rol (ej: artista, dev, QA, etc.).

**Notas Adicionales:**  
Incluir un resumen explicativo de alto nivel para nuevos usuarios.

**Historias Relacionadas:**  
- Onboarding  
- Cultura organizacional

#### 5. [Administrativo] Como un empleado nuevo, quiero saber cómo solicitar vacaciones para planificar mi primer viaje personal sin errores.

**Descripción:**  
Reducir la carga en el equipo de RR.HH. proporcionando respuestas automatizadas sobre procedimientos de vacaciones.

**Criterios de Aceptación:**  
- El bot responde correctamente a consultas como "cómo pido vacaciones".
- Se enlaza al documento o formulario oficial en Confluence.
- Se indican los pasos resumidos y tiempos esperados para aprobación.

**Notas Adicionales:**  
El proceso debe reflejar posibles aprobaciones jerárquicas si aplica.

**Historias Relacionadas:**  
- Certificados laborales  
- Días de permiso

#### 6. [Administrativo] Como un empleado, quiero saber cómo solicitar un certificado laboral para poder presentarlo en una solicitud bancaria.

**Descripción:**  
Automatizar uno de los trámites administrativos más comunes a través del bot en Slack.

**Criterios de Aceptación:**  
- El bot debe responder a "certificado laboral" o variantes similares.
- Se indica el link directo al formulario o se detalla a quién contactar.
- Se muestra un mensaje que incluye tiempo estimado de respuesta del área responsable.

**Notas Adicionales:**  
Agregar seguimiento automático si pasan más de X días sin respuesta (fase futura).

**Historias Relacionadas:**  
- Solicitud de vacaciones  
- Procesos administrativos frecuentes

#### 7. [Resumen] Como un desarrollador, quiero obtener un resumen del documento de arquitectura del sistema para entenderlo sin leerlo completo.

**Descripción:**  
Reducir el tiempo de lectura de documentos técnicos extensos mediante resúmenes generados por el bot.

**Criterios de Aceptación:**  
- El bot puede recibir un link de Confluence o nombre del documento como entrada.
- La respuesta contiene: resumen de 5 líneas + puntos clave (bullet points).
- El resumen es generado con LLM y validado por QA.

**Notas Adicionales:**  
Permitir expandir el resumen con un comando adicional ("+ detalles").

**Historias Relacionadas:**  
- Búsqueda de login  
- Resumen de herramientas técnicas

#### 8. [Resumen] Como un nuevo miembro del equipo, quiero que me resuman la documentación de cultura organizacional para adaptarme mejor.

**Descripción:**  
Facilitar la comprensión del "cómo trabajamos aquí" sin leer múltiples páginas dispersas.

**Criterios de Aceptación:**  
- El bot responde a consultas como "cultura organizacional", "valores de la empresa".
- El contenido debe venir de fuentes oficiales (ej: manual del colaborador).
- Respuesta contiene resumen + valores clave en lista.

**Notas Adicionales:**  
Ideal como sugerencia automática en el primer login del bot para nuevos usuarios.

**Historias Relacionadas:**  
- Onboarding  
- Estructura del equipo

#### 9. [Resumen] Como un QA, quiero un resumen del changelog del último sprint para saber qué validar primero.

**Descripción:**  
Ayudar al equipo de QA a priorizar pruebas sin revisar manualmente todo el changelog.

**Criterios de Aceptación:**  
- El bot puede procesar una URL de changelog o referencia textual.
- El resumen prioriza cambios funcionales, bugs corregidos y nuevas features.
- Se incluye fecha y equipo responsable.

**Notas Adicionales:**  
Podría integrarse con Jira en el futuro.

**Historias Relacionadas:**  
- Validaciones por QA  
- Documentación de entregables

#### 10. [Resumen] Como un practicante, quiero resúmenes de documentos largos de onboarding para avanzar más rápido en mi capacitación.

**Descripción:**  
Mejorar la experiencia de integración de practicantes ofreciendo acceso rápido a lo esencial.

**Criterios de Aceptación:**  
- El bot reconoce consultas como "resumen onboarding", "guía rápida de entrada".
- El resumen incluye: canales de comunicación, herramientas básicas y reglas internas.
- La respuesta contiene enlaces adicionales a recursos complementarios.

**Notas Adicionales:**  
Ideal para activarse automáticamente durante la primera semana de uso.

**Historias Relacionadas:**  
- Onboarding técnico  
- Cultura organizacional

---

## Analisis de Problemas Potenciales y Mejoras Sugeridas

1. Ambigüedad en las búsquedas por lenguaje natural
- Problema: Los usuarios podrían realizar consultas demasiado generales o ambiguas, lo que generaría resultados irrelevantes o poco precisos.
- Mejora sugerida: 
* Implementar una función de "reformulación de consulta" cuando el sistema detecte baja confianza en los resultados.
* Ofrecer filtros posteriores (por equipo, departamento, tipo de documento, etc.) para afinar resultados.

2. Falta de confianza en la veracidad o actualidad de la información
- Problema: Los usuarios podrían dudar si la información recuperada está actualizada o es la fuente oficial.
- Mejora sugerida:
* Mostrar siempre la fecha de última edición y autor del documento al entregar respuestas.
* Incluir un indicador visual de "documento verificado" o "fuente oficial" para generar confianza.

3. Saturación de respuestas largas o poco escaneables
- Problema: Algunos usuarios podrían sentirse abrumados por respuestas muy extensas o no jerarquizadas.
- Mejora sugerida:
* Aplicar un formato estándar para cada tipo de respuesta: títulos, bullets, highlights.
* Permitir al usuario elegir el formato por defecto: "concise", "detailed" o "bullet points".

4. Curva de aprendizaje de comandos y funcionalidades
- Problema: Usuarios nuevos o no técnicos pueden no saber cómo interactuar con TG (qué comandos usar, qué puede hacer el bot).
- Mejora sugerida:
* Incluir un comando de ayuda (/tg-help) con ejemplos de uso por rol.
* Proporcionar sugerencias inteligentes basadas en el historial del usuario o preguntas frecuentes.

5. Información administrativa desactualizada o poco estructurada
- Problema: La base de datos administrativa puede no mantenerse al día con cambios internos en procesos o responsables.
- Mejora sugerida:
* Integrar notificaciones automáticas a RR.HH./Admin cuando una fuente referenciada cambia.
* Agregar un mecanismo de "reportar información obsoleta" con un solo clic desde Slack.

---

## Lista de Tickets para crear funcionalidades principales

### FUNCIONALIDAD: Búsqueda de Documentación de Onboarding

#### 1. [BACKEND] Endpoint de búsqueda semántica para onboarding

**Descripción:**  
Implementar un endpoint REST que reciba una consulta relacionada con onboarding, identifique intención, consulte la base de vectores y devuelva documentos relevantes.

**Tipo de ticket:** Feature  
**Área:** Backend  
**Propósito:** Permitir al bot procesar consultas sobre documentación de onboarding de forma inteligente.  
**Detalles específicos:**  
- Crear ruta `/query/onboarding` en `QueryController`
- Invocar `IntentInterpreterService` con el texto de entrada
- Consultar VectorDB + MongoDB
- Devolver estructura con resumen y enlaces

**Criterios de aceptación:**  
- Respuesta JSON contiene mínimo 2 documentos con `title`, `url`, `contentSummary`
- Tiempo de respuesta < 1500ms
- Se persiste la consulta en colección `Query`

**Prioridad:** Alta  
**Estimado de esfuerzo:** 8h  
**Etiquetas:** backend, onboarding, búsqueda, MVP  
**Comentarios y notas:** Asegúrate de que esté desacoplado para otras categorías futuras (onboarding es un tipo más).

#### 2. [FRONTEND] Formatear respuesta de onboarding para Slack

**Descripción:**  
Renderizar en Slack la respuesta del backend con bloques visuales que incluyan los títulos de documentos, resúmenes y botones de acción.

**Tipo de ticket:** Feature  
**Área:** Frontend  
**Propósito:** Presentar resultados de búsqueda de onboarding de forma clara y útil al usuario.  
**Detalles específicos:**  
- Usar Bolt.js y Slack Block Kit
- Incluir bloques: encabezado, lista de documentos, resumen corto, botones "Ver más"
- Mostrar marca visual del bot

**Criterios de aceptación:**  
- Bloques renderizados en DM y canales
- Botones funcionan correctamente (aunque no estén conectados aún)
- Diseño responde bien en móvil y desktop

**Prioridad:** Alta  
**Estimado de esfuerzo:** 5h  
**Etiquetas:** frontend, slack, presentación, MVP  
**Comentarios y notas:** Reutilizar estructura para otros tipos de respuesta (resumen, administrativo).

#### 3. [BASE DE DATOS] Indexar documentos de onboarding en MongoDB y VectorDB

**Descripción:**  
Poblar manualmente documentos clave de onboarding en la base de datos, con sus respectivos embeddings generados y metadatos.

**Tipo de ticket:** Feature  
**Área:** Base de datos  
**Propósito:** Tener material real indexado para responder consultas de onboarding.  
**Detalles específicos:**  
- Insertar al menos 3 documentos reales o mock
- Generar embeddings (GPT/CLIP) y almacenar en VectorDB
- Asociar metadata relevante: tags, categorías, resumen, keyPoints

**Criterios de aceptación:**  
- Documentos aparecen en la colección `Document` con campo `tags: ["onboarding"]`
- Los embeddings están almacenados y asociados por `vectorId`
- Se puede probar consulta y obtener resultados

**Prioridad:** Alta  
**Estimado de esfuerzo:** 6h  
**Etiquetas:** database, onboarding, embeddings  
**Comentarios y notas:** Usar seed script y preparar para automatización futura.

#### 4. [BACKEND] Registro y cacheo de consultas de onboarding

**Descripción:**  
Almacenar cada consulta de onboarding en MongoDB y cachear respuestas frecuentes para acelerar futuras consultas similares.

**Tipo de ticket:** Improvement  
**Área:** Backend  
**Propósito:** Optimizar el rendimiento y trazabilidad del bot ante múltiples consultas similares.  
**Detalles específicos:**  
- Guardar cada `Query` con `queryHash`, `type: "search"`, `intent: "onboarding"`
- Implementar cache en Redis con TTL de 2 horas
- Evitar duplicación innecesaria de consultas

**Criterios de aceptación:**  
- Cada búsqueda se guarda como nuevo documento en `Query`
- Si la consulta ya existe, se obtiene desde Redis
- TTL puede configurarse desde `.env`

**Prioridad:** Media  
**Estimado de esfuerzo:** 4h  
**Etiquetas:** backend, optimización, cache  
**Comentarios y notas:** Fundamental para escalar, aunque no lo perciba el usuario.

#### 5. [FRONTEND] Comando personalizado `/tg-search onboarding` en Slack

**Descripción:**  
Configurar un comando dedicado en Slack para que el usuario no tenga que escribir la intención completa.

**Tipo de ticket:** Feature  
**Área:** Frontend  
**Propósito:** Hacer más accesible la búsqueda de onboarding con una experiencia simplificada.  
**Detalles específicos:**  
- Registrar comando `/tg-search onboarding` en Slack App
- Enviar automáticamente `text: "onboarding"`
- Mostrar feedback inmediato de que el bot está procesando

**Criterios de aceptación:**  
- Comando registrado y funcional
- Devuelve resultados de backend correctamente
- Se muestra un mensaje tipo "Buscando documentación de onboarding..."

**Prioridad:** Media  
**Estimado de esfuerzo:** 3h  
**Etiquetas:** frontend, slack, UX, comandos  
**Comentarios y notas:** Esto reduce fricción para usuarios nuevos no técnicos.

#### 6. [RESEARCH] Definir conjunto de documentos mínimos para onboarding

**Descripción:**  
Investigar y seleccionar (o crear mocks) de los documentos clave de onboarding que el sistema debería indexar.

**Tipo de ticket:** Research  
**Área:** Base de datos / General  
**Propósito:** Establecer el contenido mínimo viable para cubrir la historia del nuevo empleado.  
**Detalles específicos:**  
- Revisar estructura actual de Confluence
- Identificar 3-5 documentos que respondan a: bienvenida, herramientas, cultura, procesos
- Crear mocks en caso de que no existan aún

**Criterios de aceptación:**  
- Lista definida con nombres y URLs o rutas
- Aprobación rápida con stakeholders (si aplica)
- Documentos disponibles para ser cargados

**Prioridad:** Alta  
**Estimado de esfuerzo:** 3h  
**Etiquetas:** research, onboarding, documentación  
**Comentarios y notas:** Ideal completarlo al principio del ciclo, para desbloquear los otros tickets.

### FUNCIONALIDAD: Solicitud de Vacaciones (Respuestas Administrativas)

#### 1. [BACKEND] Endpoint para respuestas administrativas sobre vacaciones

**Descripción:**  
Implementar un endpoint que procese consultas relacionadas con la solicitud de vacaciones, identifique la intención y devuelva la respuesta oficial desde la base de conocimiento.

**Tipo de ticket:** Feature  
**Área:** Backend  
**Propósito:** Automatizar respuestas sobre procesos administrativos frecuentes.  
**Detalles específicos:**  
- Crear ruta `/admin/vacaciones`
- Detectar intención administrativa con `IntentInterpreterService`
- Buscar en base de datos por tipo `admin` y categoría `vacaciones`
- Devolver texto formateado con pasos, enlace al formulario y responsable

**Criterios de aceptación:**  
- Consulta como "¿cómo pido vacaciones?" retorna respuesta con pasos y enlace
- El texto proviene de un documento oficial en MongoDB
- Se registra la consulta en `Query` y la respuesta en `Response`

**Prioridad:** Alta  
**Estimado de esfuerzo:** 6h  
**Etiquetas:** backend, vacaciones, admin, MVP  
**Comentarios y notas:** Reutilizable para otras respuestas administrativas (ej: certificados, licencias).

#### 2. [FRONTEND] Mostrar pasos para solicitud de vacaciones en Slack

**Descripción:**  
Formatear la respuesta sobre vacaciones para Slack utilizando bloques visuales (pasos, botón al formulario, resumen claro).

**Tipo de ticket:** Feature  
**Área:** Frontend  
**Propósito:** Proporcionar al usuario una experiencia clara, confiable y guiada para este proceso.  
**Detalles específicos:**  
- Mostrar lista de pasos (ej: notificar líder, llenar formulario, esperar aprobación)
- Incluir botón "Ir al Formulario"
- Agregar ícono o marca visual del bot

**Criterios de aceptación:**  
- Renderiza correctamente en móvil y escritorio
- El botón lleva al enlace correcto (mock o real)
- Mensaje es amigable, claro y no excede los 1000 caracteres

**Prioridad:** Alta  
**Estimado de esfuerzo:** 4h  
**Etiquetas:** frontend, slack, ux, vacaciones  
**Comentarios y notas:** Validar con alguien de RR.HH. si el lenguaje es apropiado.

#### 3. [BASE DE DATOS] Ingresar documento de proceso de vacaciones en MongoDB

**Descripción:**  
Registrar un documento oficial con los pasos para solicitud de vacaciones, formateado con metadatos y lista para búsquedas.

**Tipo de ticket:** Feature  
**Área:** Base de datos  
**Propósito:** Permitir que el bot tenga una fuente oficial desde la cual generar respuestas administrativas.  
**Detalles específicos:**  
- Insertar documento en colección `Document` con:
  - `title`: "Proceso solicitud de vacaciones"
  - `tags`: ["admin", "vacaciones"]
  - `contentSummary`: breve resumen
  - `plainText`: pasos detallados
  - `keyPoints`: ["Notificar líder", "Formulario", "Aprobación de RRHH"]

**Criterios de aceptación:**  
- Documento es visible y recuperable por categoría `vacaciones`
- Campo `active: true` y `isSynced: true`
- Puede ser accedido vía query semántica simple

**Prioridad:** Alta  
**Estimado de esfuerzo:** 3h  
**Etiquetas:** base de datos, documento, admin  
**Comentarios y notas:** Crear mock si no existe aún en Confluence.

#### 4. [BACKEND] Registro, feedback y cacheo de respuestas administrativas

**Descripción:**  
Registrar cada consulta relacionada con vacaciones, cachear la respuesta y permitir reuso si se repite una pregunta similar.

**Tipo de ticket:** Improvement  
**Área:** Backend  
**Propósito:** Mejorar rendimiento y permitir trazabilidad de consultas administrativas.  
**Detalles específicos:**  
- Guardar `Query` con `type: "admin"`, `intent: "vacaciones"`
- Guardar `Response` asociada
- Implementar Redis con TTL para reutilizar la respuesta por 6 horas

**Criterios de aceptación:**  
- Si una consulta ya fue respondida, se responde desde cache
- La consulta se vincula correctamente a una `Response`
- Feedback opcional puede ser registrado (en futuro)

**Prioridad:** Media  
**Estimado de esfuerzo:** 4h  
**Etiquetas:** backend, cache, feedback  
**Comentarios y notas:** Base para sistema de mejoras futuras con retroalimentación.

#### 5. [RESEARCH] Identificar y validar proceso actual de solicitud de vacaciones

**Descripción:**  
Revisar el proceso vigente de solicitud de vacaciones en Confluence o con RR.HH. para asegurar que la respuesta del bot sea correcta y oficial.

**Tipo de ticket:** Research  
**Área:** General / Documentación  
**Propósito:** Tener una fuente confiable y validada para alimentar la funcionalidad.  
**Detalles específicos:**  
- Localizar documento real (si existe)
- Confirmar pasos y contacto responsable
- Crear mock en caso de que no haya fuente oficial

**Criterios de aceptación:**  
- Documento fuente validado y accesible
- Si no existe, se crea texto base revisado con RR.HH.
- Se aprueba para indexación

**Prioridad:** Alta  
**Estimado de esfuerzo:** 2h  
**Etiquetas:** research, vacaciones, admin  
**Comentarios y notas:** Debe hacerse antes de implementar backend, idealmente semana 1 o 2.

#### 6. [FRONTEND] Comando `/tg-admin vacaciones` en Slack

**Descripción:**  
Configurar un comando específico para vacaciones que active el flujo de respuesta administrativa sin escribir una consulta larga.

**Tipo de ticket:** Feature  
**Área:** Frontend  
**Propósito:** Hacer más accesible la información administrativa para nuevos empleados.  
**Detalles específicos:**  
- Configurar comando `/tg-admin vacaciones`
- Mensaje automático de confirmación: "Procesando solicitud…"
- Conectar con endpoint `/admin/vacaciones`

**Criterios de aceptación:**  
- Comando registrado en la App de Slack
- El flujo funciona y entrega la respuesta de forma inmediata
- Compatible con otros comandos futuros

**Prioridad:** Media  
**Estimado de esfuerzo:** 3h  
**Etiquetas:** frontend, slack, admin  
**Comentarios y notas:** Este flujo puede replicarse para otras solicitudes administrativas.

### FUNCIONALIDAD: Resumen del documento de arquitectura

#### 1. [BACKEND] Endpoint para generar resumen de documento técnico

**Descripción:**  
Implementar un endpoint que reciba una URL de Confluence o referencia textual, recupere el documento, y genere un resumen corto y estructurado con LLM.

**Tipo de ticket:** Feature  
**Área:** Backend  
**Propósito:** Procesar documentos extensos automáticamente y devolver un resumen útil para los desarrolladores.  
**Detalles específicos:**  
- Crear endpoint `/summary/architecture`
- Validar y extraer texto completo desde Confluence vía adaptador
- Llamar a LLM (GPT-3.5 o Claude) para generar resumen + key points
- Devolver estructura clara con `summary`, `keyPoints`, `documentId`

**Criterios de aceptación:**  
- El texto resumido no supera 1000 caracteres
- El resultado incluye al menos 3 bullets clave
- El documento es identificado correctamente (ID o URL)

**Prioridad:** Alta  
**Estimado de esfuerzo:** 8h  
**Etiquetas:** backend, resumen, llm, arquitectura  
**Comentarios y notas:** Usar prompt específico y técnico, revisar redacción del output.

#### 2. [FRONTEND] Renderizar resumen de arquitectura en Slack

**Descripción:**  
Presentar el resumen generado del documento en Slack en bloques visuales que incluyan: resumen principal, puntos clave y botón para leer el documento completo.

**Tipo de ticket:** Feature  
**Área:** Frontend  
**Propósito:** Permitir a desarrolladores entender rápidamente un documento largo sin salir de Slack.  
**Detalles específicos:**  
- Bloques: título del documento, resumen corto, bullets, botón "Leer completo"
- Incluir ícono o imagen de arquitectura (si aplica)
- Debe ser limpio y legible en móvil

**Criterios de aceptación:**  
- Texto y bullets bien formateados
- El botón lleva correctamente a Confluence
- Compatible con texto generado automáticamente (sin HTML crudo)

**Prioridad:** Alta  
**Estimado de esfuerzo:** 5h  
**Etiquetas:** frontend, slack, resumen  
**Comentarios y notas:** Ideal incluir fallback si el resumen no puede generarse (ej: documento demasiado corto).

#### 3. [BASE DE DATOS] Almacenar resumen generado del documento de arquitectura

**Descripción:**  
Guardar el resultado del resumen para futuras consultas, optimización y trazabilidad, evitando resúmenes duplicados o innecesarios.

**Tipo de ticket:** Feature  
**Área:** Base de datos  
**Propósito:** Registrar cada resumen generado para acceso futuro y control de versiones.  
**Detalles específicos:**  
- Crear entrada en colección `Response` vinculada a la consulta original
- Incluir: `documentId`, `summary`, `keyPoints`, `modelUsed`, `createdAt`
- Relacionar con usuario y query

**Criterios de aceptación:**  
- Cada resumen queda asociado a su documento (`documentId`)
- Si se vuelve a pedir, se entrega versión almacenada si no ha cambiado el documento
- Guardar hash del contenido y fecha de última edición para control de versiones

**Prioridad:** Media  
**Estimado de esfuerzo:** 4h  
**Etiquetas:** base de datos, llm, persistencia  
**Comentarios y notas:** Útil para retroalimentación y análisis futuro de calidad de respuestas.

#### 4. [BACKEND] Cache y control de duplicados de resumen

**Descripción:**  
Evitar costos innecesarios de LLM y mejorar el rendimiento con cache de resúmenes ya generados.

**Tipo de ticket:** Improvement  
**Área:** Backend  
**Propósito:** Evitar llamadas repetidas a LLM para el mismo documento sin cambios.  
**Detalles específicos:**  
- Verificar `contentHash` del documento
- Si existe un resumen para ese hash en Redis o MongoDB, reutilizarlo
- TTL opcional en Redis (12 horas)

**Criterios de aceptación:**  
- Si el resumen existe para el mismo documento sin cambios, no se llama a LLM
- El resumen se actualiza solo si el documento cambió
- El proceso debe ser transparente para el usuario

**Prioridad:** Media  
**Estimado de esfuerzo:** 4h  
**Etiquetas:** backend, optimización, cache  
**Comentarios y notas:** Ahorra costos directos por tokens de modelo y mejora experiencia.

#### 5. [FRONTEND] Comando personalizado `/tg-summary [URL]` para documentos

**Descripción:**  
Permitir a los usuarios ejecutar directamente la funcionalidad de resumen desde Slack mediante un comando estructurado.

**Tipo de ticket:** Feature  
**Área:** Frontend  
**Propósito:** Habilitar una entrada clara y reutilizable a la función de resumen.  
**Detalles específicos:**  
- Configurar comando `/tg-summary [URL]` en Slack
- Validar que el parámetro sea una URL de Confluence
- Mostrar mensaje de "Procesando resumen..."

**Criterios de aceptación:**  
- El comando activa la función correctamente
- La respuesta llega en menos de 2s de feedback inicial
- Se puede usar tanto en canales como mensajes directos

**Prioridad:** Media  
**Estimado de esfuerzo:** 3h  
**Etiquetas:** frontend, slack, comando  
**Comentarios y notas:** Ideal para testers y developers que conocen la URL exacta.

#### 6. [RESEARCH] Definir prompt para resumen técnico de arquitectura

**Descripción:**  
Diseñar y probar un prompt que funcione de forma efectiva con el modelo LLM para generar resúmenes técnicos útiles.

**Tipo de ticket:** Research  
**Área:** Backend / LLM  
**Propósito:** Garantizar que los resúmenes generados tengan el nivel adecuado de detalle y legibilidad.  
**Detalles específicos:**  
- Probar diferentes prompts con 1 o 2 documentos reales de arquitectura
- Evaluar resultados: legibilidad, relevancia, completitud
- Elegir prompt base para MVP

**Criterios de aceptación:**  
- Se documentan al menos 2 prompts con ejemplos de resultado
- Uno de ellos se selecciona y se deja como versión base
- El prompt puede ser parametrizado si es necesario (bullet points vs texto)

**Prioridad:** Alta  
**Estimado de esfuerzo:** 3h  
**Etiquetas:** research, llm, resumen, arquitectura  
**Comentarios y notas:** Esta decisión impacta la calidad de todo el sistema de resumen.

---

## ✅ Checklist Técnico de Seguridad - TG: The Guardian

Este checklist contempla las principales medidas de seguridad que deben implementarse para proteger el acceso, uso y almacenamiento de información sensible dentro del producto.

### 🔐 Control de Accesos y Autenticación
- [ ] Verificar que cada usuario esté autenticado correctamente mediante Slack OAuth.
- [ ] Implementar control de acceso basado en roles (RBAC) para restringir qué puede consultar cada tipo de usuario.
- [ ] Respetar los permisos definidos en Confluence al mostrar resultados.
- [ ] Registrar cada solicitud con su `userId` y canal de origen para trazabilidad.

### 🧠 Protección de la Información Resumida (LLM)
- [ ] Validar que los resúmenes generados no incluyan datos sensibles (credenciales, rutas internas, información personal).
- [ ] Implementar un sistema de filtrado automático para detectar y remover contenido riesgoso en las respuestas.
- [ ] Establecer un límite de longitud y detalle para resúmenes generados.

### 💾 Seguridad en Logs y Cache
- [ ] Encriptar información sensible almacenada temporalmente en Redis o persistida en MongoDB.
- [ ] Establecer TTL (Time-To-Live) en Redis para limitar la exposición de datos cacheados.
- [ ] Evitar registrar contenido sensible en logs (usar redacción parcial o tokens anonimizados).

### 📊 Prevención de Abuso y Minería de Datos Interna
- [ ] Limitar la cantidad de consultas por usuario por hora (rate limiting).
- [ ] Auditar patrones de uso y detectar comportamientos anómalos (consultas masivas o fuera de horario).
- [ ] Clasificar documentos por nivel de sensibilidad y proteger accesos a nivel de metadata.

### 🔒 Comunicación Segura con Servicios Externos
- [ ] Usar HTTPS obligatorio para todas las integraciones (Slack, Confluence, VectorDB, LLM API).
- [ ] Validar firmas de mensajes entrantes desde Slack (verificación de tokens y timestamps).
- [ ] Utilizar tokens de API con permisos mínimos (principio de menor privilegio).
- [ ] Implementar rotación periódica de tokens o claves de acceso.

---

## Prácticas de Seguridad para TG: The Guardian

Estas son las principales prácticas de seguridad que deben adoptarse durante el desarrollo, despliegue y operación del producto, especialmente considerando que el bot accede a documentación interna sensible, responde consultas administrativas y genera contenido basado en IA.

### 1. Autenticación y autorización estricta
El bot se integra con Slack, por lo que es fundamental asegurarse de que cada acción esté ligada a un usuario verificado.

**Prácticas:**
- Validar los tokens y firmas de Slack para cada solicitud entrante.
- Asociar todas las consultas a un `userId` de Slack.
- Controlar qué documentos o tipos de respuestas puede ver cada rol (ej: practicantes vs líderes técnicos).

**Ejemplo:**  
```ts
if (!verifySlackSignature(request)) {
  return res.status(403).send('Unauthorized request');
}
```

### 2. Validación de permisos antes de entregar resultados
El bot debe respetar los permisos nativos de Confluence y no mostrar documentos que el usuario no podría ver en la plataforma original.

**Prácticas:**
- Al recuperar contenido de Confluence, verificar si el usuario actual tiene permisos antes de procesar.
- Considerar incluir una capa intermedia de autorización personalizada basada en el tipo de documento y el rol interno.

**Ejemplo:**  
Si `userId: U0234` no tiene acceso al documento de arquitectura, el bot no debe incluirlo ni en sugerencias ni en resúmenes.

### 3. Filtrado de contenido sensible en respuestas generadas por LLM
Las respuestas automáticas del bot pueden incluir resúmenes generados por un modelo de lenguaje (LLM), lo cual implica riesgo de fuga de información sensible.

**Prácticas:**
- Definir prompts de resumen que excluyan explícitamente datos confidenciales.
- Implementar validaciones automáticas del texto antes de enviarlo al usuario (por ejemplo, buscar patrones como tokens, emails, rutas internas).
- Ofrecer un botón para reportar contenido inapropiado.

**Ejemplo:**  
Prompt a LLM: "Resume el siguiente documento de forma general, omitiendo contraseñas, rutas técnicas o datos personales."

### 4. Protección de datos en cache y logs
El sistema usa Redis para cache y MongoDB para trazabilidad de consultas. Si no se controlan adecuadamente, estos pueden ser puntos de fuga.

**Prácticas:**
- No guardar información sensible (como texto completo de políticas o nombres personales) en Redis o logs.
- Configurar TTL en el cache (ej: 2 horas) para eliminar respuestas antiguas.
- Anonimizar o redondear datos al registrar métricas.

**Ejemplo:**  
```ts
redis.setex(`summary:${docId}`, 7200, JSON.stringify(safeSummary));
```

### 5. Prevención de abuso o minería de datos interna
Usuarios malintencionados (incluso internos) pueden usar el bot para recolectar poco a poco información delicada.

**Prácticas:**
- Implementar un límite de consultas por usuario por hora (rate limiting).
- Registrar patrones de uso y generar alertas si hay comportamiento inusual (como consultas masivas a documentos técnicos).
- Clasificar la sensibilidad de los documentos y aplicar lógica diferente según el caso.

**Ejemplo:**  
Si un usuario realiza más de 10 consultas a documentos de arquitectura en 5 minutos → enviar alerta interna.

### 6. Seguridad en comunicación con APIs externas
La aplicación depende de múltiples servicios: Slack, Confluence, LLM APIs, VectorDB, etc. Toda esta comunicación debe estar cifrada y autenticada.

**Prácticas:**
- Usar solo HTTPS.
- Validar certificados en cada llamada (no permitir self-signed en producción).
- Rotar periódicamente los tokens de acceso.
- Usar variables de entorno para gestionar claves de API (nunca hardcodearlas).

**Ejemplo:**  
```bash
export SLACK_SIGNING_SECRET=xxxxxxxx
export OPENAI_API_KEY=sk-xxxxxxxxxxxx
```

### Recomendaciones adicionales

- [ ] Revisar periódicamente los permisos de Confluence y la configuración de seguridad de la Slack App.
- [ ] Incluir pruebas automáticas de seguridad (ej: linters de secrets, validación de variables sensibles).
- [ ] Implementar alertas para detección de actividad anómala o consultas excesivas.
- [ ] Hacer un **security review por sprint**, especialmente al integrar nuevas funcionalidades con acceso a documentos, usuarios o bases de datos.
- [ ] Registrar métricas de acceso y uso del bot para tener trazabilidad ante posibles incidentes.

---

## Guía de Despliegue

Esta sección detalla los pasos necesarios para desplegar y ejecutar TG: The Guardian tanto en modo local como con Docker.

### Requisitos Previos

- Node.js v18 o superior
- npm v9 o superior
- Docker y Docker Compose (para modo Docker)
- Git

### Estructura de Archivos de Configuración

El proyecto utiliza dos archivos de configuración principales:
- `.env`: Para configuración con Docker
- `.env.local`: Para desarrollo local

Ambos archivos deben contener las siguientes variables:
```env
# Configuración de MongoDB
MONGODB_URI=mongodb://localhost:27017/tg-guardian  # Para local
# MONGODB_URI=mongodb://mongodb:27017/tg-guardian  # Para Docker

# Configuración de Redis
REDIS_HOST=localhost  # Para local
# REDIS_HOST=redis    # Para Docker
REDIS_PORT=6379
REDIS_DB=0

# Configuración de la API
PORT=3000

# Configuración de Slack
SLACK_SIGNING_SECRET=tu_signing_secret
SLACK_BOT_TOKEN=xoxb-tu-bot-token
SLACK_APP_TOKEN=xapp-tu-app-token

# Configuración de OpenAI
OPENAI_API_KEY=tu_api_key
```

### Modo Local (Desarrollo)

1. **Clonar el repositorio**:
```bash
git clone https://github.com/tu-usuario/tg-theguardian.git
cd tg-theguardian
```

2. **Instalar dependencias**:
```bash
npm install
```

3. **Configurar variables de entorno**:
- Crear archivo `.env.local` basado en el ejemplo anterior
- Ajustar las URLs de MongoDB y Redis para apuntar a `localhost`

4. **Iniciar servicios locales**:
- Asegurarse de tener MongoDB y Redis instalados localmente
- Iniciar MongoDB (el comando puede variar según tu instalación)
- Iniciar Redis (el comando puede variar según tu instalación)

5. **Ejecutar la aplicación**:
```bash
npm run dev:local
```

La aplicación estará disponible en `http://localhost:3002`

### Modo Docker (Producción/Staging)

1. **Clonar el repositorio**:
```bash
git clone https://github.com/tu-usuario/tg-theguardian.git
cd tg-theguardian
```

2. **Configurar variables de entorno**:
- Crear archivo `.env` basado en el ejemplo anterior
- Ajustar las URLs de MongoDB y Redis para usar los nombres de servicio de Docker

3. **Construir y ejecutar con Docker Compose**:
```bash
# Detener y limpiar contenedores anteriores (si existen)
docker-compose down -v

# Construir y ejecutar
docker-compose up --build
```

La aplicación estará disponible en `http://localhost:3001`

### Verificación del Despliegue

Para verificar que el despliegue fue exitoso:

1. **Verificar los logs**:
- En modo local: Revisar la consola donde se ejecuta la aplicación
- En modo Docker: `docker-compose logs -f app`

2. **Verificar el endpoint de salud**:
```bash
curl http://localhost:3001/health  # Para Docker
curl http://localhost:3002/health  # Para local
```

3. **Verificar la conexión con Slack**:
- Enviar un mensaje directo al bot
- Usar el comando `/tg-help` en Slack

### Solución de Problemas Comunes

1. **Error de conexión a Redis**:
- Verificar que Redis esté ejecutándose
- Confirmar el puerto y host correctos en el archivo .env
- Para modo local: Asegurarse de que Redis esté instalado

2. **Error de conexión a MongoDB**:
- Verificar que MongoDB esté ejecutándose
- Confirmar la URL de conexión en el archivo .env
- Para modo local: Asegurarse de que MongoDB esté instalado

3. **Problemas con Docker**:
- Ejecutar `docker-compose down -v` antes de `docker-compose up --build`
- Verificar que los puertos no estén en uso
- Revisar los logs con `docker-compose logs -f`

### Notas Importantes

- El modo local es recomendado para desarrollo y pruebas
- El modo Docker es recomendado para staging y producción
- Nunca compartir o commitear archivos .env con credenciales reales
- Mantener backups regulares de la base de datos en producción
- Monitorear los logs para detectar problemas temprano

## Guía de Inicio y Configuración

### Variables de Entorno

El proyecto utiliza diferentes archivos de configuración según el entorno:

#### `.env` (Configuración principal)
Contiene variables de entorno para el entorno de producción o contenedores Docker.

```bash
# Configuración del servidor
PORT=3001
NODE_ENV=development
LOG_LEVEL=debug

# MongoDB
MONGODB_URI=mongodb://mongodb:27017/tg-guardian

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Slack
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_SIGNING_SECRET=your-signing-secret
SLACK_APP_TOKEN=xapp-your-app-token

# OpenAI
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-3.5-turbo

# Confluence
CONFLUENCE_HOST=https://your-domain.atlassian.net/wiki
CONFLUENCE_USERNAME=your-email@teravisiongames.com
CONFLUENCE_API_TOKEN=your-confluence-api-token-here
CONFLUENCE_SPACE_KEY=your-space-key-here

# Seguridad
JWT_SECRET=your-jwt-secret-here
SESSION_SECRET=your-session-secret-here
ENCRYPTION_KEY=your-encryption-key-here
```

#### `.env.example` (Para repositorios)
Plantilla para que los desarrolladores puedan crear su propio archivo `.env` sin exponer credenciales reales.

```bash
# Configuración del servidor
PORT=3000
NODE_ENV=development
LOG_LEVEL=debug

# MongoDB
MONGODB_URI=mongodb://localhost:27017/tg-guardian

# Redis
REDIS_URL=redis://localhost:6379

# Slack
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_SIGNING_SECRET=your-signing-secret
SLACK_APP_TOKEN=xapp-your-app-token

# OpenAI
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-3.5-turbo

# Confluence
CONFLUENCE_HOST=https://your-domain.atlassian.net/wiki
CONFLUENCE_USERNAME=your-email@teravisiongames.com
CONFLUENCE_API_TOKEN=your-confluence-api-token-here
CONFLUENCE_SPACE_KEY=your-space-key-here

# Seguridad
JWT_SECRET=your-jwt-secret-here
SESSION_SECRET=your-session-secret-here
ENCRYPTION_KEY=your-encryption-key-here
```

#### `.env.local` (Para desarrollo local)
Configuración para entorno de desarrollo local.

```bash
# Configuración del servidor
PORT=3002
NODE_ENV=development
LOG_LEVEL=debug

# MongoDB
MONGODB_URI=mongodb://localhost:27017/tg-guardian-dev

# Redis
REDIS_HOST=localhost
REDIS_PORT=6380
REDIS_PASSWORD=
REDIS_DB=1

# Slack
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_SIGNING_SECRET=your-signing-secret
SLACK_APP_TOKEN=xapp-your-app-token

# OpenAI
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-3.5-turbo

# Confluence
CONFLUENCE_HOST=https://your-domain.atlassian.net/wiki
CONFLUENCE_USERNAME=your-email@teravisiongames.com
CONFLUENCE_API_TOKEN=your-confluence-api-token-here
CONFLUENCE_SPACE_KEY=your-space-key-here

# Seguridad
JWT_SECRET=your-jwt-secret-here
SESSION_SECRET=your-session-secret-here
ENCRYPTION_KEY=your-encryption-key-here
```

### Configuración de Docker

El proyecto está configurado para ser desplegado utilizando Docker y Docker Compose. Los principales archivos de configuración son:

#### `Dockerfile`

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

#### `docker-compose.yml`

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3001:3001"
    depends_on:
      - mongodb
      - redis
    env_file:
      - .env
    environment:
      - NODE_ENV=production
    restart: always

  mongodb:
    image: mongo:latest
    volumes:
      - mongodb_data:/data/db
    ports:
      - "27017:27017"

  redis:
    image: redis:alpine
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"

volumes:
  mongodb_data:
  redis_data:
```

### Guía de Instalación Rápida

Sigue estos pasos para tener el proyecto funcionando:

#### Requisitos Previos

- Node.js 18 o superior
- npm 7 o superior
- Docker y Docker Compose (opcional, para instalación con Docker)
- Git

#### Instalación Local

1. Clona el repositorio:
   ```bash
   git clone https://github.com/teravisiongames/tg-theguardian.git
   cd tg-theguardian
   ```

2. Crea un archivo `.env.local` a partir del ejemplo:
   ```bash
   cp .env.example .env.local
   ```
   Edita este archivo con tus credenciales.

3. Instala las dependencias:
   ```bash
   npm install
   ```

4. Inicia la aplicación en modo desarrollo:
   ```bash
   npm run dev:local
   ```

5. La aplicación estará disponible en `http://localhost:3002`.

#### Instalación con Docker

1. Clona el repositorio:
   ```bash
   git clone https://github.com/teravisiongames/tg-theguardian.git
   cd tg-theguardian
   ```

2. Crea un archivo `.env` a partir del ejemplo:
   ```bash
   cp .env.example .env
   ```
   Edita este archivo con tus credenciales.

3. Construye y ejecuta con Docker Compose:
   ```bash
   docker-compose up --build
   ```

4. La aplicación estará disponible en `http://localhost:3001`.

#### Verificación de la Instalación

Para comprobar que todo está funcionando correctamente:

1. Accede al endpoint de salud:
   ```bash
   # Para instalación local
   curl http://localhost:3002/health

   # Para instalación con Docker
   curl http://localhost:3001/health
   ```

2. Deberías ver un mensaje de estado indicando que todos los componentes están operativos.

#### Ejecución de Pruebas

Para ejecutar las pruebas del proyecto:

```bash
# Todas las pruebas
npm test

# Pruebas de integración
npm run test:integration

# Pruebas específicas de MongoDB
npm run test:mongodb

# Pruebas específicas de Redis
npm run test:redis

# Pruebas específicas de Slack
npm run test:slack
```

#### Solución de Problemas Comunes

- **Error de conexión a MongoDB/Redis**: Verifica que los servicios estén en ejecución y que las credenciales en los archivos `.env` sean correctas.
  
- **Error en la integración con Slack**: Confirma que los tokens en el archivo `.env` sean válidos y tengan los permisos necesarios.

- **Problemas con Docker**: Intenta reiniciar los contenedores con `docker-compose down` seguido de `docker-compose up --build`.

- **Errores en la API de OpenAI**: Verifica que la clave API sea válida y que tenga saldo disponible.

## Proceso de Despliegue

Esta sección detalla el proceso completo de despliegue del proyecto TG: The Guardian, incluyendo CI/CD, ambientes, estrategias de versión y monitoreo.

### Flujo de CI/CD

El proyecto implementa un flujo de Integración Continua y Despliegue Continuo utilizando GitHub Actions:

```yaml
# .github/workflows/ci-cd.yml
name: TG-TheGuardian CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run linter
        run: npm run lint
      - name: Run tests
        run: npm test

  build-and-deploy:
    needs: test
    if: github.event_name == 'push' && (github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Build project
        run: npm run build
      
      # Determinación del ambiente basado en la rama
      - name: Set environment
        id: set-env
        run: |
          if [ "${{ github.ref }}" = "refs/heads/main" ]; then
            echo "::set-output name=env::production"
          else
            echo "::set-output name=env::staging"
          fi
      
      # Configuración de Docker
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      # Login al registro de Docker
      - name: Login to Docker Registry
        uses: docker/login-action@v2
        with:
          registry: ${{ secrets.DOCKER_REGISTRY }}
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      
      # Construcción y push de la imagen
      - name: Build and push Docker image
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: ${{ secrets.DOCKER_REGISTRY }}/tg-theguardian:${{ steps.set-env.outputs.env }}-${{ github.sha }},${{ secrets.DOCKER_REGISTRY }}/tg-theguardian:${{ steps.set-env.outputs.env }}-latest
      
      # Despliegue a Kubernetes
      - name: Deploy to Kubernetes
        uses: steebchen/kubectl@v2
        with:
          config: ${{ secrets.KUBE_CONFIG_DATA }}
          command: set image deployment/tg-theguardian tg-theguardian=${{ secrets.DOCKER_REGISTRY }}/tg-theguardian:${{ steps.set-env.outputs.env }}-${{ github.sha }} --namespace=${{ steps.set-env.outputs.env }}
      
      # Verificar despliegue
      - name: Verify deployment
        uses: steebchen/kubectl@v2
        with:
          config: ${{ secrets.KUBE_CONFIG_DATA }}
          command: rollout status deployment/tg-theguardian --namespace=${{ steps.set-env.outputs.env }}
```

### Ambientes de Despliegue

El proyecto utiliza tres ambientes principales:

#### 1. Desarrollo (Development)
- **Propósito**: Para desarrollo y pruebas locales o en entorno aislado
- **Rama Git**: feature/* (ramas de características)
- **URL**: N/A (local) o dev.theguardian.teravisiongames.com
- **Variables de entorno**: `.env.local`
- **Base de datos**: Instancias locales o de desarrollo

#### 2. Staging
- **Propósito**: Para QA, pruebas de integración y validación pre-producción
- **Rama Git**: develop
- **URL**: staging.theguardian.teravisiongames.com
- **Variables de entorno**: `.env.staging`
- **Base de datos**: Instancias separadas para staging
- **Slack**: Conectado a un canal de pruebas (#tg-guardian-test)

#### 3. Producción (Production)
- **Propósito**: Ambiente de producción para usuarios finales
- **Rama Git**: main
- **URL**: theguardian.teravisiongames.com
- **Variables de entorno**: `.env.production`
- **Base de datos**: Instancias de producción con backups automáticos
- **Slack**: Conectado al canal principal (#tg-guardian)

### Estrategia de Versionado

El proyecto sigue Semantic Versioning (SemVer):

- **Mayor (X.0.0)**: Cambios incompatibles con versiones anteriores
- **Menor (0.X.0)**: Funcionalidades nuevas compatibles con versiones anteriores
- **Patch (0.0.X)**: Correcciones de errores compatibles con versiones anteriores

Las versiones se etiquetan en Git mediante tags:

```bash
# Ejemplo para la versión 1.2.3
git tag -a v1.2.3 -m "Release version 1.2.3"
git push origin v1.2.3
```

### Procedimiento de Despliegue Manual

En caso de necesitar un despliegue manual, seguir estos pasos:

1. **Preparación**:
   ```bash
   # Asegurarse de estar en la rama correcta
   git checkout [main|develop]
   
   # Obtener los últimos cambios
   git pull origin [main|develop]
   ```

2. **Construcción**:
   ```bash
   # Instalar dependencias
   npm ci
   
   # Construir el proyecto
   npm run build
   ```

3. **Construcción y etiquetado de Docker**:
   ```bash
   # Construcción de la imagen
   docker build -t tg-theguardian:[env]-[version] .
   
   # Etiquetar la imagen
   docker tag tg-theguardian:[env]-[version] [registry]/tg-theguardian:[env]-[version]
   docker tag tg-theguardian:[env]-[version] [registry]/tg-theguardian:[env]-latest
   
   # Subir la imagen
   docker push [registry]/tg-theguardian:[env]-[version]
   docker push [registry]/tg-theguardian:[env]-latest
   ```

4. **Despliegue en servidor**:
   ```bash
   # Actualizar la imagen en el servidor
   ssh [user]@[server] "cd /path/to/deployment && docker-compose pull && docker-compose up -d"
   ```

### Procedimiento de Rollback

En caso de detectar problemas después de un despliegue:

1. **Identificar la última versión estable**:
   ```bash
   # Listar tags recientes
   git tag -l --sort=-creatordate | head -n 5
   ```

2. **Rollback en el servidor**:
   ```bash
   # Especificar la versión anterior estable
   ssh [user]@[server] "cd /path/to/deployment && docker-compose down && export TAG=[previous-stable-tag] && docker-compose up -d"
   ```

3. **Rollback en Kubernetes** (si aplica):
   ```bash
   kubectl rollout undo deployment/tg-theguardian --namespace=[env]
   ```

4. **Registro del incidente**:
   - Documentar la razón del rollback
   - Crear issue para la corrección
   - Planificar el re-despliegue después de la corrección

### Monitoreo Post-Despliegue

Después de cada despliegue, se realizan las siguientes verificaciones:

1. **Verificación de Estado**:
   ```bash
   # Verificar el endpoint de salud
   curl https://[domain]/health
   ```

2. **Revisión de Logs**:
   ```bash
   # En servidor con Docker
   docker logs -f tg-theguardian
   
   # En Kubernetes
   kubectl logs -f deployment/tg-theguardian -n [namespace]
   ```

3. **Pruebas Funcionales Mínimas**:
   - Verificar la conexión con Slack enviando un mensaje de prueba
   - Comprobar al menos una función de búsqueda
   - Verificar respuestas administrativas

4. **Monitoreo de Métricas**:
   - Revisión de métricas en el dashboard (CPU, memoria, tiempo de respuesta)
   - Alertas configuradas para umbrales críticos

### Integración con Slack para Notificaciones de Despliegue

El sistema notifica automáticamente en un canal de Slack dedicado cada vez que ocurre un despliegue:

```yaml
# Paso adicional en el workflow de CI/CD
- name: Notify Slack on Success
  if: success()
  uses: rtCamp/action-slack-notify@v2
  env:
    SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}
    SLACK_CHANNEL: '#deploys'
    SLACK_TITLE: 'Despliegue exitoso :rocket:'
    SLACK_MESSAGE: 'TG-TheGuardian v${{ github.ref }} desplegado en ${{ steps.set-env.outputs.env }}'
    SLACK_COLOR: 'good'

- name: Notify Slack on Failure
  if: failure()
  uses: rtCamp/action-slack-notify@v2
  env:
    SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}
    SLACK_CHANNEL: '#deploys'
    SLACK_TITLE: 'Despliegue fallido :x:'
    SLACK_MESSAGE: 'El despliegue de TG-TheGuardian v${{ github.ref }} ha fallado'
    SLACK_COLOR: 'danger'
```

### Escalamiento y Alta Disponibilidad

Para entornos de producción, la aplicación se configura para escalar horizontalmente:

#### Configuración de Kubernetes (producción)

```yaml
# kubernetes/production/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: tg-theguardian
  namespace: production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: tg-theguardian
  template:
    metadata:
      labels:
        app: tg-theguardian
    spec:
      containers:
      - name: tg-theguardian
        image: [registry]/tg-theguardian:production-latest
        resources:
          requests:
            memory: "512Mi"
            cpu: "200m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        env:
          - name: NODE_ENV
            value: "production"
        readinessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 10
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 15
          periodSeconds: 20
---
apiVersion: autoscaling/v2beta2
kind: HorizontalPodAutoscaler
metadata:
  name: tg-theguardian-hpa
  namespace: production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: tg-theguardian
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 80
```

Este sistema permite que la aplicación escale automáticamente cuando aumenta la carga, garantizando alta disponibilidad y rendimiento óptimo.

