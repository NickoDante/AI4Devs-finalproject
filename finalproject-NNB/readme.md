## Índice

0. [Ficha del proyecto](#0-ficha-del-proyecto)
1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

## 0. Ficha del proyecto

### **0.1. Tu nombre completo:**

Nicolas Nieto Bedoya

### **0.2. Nombre del proyecto:**

TG: The Guardian

### **0.3. Descripción breve del proyecto:**

Chatbot integrado en Slack que permite consultar documentación técnica en Confluence por medio de palabras claves, responder preguntas frecuentes de procesos administrativos en la compañia, y resumir de manera eficiente documentos para entender reuniones a las que no se asistieron, apuntando a la base de conocimiento de Teravision Games, representado por la mascota de múltiples ojos.

### **0.4. URL del proyecto:**

El siguiente link lleva a una carpeta en Drive, en donde se encontrarán todos los videos del funcionamiento del proyecto:

https://drive.google.com/drive/folders/1JLF_fRUH6usgmcGEEP4nldCSafJquKoA?usp=sharing

### **0.5. URL o archivo comprimido del repositorio**

https://github.com/NickoDante/AI4Devs-finalproject

---

## 1. Descripción general del producto

TG: The Guardian es un chatbot corporativo inteligente diseñado específicamente para Teravision Games, que se integra con Slack y Confluence para proporcionar acceso rápido y eficiente al conocimiento y la documentación interna de la empresa. Representado por la icónica mascota de múltiples ojos de la compañía, este asistente virtual aprovecha tecnologías de procesamiento de lenguaje natural para entender consultas conversacionales, localizar información relevante, y presentarla de manera estructurada y accesible. 

El sistema actúa como intermediario entre los empleados y la base de documentación corporativa, eliminando la necesidad de navegar manualmente a través de múltiples páginas de Confluence para encontrar información específica. The Guardian también puede resumir documentos extensos, responder preguntas administrativas frecuentes, y está diseñado para crecer en capacidades a medida que comprende mejor el contexto único de Teravision Games y sus procesos internos.

### **1.1. Objetivo:**

El propósito principal de TG: The Guardian es optimizar el acceso al conocimiento y la documentación interna para los empleados de Teravision Games, reduciendo significativamente el tiempo dedicado a buscar información y aumentando la productividad general del equipo. El producto soluciona el problema fundamental de la información dispersa y de difícil acceso, permitiendo a los desarrolladores, diseñadores, artistas, productores y personal administrativo concentrarse en sus tareas principales en lugar de perder tiempo navegando por repositorios de documentación. 

Al democratizar el acceso al conocimiento interno mediante una interfaz conversacional en Slack (plataforma que el equipo ya utiliza diariamente), The Guardian elimina barreras tecnológicas y crea un entorno donde la información fluye libremente, beneficiando especialmente a los nuevos empleados y a equipos multidisciplinarios que necesitan acceder rápidamente a documentación fuera de su área de especialización.

### **1.2. Características y funcionalidades principales:**

1. **Búsqueda de Documentos por Palabras Clave**
Esta funcionalidad permite a los empleados de Teravision Games encontrar rápidamente documentación relevante sin tener que navegar por la estructura de Confluence o recordar ubicaciones exactas de documentos. Los usuarios pueden realizar consultas en lenguaje natural como "¿Dónde está la documentación sobre el sistema de combate?" o "Busca documentos relacionados con el proceso de onboarding", y The Guardian responderá con enlaces directos a las páginas relevantes y una breve descripción del contenido. Esta característica responde directamente a la necesidad de "localizar documentación por medio de palabras clave" y facilita el acceso a información crítica desde cualquier lugar a través de Slack.

2. **Respuestas a Preguntas Administrativas**
The Guardian puede responder a consultas administrativas frecuentes relacionadas con procesos internos, políticas de la empresa, y procedimientos, aliviando la carga sobre el personal de recursos humanos y administración. Los empleados pueden preguntar sobre temas como "¿Cómo solicito un certificado laboral?", "¿Cuál es el proceso para pedir nuevos equipos?" o "¿Qué pasos debo seguir para solicitar vacaciones?", recibiendo respuestas precisas extraídas directamente de la documentación oficial. Esta funcionalidad aborda específicamente la necesidad de tener acceso a información sobre "certificados laborales con acceso a confluence donde estan los forms" y "adquisición de elementos de trabajo", automatizando el primer nivel de soporte para consultas administrativas rutinarias.

3. **Resumen de Documentos y Páginas de Confluence (Sistema Dual)**
Esta característica permite a los miembros del equipo obtener rápidamente la esencia de documentos extensos sin tener que leerlos completamente, ahorrando tiempo valioso durante la jornada laboral. The Guardian implementa un **sistema dual** que maneja diferentes tipos de contenido a través de canales específicos:

   - **Comandos Slash para URLs** (`/tg-summary [URL]`): Los usuarios pueden solicitar resúmenes de páginas web y documentos de Confluence proporcionando la URL directamente. Ejemplo: `/tg-summary https://confluence.empresa.com/page`
   
   - **Menciones para Archivos Adjuntos** (`@TG-TheGuardian summary`): Para documentos locales (PDFs, Word, TXT), los usuarios suben el archivo al canal de Slack y mencionan al bot. Esta separación responde a las limitaciones técnicas de Slack donde los comandos slash no pueden recibir archivos adjuntos.

   El sistema proporciona mensajes educativos claros que guían a los usuarios hacia la opción correcta según el tipo de contenido que desean resumir, mejorando significativamente la experiencia de usuario y eliminando confusiones sobre cómo usar cada funcionalidad.

   Esta funcionalidad responde indirectamente a varias necesidades expresadas por el equipo, particularmente las relacionadas con documentación eficiente, ya que permite a los empleados consumir información técnica y de procesos de manera más eficiente, facilitando la comprensión rápida de documentos complejos y extensos tanto internos como externos.

### **1.3. Diseño y experiencia de usuario:**

<!-- Proporciona imágenes y/o videotutorial mostrando la experiencia del usuario desde que aterriza en la aplicación, pasando por todas las funcionalidades principales.
** 28 - Abril - 2025 ** -->

### **1.4. Instrucciones de instalación:**

#### Software necesario
- **Node.js**: versión 18.x o superior
- **MongoDB**: versión 6.0 o superior
- **Redis**: versión 6.0 o superior
- **Git**: para clonar el repositorio
- **Docker** (opcional): si se desea ejecutar con contenedores

#### Credenciales necesarias
- **Slack API**: Bot Token, Signing Secret y App Token
- **Llama**: Configuración del modelo local de IA
- **Confluence API**: Credenciales para acceso a la documentación (opcional)

#### Instalación en entorno local

##### 1. Clonar el repositorio
```bash
git clone https://github.com/NickoDante/AI4Devs-finalproject.git
cd AI4Devs-finalproject
```

##### 2. Configurar variables de entorno
Copiar el archivo de ejemplo y configurar las variables necesarias:
```bash
cp .env.example .env.local
```

Edita el archivo `.env.local` con tus credenciales y configuración:
- Configuración del servidor: `PORT`, `NODE_ENV`, `LOG_LEVEL`
- Configuración de MongoDB: `MONGODB_URI`
- Configuración de Redis: `REDIS_HOST`, `REDIS_PORT`
- Credenciales de Slack: `SLACK_BOT_TOKEN`, `SLACK_SIGNING_SECRET`, `SLACK_APP_TOKEN`
- Credenciales de Llama: `LLAMA_MODEL_PATH`, `LLAMA_MODEL_TYPE`
- Configuración de Confluence (opcional): `CONFLUENCE_HOST`, `CONFLUENCE_USERNAME`, etc.

##### 3. Instalar dependencias
```bash
npm install
```

##### 4. Iniciar servicios locales (MongoDB y Redis)

###### Opción 1: Usando script de utilidad (Windows)
```
TG-Guardian_SlackBot_Test(Local-StartServices).bat
```

###### Opción 2: Iniciar manualmente
- Iniciar MongoDB en puerto 27017
- Iniciar Redis en puerto 6379

##### 5. Ejecutar la aplicación en modo desarrollo
```bash
npm run dev:local
```

O usando el script de utilidad:
```bash
npm run dev:script
```

#### Instalación con Docker

##### 1. Clonar el repositorio y configurar variables de entorno
```bash
git clone https://github.com/NickoDante/AI4Devs-finalproject.git
cd AI4Devs-finalproject
cp .env.example .env
```

Edita el archivo `.env` con tu configuración para Docker.

##### 2. Iniciar los contenedores
```bash
docker-compose up -d
```

Esto iniciará:
- Aplicación Node.js en el puerto 3001
- MongoDB en el puerto 27017
- Redis en el puerto 6379

##### 3. Verificar el funcionamiento
```bash
docker-compose logs -f app
```

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

Para el proyecto TG: The Guardian, el **Diagrama de Componentes** es el más adecuado para representar la arquitectura del sistema en esta primera versión. Este tipo de diagrama permite visualizar claramente:

1. Los componentes principales del sistema
2. Las interfaces entre ellos
3. Las dependencias externas (Slack, Confluence, LLMs)
4. El flujo de información entre componentes
5. La estructura técnica general sin entrar en detalles de implementación excesivos

El diagrama de componentes proporcionará una visión de alto nivel pero suficientemente detallada para guiar el desarrollo, facilitar la comunicación con stakeholders y servir como referencia durante la implementación.

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
  - Adaptador de Llama
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

### Diagrama en Mermaid
```
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
    AdapterLlama["🔌 Adaptador Llama"]
    AdapterMongo["🔌 Adaptador MongoDB"]
    AdapterRedis["🔌 Adaptador Redis"]
    AdapterVectorDB["🔌 Adaptador Pinecone/Weaviate"]
  end

  %% Interfaces externas
  subgraph Externos
    SlackUser["👤 Usuario Slack"]
    Confluence["📚 Confluence"]
    Llama["🧠 Llama"]
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
  PortLLM --> AdapterLlama
  PortDB --> AdapterMongo
  PortDB --> AdapterRedis
  PortDB --> AdapterVectorDB

  %% Conexiones de adaptadores a servicios externos
  AdapterSlack --> SlackUser
  AdapterConfluence --> Confluence
  AdapterLlama --> Llama
  AdapterMongo --> MongoDB
  AdapterRedis --> Redis
  AdapterVectorDB --> VectorDB
```
### **2.2. Descripción de componentes principales:**

| Nivel Arquitectónico | Componente                       | Rol Clave                                                                 | Tecnología                         | Importancia del Nivel                                                                  |
|----------------------|----------------------------------|---------------------------------------------------------------------------|------------------------------------|----------------------------------------------------------------------------------------|
| Dominio Central      | CoreLogic (Lógica Central)       | Interpreta intenciones y decide flujo de ejecución                        | Node.js (TypeScript preferido)     | ⭐⭐⭐⭐⭐ Vital: es el cerebro del sistema, contiene la lógica de negocio central         |
|                      | QueryHandler                     | Orquestador de procesos, llama a puertos según necesidad de la consulta   | Node.js                            | ⭐⭐⭐⭐ Es el puente entre el dominio y los puertos, clave para mantener la cohesión     |
|                      | Entidades + Value Objects        | Representan conceptos del negocio (consultas, respuestas, etc.)           | Node.js / TypeScript               | ⭐⭐⭐ Refuerzan la estructura y legibilidad del dominio                                 |
|----------------------|----------------------------------|---------------------------------------------------------------------------|------------------------------------|----------------------------------------------------------------------------------------|
| Puertos              | Puerto de Mensajería             | Interface para recibir y enviar mensajes de Slack                         | Interface en TypeScript            | ⭐⭐⭐⭐ Abstracción crucial para independencia de la plataforma de mensajería            |
|                      | Puerto de Documentación          | Interface para buscar y extraer datos desde Confluence                    | Interface en TypeScript            | ⭐⭐⭐⭐ Permite acceder al conocimiento base del sistema                                 |
|                      | Puerto de Procesamiento LLM      | Interface para generar resúmenes y entender lenguaje natural              | Interface en TypeScript            | ⭐⭐⭐⭐⭐ Esencial: sin LLM, se pierde el valor cognitivo del asistente                   |
|                      | Puerto de Persistencia           | Interface para leer/escribir datos en base de datos y cache               | Interface en TypeScript            | ⭐⭐⭐ Necesario para el estado, logs y configuraciones                                  |
|----------------------|----------------------------------|---------------------------------------------------------------------------|------------------------------------|----------------------------------------------------------------------------------------|
| Adaptadores          | Adaptador Slack API              | Conecta con Slack y formatea la información                               | Slack API + Bolt.js (Node SDK)     | ⭐⭐⭐⭐ Permite la interfaz conversacional base del sistema                              |
|                      | Adaptador Confluence API         | Llama a la API de Confluence para extraer contenido                       | Confluence REST API + Axios        | ⭐⭐⭐⭐ Vital para encontrar y extraer documentación real                                |
|                      | Adaptador Llama                  | Comunicación con el modelo LLM para NLP                                   | Llama API                          | ⭐⭐⭐⭐⭐ Habilita la inteligencia conversacional                                         |
|                      | Adaptador MongoDB                | Almacena configuraciones, logs, y estructura básica                       | MongoDB + Mongoose                 | ⭐⭐⭐ Base de datos principal del sistema                                                |
|                      | Adaptador Redis                  | Cache para respuestas frecuentes                                          | Redis + ioredis (Node)             | ⭐⭐⭐ Mejora el rendimiento general del bot                                              |
|                      | Adaptador Pinecone / Weaviate    | Búsqueda semántica en documentos                                          | Pinecone SDK / Weaviate API        | ⭐⭐⭐⭐ Clave para encontrar contenido relevante basado en intención                     |
|----------------------|----------------------------------|---------------------------------------------------------------------------|------------------------------------|----------------------------------------------------------------------------------------|
| Interfaces Externas  | Slack                            | Punto de entrada del usuario                                              | Plataforma externa                  | ⭐⭐⭐⭐⭐ Sin Slack, no hay canal de entrada                                             |
|                      | Confluence                       | Fuente de documentación corporativa                                       | Plataforma externa                  | ⭐⭐⭐⭐⭐ Contenedor del conocimiento empresarial                                        |
|                      | Llama                            | Inteligencia para comprender preguntas y generar respuestas               | Plataforma externa                  | ⭐⭐⭐⭐⭐ Núcleo de comprensión semántica                                                |
|                      | MongoDB						  | Infraestructura para persistencia y rendimiento                           | Plataforma externa                  | ⭐⭐⭐ Apoyo técnico para la estabilidad y velocidad del sistema                         |

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

#### Estructura de Ficheros
```
tg-the-guardian/
├── scripts/                # Scripts de despliegue, CLI, utilidades
├── src/
  ├── adapters/                # Implementaciones concretas de los puertos
  │   ├── auth/                   # Adaptadores de autenticación
  │   ├── cache/                  # Adaptadores para caché (Redis)
  │   ├── confluence/             # Adaptadores para Confluence
  │   ├── llm/                    # Adaptadores para modelos de lenguaje
  │   ├── persistence/            # Adaptadores de persistencia (MongoDB)
  │   └── slack/                  # Adaptadores para Slack
  ├── application/            # Capa de aplicación (casos de uso)
  │   └── use-cases/            # Implementación de la lógica de negocio
  │       ├── message/            # Casos de uso relacionados con mensajes
  │       ├── conversation/       # Casos de uso para gestión de conversaciones
  │       └── knowledge/          # Casos de uso relacionados con conocimiento
  ├── config/                 # Configuraciones de la aplicación
  ├── domain/                 # Capa de dominio (modelos y puertos)
  │   ├── models/               # Entidades y objetos de valor
  │   └── ports/                # Interfaces que definen las operaciones
  ├── infrastructure/         # Componentes técnicos y configuración
  │   ├── cache/                # Configuración de caché
  │   ├── di/                   # Inyección de dependencias
  │   ├── errors/               # Manejo de errores
  │   ├── logging/              # Configuración de logs
  │   └── middleware/           # Middlewares de la aplicación
  ├── tests/                  # Pruebas unitarias e integración
  │   ├── integration/          # Pruebas de integración
  │   └── mocks/                # Objetos mock para pruebas
  └── index.ts                # Punto de entrada de la aplicación
├── .env                    # Variables de entorno
├── Dockerfile              # Contenedor del bot
├── docker-compose.yml      # Orquestación de contenedores
├── package.json
└── README.md
```

#### Explicacion por nivel

|Carpeta 		| Pertenece a 		| Rol clave 									| Relación con arquitectura hexagonal
|---------------|-------------------|-----------------------------------------------|-------------------------------------------------------------------|
|domain/ 		| Núcleo 			| Define el negocio: entidades, lógica, puertos | ✅ Dominio puro, independiente de frameworks						|
|application/ 	| Núcleo 			| Orquesta los casos de uso 					| ✅ Casos de uso conectan puertos sin acoplarse a adaptadores		|
|adapters/ 		| Infraestructura 	| Implementaciones concretas de puertos 		| ✅ Adaptadores conectan con tecnologías específicas				|
|interfaces/ 	| Entrada 			| Interfaz que el usuario usa (Slack, Web) 		| ✅ Entrada/salida que interactúa con adaptadores					|
|infrastructure/| Infraestructura 	| Configuración, DI, entorno de ejecución 		| ✅ Configura cómo se unen todos los componentes					|
|shared/ 		| Compartido 		| Tipos globales, errores y constantes 			| ✅ Reutilizable sin acoplarse a otras capas						|
|tests/ 		| Transversal 		| Verifica funcionalidad de cada componente 	| ✅ Ideal para pruebas aisladas gracias a la separación hexagonal	|

Esta estructura permite:
* Claridad de responsabilidades: Cada carpeta cumple un propósito único.
* Escalabilidad: Puedes añadir nuevos puertos/adaptadores sin modificar el dominio.
* Facilidad de testing: Gracias a la separación de adaptadores y dominio.
* Sustentabilidad: Soporta crecimiento futuro sin convertirse en un monolito caótico.
* Alineación con la arquitectura hexagonal: Perfectamente enmarcada en Ports & Adapters.

### **2.4. Infraestructura y despliegue**

#### Diagrama de despliegue

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
    Llama([Servicio Llama\nLlama])
    
    %% Infraestructura cloud
    subgraph Cloud ["Infraestructura Cloud"]
        %% Componentes de la aplicación
        subgraph AppCluster ["Cluster de Aplicación"]
            ApiGateway["API Gateway\n(Express + Node.js)"]
            CoreService["Servicio Central\n(Dominio Core)"]
            SlackAdapter["Adaptador Slack\n(Bolt.js)"]
            ConfluenceAdapter["Adaptador Confluence"]
            LlamaAdapter["Adaptador Llama"]
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
    CoreService -->|Genera resúmenes| LlamaAdapter
    LlamaAdapter -->|Procesamiento NLP| Llama
    Llama -->|Respuestas procesadas| CoreService
    
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
    
    class UserSlack,SlackAPI,ConfluenceAPI,Llama external
    class CoreService,SlackAdapter,ConfluenceAdapter,LlamaAdapter,ApiGateway core
    class MongoDB,Redis,VectorDB data
    class Logs,Monitor support
```

#### Proceso de Despliegue

##### Requisitos previos

###### Requisitos de hardware
- **Servidor de producción**: 
  - 2 CPU cores mínimo (4 recomendado)
  - 4GB RAM mínimo (8GB recomendado)
  - 20GB de almacenamiento (SSD recomendado)
- **Servicios de base de datos**:
  - MongoDB: 2GB RAM mínimo
  - Redis: 1GB RAM mínimo

###### Software necesario
- Docker y Docker Compose
- Node.js 18.x (solo para despliegue sin Docker)
- Git

##### Opciones de despliegue

TG-TheGuardian ofrece varias opciones de despliegue según las necesidades del entorno:

###### 1. Despliegue con Docker (recomendado)

El despliegue con Docker es la opción más sencilla y recomendada. Proporciona un entorno aislado y consistente.

####### Pasos para despliegue en entorno local o desarrollo

1. Clonar el repositorio:
```bash
git clone https://github.com/NickoDante/AI4Devs-finalproject.git
cd AI4Devs-finalproject
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
```
   Editar el archivo `.env` con la configuración adecuada.

3. Iniciar los contenedores:
```bash
docker-compose up -d
```

4. Verificar el despliegue:
```bash
docker-compose ps
docker-compose logs -f app
```

####### Pasos para despliegue en entorno de producción

1. Clonar el repositorio en el servidor:
```bash
git clone https://github.com/NickoDante/AI4Devs-finalproject.git
cd AI4Devs-finalproject
```

2. Configurar variables de entorno para producción:
```bash
cp .env.example .env.production
```
   Editar el archivo `.env.production` con la configuración adecuada.

3. Construir e iniciar los contenedores:
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.production up -d --build
```

4. Configurar un proxy inverso (Nginx/Apache) para gestionar el tráfico HTTPS.

###### 2. Despliegue manual (sin Docker)

El despliegue manual requiere la instalación directa de todas las dependencias en el servidor.

#### Pasos para despliegue manual

1. Clonar el repositorio:
```bash
git clone https://github.com/NickoDante/AI4Devs-finalproject.git
cd AI4Devs-finalproject
```

2. Instalar dependencias:
```bash
npm install --production
```

3. Configurar variables de entorno:
```bash
cp .env.example .env.production
```
   Editar el archivo `.env.production` con la configuración adecuada.

4. Construir la aplicación:
```bash
npm run build:clean
```

5. Iniciar el servicio:
```bash
NODE_ENV=production node dist/index.js
```

### **2.5. Seguridad**

#### 1. Autenticación y autorización estricta
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

#### 2. Validación de permisos antes de entregar resultados
El bot debe respetar los permisos nativos de Confluence y no mostrar documentos que el usuario no podría ver en la plataforma original.

**Prácticas:**
- Al recuperar contenido de Confluence, verificar si el usuario actual tiene permisos antes de procesar.
- Considerar incluir una capa intermedia de autorización personalizada basada en el tipo de documento y el rol interno.

**Ejemplo:**  
Si `userId: U0234` no tiene acceso al documento de arquitectura, el bot no debe incluirlo ni en sugerencias ni en resúmenes.

#### 3. Filtrado de contenido sensible en respuestas generadas por LLM
Las respuestas automáticas del bot pueden incluir resúmenes generados por un modelo de lenguaje (LLM), lo cual implica riesgo de fuga de información sensible.

**Prácticas:**
- Definir prompts de resumen que excluyan explícitamente datos confidenciales.
- Implementar validaciones automáticas del texto antes de enviarlo al usuario (por ejemplo, buscar patrones como tokens, emails, rutas internas).
- Ofrecer un botón para reportar contenido inapropiado.

**Ejemplo:**  
Prompt a LLM: "Resume el siguiente documento de forma general, omitiendo contraseñas, rutas técnicas o datos personales."

#### 4. Protección de datos en cache y logs
El sistema usa Redis para cache y MongoDB para trazabilidad de consultas. Si no se controlan adecuadamente, estos pueden ser puntos de fuga.

**Prácticas:**
- No guardar información sensible (como texto completo de políticas o nombres personales) en Redis o logs.
- Configurar TTL en el cache (ej: 2 horas) para eliminar respuestas antiguas.
- Anonimizar o redondear datos al registrar métricas.

**Ejemplo:**  
```ts
redis.setex(`summary:${docId}`, 7200, JSON.stringify(safeSummary));
```

#### 5. Prevención de abuso o minería de datos interna
Usuarios malintencionados (incluso internos) pueden usar el bot para recolectar poco a poco información delicada.

**Prácticas:**
- Implementar un límite de consultas por usuario por hora (rate limiting).
- Registrar patrones de uso y generar alertas si hay comportamiento inusual (como consultas masivas a documentos técnicos).
- Clasificar la sensibilidad de los documentos y aplicar lógica diferente según el caso.

**Ejemplo:**  
Si un usuario realiza más de 10 consultas a documentos de arquitectura en 5 minutos → enviar alerta interna.

#### 6. Seguridad en comunicación con APIs externas
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

### **2.6. Tests**

#### Funcionalidad: Comando de búsqueda "/tg-search":
Para garantizar la correcta funcionalidad del comando de búsqueda en Confluence, implementamos una serie de pruebas unitarias que verifican:

1. **Validación de entradas**: 
   - Rechazo apropiado de entradas vacías o que solo contienen espacios en blanco
   - Identificación de comandos mal formados

2. **Manejo de espacios predeterminados**:
   - Uso correcto del espacio TKA como valor predeterminado cuando no se especifica otro
   - Procesamiento adecuado de consultas con múltiples palabras clave sin especificación de espacio
   - Manejo correcto de consultas con una sola palabra clave

3. **Validación de espacios específicos**:
   - Extracción correcta del espacio y palabras clave cuando se usa el formato "keywords -- SPACE"
   - Validación de espacios existentes (TKA, NVP) y rechazo de espacios inválidos
   - Verificación de mensaje de error apropiado cuando se especifica un espacio no válido

4. **Manejo de errores**:
   - Gestión adecuada de errores inesperados en el proceso de extracción
   - Rechazo de caracteres especiales no válidos en las palabras clave
   - Mensajes de error claros y orientados al usuario

Estas pruebas garantizan que el comando de búsqueda funcione de manera robusta, proporcionando resultados relevantes y manejando adecuadamente los casos de error.

#### Funcionalidad: Comando de pregunta "/tg-question":

Para asegurar el correcto funcionamiento del comando de preguntas en lenguaje natural, implementamos una serie de pruebas unitarias que verifican:

1. **Manejo del comando**:
   - Visualización apropiada del mensaje de espera mientras se procesa la pregunta
   - Procesamiento correcto de la consulta y entrega de respuesta al usuario
   - Confirmación adecuada de recepción del comando en Slack

2. **Procesamiento de la consulta**:
   - Conversión correcta del comando de Slack a un formato procesable
   - Gestión adecuada de la respuesta generada por el modelo de lenguaje
   - Manejo robusto de errores durante el procesamiento

3. **Detección automática del idioma**:
   - Identificación precisa de consultas en español e inglés
   - Respuestas generadas en el mismo idioma de la pregunta original
   - Procesamiento correcto de caracteres especiales en preguntas multilingües
   
4. **Gestión del contexto conversacional**:
   - Mantenimiento del historial de mensajes para preguntas de seguimiento
   - Actualización adecuada del contexto con nuevas preguntas y respuestas
   - Limitación apropiada del tamaño del historial de conversación

5. **Integración con la base de conocimiento**:
   - Búsqueda efectiva de documentos relevantes relacionados con la pregunta
   - Incorporación del contenido documental en el contexto para respuestas precisas
   - Priorización adecuada de fuentes documentales según relevancia

Estas pruebas garantizan que el comando de pregunta proporcione respuestas contextualizadas, mantenga la coherencia en conversaciones extendidas y aproveche la documentación existente para generar respuestas precisas y útiles.

#### Funcionalidad: Comando de resumen "/tg-summary":

Para asegurar el correcto funcionamiento del comando de resúmenes con el nuevo sistema dual, implementamos una serie de pruebas unitarias que verifican:

1. **Sistema Dual de Procesamiento**:
   - Procesamiento correcto de URLs únicamente en comandos slash
   - Procesamiento correcto de archivos adjuntos únicamente en menciones
   - Separación clara de responsabilidades entre ambos canales
   - Validación específica según el tipo de entrada

2. **Validación de Archivos (Solo en Menciones)**:
   - Detección automática de archivos en eventos de mención
   - Validación de tipos MIME soportados (PDF, Word, TXT, HTML)
   - Verificación de límites de tamaño (máximo 50MB)
   - Manejo de archivos con extensiones válidas pero sin MIME type
   - Descarga segura con autenticación Bearer

3. **Validación de URLs (Solo en Comandos Slash)**:
   - Extracción correcta de URLs de hipervínculos de Slack
   - Detección de URLs en texto plano (workaround)
   - Identificación de dominios de Confluence sin protocolo
   - Validación de formato de URL y protocolo HTTP/HTTPS
   - Manejo de redirecciones HTTP 302

4. **Mensajes Educativos y Experiencia de Usuario**:
   - Mensaje educativo cuando se usa comando slash vacío
   - Respuesta apropiada cuando se menciona al bot sin archivos
   - Información detallada del contenido que se está procesando
   - Confirmación visual de validación exitosa

5. **Manejo de Casos Edge**:
   - Archivos demasiado grandes (>50MB)
   - Tipos de archivo no soportados
   - URLs malformadas o inválidas
   - Menciones sin archivos adjuntos
   - Comandos slash con texto que no es URL

6. **Workarounds Implementados**:
   - Extracción de URLs desde texto plano cuando hipervínculos fallan
   - Detección de dominios de Confluence sin protocolo
   - Manejo de diferentes formatos de hipervínculos de Slack
   - Procesamiento de redirecciones comunes en Confluence

**Total de Tests**: **31 tests pasando** (100% éxito)
- 6 tests específicos del sistema dual
- 7 tests de validación de archivos
- 16 tests de validación de URLs
- 6 tests de workarounds de extracción
- 4 tests de manejo de errores
- 3 tests de casos edge

Estas pruebas garantizan que el sistema dual funcione de manera robusta, proporcionando una experiencia de usuario clara que respeta las limitaciones de Slack mientras ofrece funcionalidad completa para ambos tipos de contenido (archivos adjuntos y URLs).

---

## 3. Modelo de Datos

### **3.1. Diagrama del modelo de datos:**
```
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
```

### **3.2. Descripción de entidades principales:**

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

## 4. Especificación de la API
```
openapi: 3.0.0
info:
  title: TG: The Guardian - External APIs
  version: 1.0.0
  description: >
    Especificación simplificada de los principales endpoints utilizados por TG: The Guardian
    en su MVP, para integración con Slack, Confluence y OpenAI (LLM).

paths:

  /slack/events:
    post:
      summary: Webhook de eventos de Slack
      description: Recibe eventos (mensajes, slash commands) desde Slack.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              example:
                type: event_callback
                event:
                  type: app_mention
                  text: "¿Dónde está el onboarding?"
                  user: "U123456"
                  channel: "C987654"
      responses:
        '200':
          description: Evento recibido exitosamente
        '403':
          description: Token inválido

  /confluence/search:
    get:
      summary: Buscar documentos en Confluence
      parameters:
        - name: query
          in: query
          required: true
          schema:
            type: string
          description: Palabras clave a buscar
        - name: spaceKey
          in: query
          required: false
          schema:
            type: string
          description: Espacio de Confluence (opcional)
      responses:
        '200':
          description: Documentos encontrados
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    id:
                      type: string
                    title:
                      type: string
                    url:
                      type: string
        '401':
          description: Autenticación fallida

  /openai/chat/completions:
    post:
      summary: Generar respuesta usando modelo LLM
      description: Utiliza OpenAI GPT-3.5 para generar una respuesta basada en un prompt.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                model:
                  type: string
                  example: "gpt-3.5-turbo"
                messages:
                  type: array
                  items:
                    type: object
                    properties:
                      role:
                        type: string
                        enum: [system, user, assistant]
                      content:
                        type: string
                temperature:
                  type: number
                  example: 0.7
      responses:
        '200':
          description: Respuesta generada por el modelo
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    type: string
                  choices:
                    type: array
                    items:
                      type: object
                      properties:
                        message:
                          type: object
                          properties:
                            role:
                              type: string
                            content:
                              type: string
        '429':
          description: Límite de uso excedido
```
---

## 5. Historias de Usuario

### [Busqueda] Como un nuevo empleado, quiero buscar documentación de onboarding para completar mis primeras tareas sin depender de alguien más.

**Descripción:**  
Facilitar el proceso de integración de nuevos empleados automatizando el acceso a guías de bienvenida, estructura del equipo, y herramientas.

**Criterios de Aceptación:**  
- El bot puede responder a "onboarding", "guía de bienvenida", "primer día".
- La respuesta debe incluir una lista mínima de 1 documento clave.
- Se presentan enlaces a dichos documentos con resúmenes.

**Notas Adicionales:**  
Reforzar con sugerencias del sistema según el rol del usuario.

**Historias Relacionadas:**  
- Resumen de onboarding  
- Procesos internos y estructura del equipo

### [Respuestas] Como un empleado nuevo, quiero saber cómo solicitar vacaciones para planificar mi primer viaje personal sin errores.

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

### [Resumen] Como un desarrollador, quiero obtener un resumen del documento de arquitectura del sistema para entenderlo sin leerlo completo.

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

---

## 6. Tickets de Trabajo

### 1. [BACKEND] Endpoint para respuestas administrativas sobre vacaciones

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

### 2. [FRONTEND] Mostrar pasos para solicitud de vacaciones en Slack

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

### 3. [BASE DE DATOS] Ingresar documento de proceso de vacaciones en MongoDB

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

---

## 7. Pull Requests

### Pull Request 1:

**Título:** 🏗️ [Setup] Configuración inicial del proyecto TG-TheGuardian

**Descripción:**  
Este PR implementa la configuración base de TG-TheGuardian estableciendo la infraestructura, estructura de archivos y conexiones fundamentales. Hemos seguido una arquitectura hexagonal para garantizar la escalabilidad y mantenibilidad del código, facilitando futuras integraciones.

**Cambios Principales:**
1. Creación del repositorio con estructura base siguiendo arquitectura hexagonal
2. Configuración del entorno de desarrollo (TypeScript, ESLint, Prettier)
3. Implementación de conexiones básicas con MongoDB, Redis y Slack
4. Configuración de Docker y docker-compose para desarrollo y producción
5. Implementación de sistema de logging y manejo de errores básicos

**Características Técnicas:**
- 📂 Estructura de carpetas optimizada para arquitectura hexagonal (domain, adapters, application)
- ⚙️ Configuración completa de TypeScript con paths alias y opciones estrictas
- 🐳 Docker y docker-compose para entorno de desarrollo reproducible
- 🔌 Adaptadores básicos para Slack, MongoDB y Redis implementados
- 🔒 Sistema de variables de entorno con validación (.env)
- 📝 Logging estructurado para mejor depuración

**Ejemplo de Uso:**
```bash
# Clonar el repositorio
git clone https://github.com/NickoDante/AI4Devs-finalproject.git

# Configurar variables de entorno
cp .env.example .env

# Iniciar con Docker
docker-compose up -d

# Desarrollo local
npm run dev
```

**Tests Implementados:**
- ✅ Healthchecks para verificar conexiones con servicios externos
- ✅ Validación de variables de entorno
- ✅ Tests básicos de adaptadores
- ✅ Sistema de manejo de errores

**Documentación:**
- README completo con instrucciones de instalación y configuración
- Documentación en código con JSDoc
- Diagrama de arquitectura en formato Mermaid
- Estructura de directorios documentada

### Pull Request 2:

**Título:** ✨ [Feature] Implementación del comando /tg-search para búsqueda en Confluence

**Descripción:**  
Este PR implementa la funcionalidad principal de búsqueda del bot TG-TheGuardian a través del comando `/tg-search`. La implementación permite a los usuarios buscar documentación en espacios específicos de Confluence utilizando palabras clave.

**Cambios Principales:**
1. Implementación del `ProcessMessageUseCase` para manejar búsquedas
2. Integración con el adaptador de Slack para procesar comandos
3. Sistema de caché para optimizar búsquedas frecuentes
4. Validación robusta de comandos y espacios de búsqueda
5. Formateo de respuestas con enlaces directos y previsualizaciones

**Características Técnicas:**
- 🔍 Búsqueda por palabras clave con extracción inteligente
- 🏷️ Soporte para espacios específicos (TKA, NVP)
- 💾 Sistema de caché con TTL de 1 hora
- 🔒 Validación de permisos por espacio
- 📊 Logging detallado de búsquedas

**Ejemplo de Uso:**
```
/tg-search onboarding TKA
/tg-search arquitectura NVP
/tg-search conventions
```

**Tests Implementados:**
- ✅ Validación de espacios de búsqueda
- ✅ Extracción de palabras clave
- ✅ Manejo de casos de error
- ✅ Formateo de respuestas
- ✅ Integración con caché

**Documentación:**
- Se incluye flujo detallado en `docs/TG-SEARCH-FLOW.md`
- Actualización de README con ejemplos de uso
- Documentación de tipos y interfaces

### Pull Request 3:

**Título:** 🔍 [Feature] Implementación del comando /tg-question para respuestas inteligentes bilingües

**Descripción:**  
Este PR implementa la funcionalidad del comando `/tg-question`, permitiendo a los usuarios de Teravision Games realizar consultas en lenguaje natural directamente al bot. La implementación incluye soporte bilingüe (español e inglés) con detección automática del idioma, mejorando significativamente la experiencia de usuario y el acceso a información administrativa y técnica.

**Cambios Principales:**
1. Implementación completa del adaptador para Llama (LlamaAdapter) con capacidad bilingüe
2. Integración del comando `/tg-question` en SlackAdapter con mensajes de espera mejorados
3. Sistema de detección automática de idioma para procesar y responder en el mismo idioma del usuario
4. Manejo de contexto conversacional para preguntas de seguimiento
5. Implementación de fallbacks inteligentes cuando no se dispone del modelo Llama local

**Características Técnicas:**
- 🌐 Detección automática del idioma (español/inglés) en las consultas
- ⏳ Mensaje de espera amigable mientras se procesa la respuesta
- 🧠 Integración con modelo local Llama para respuestas rápidas y privadas
- 🔄 Conservación de contexto para preguntas encadenadas
- 📊 Métricas de rendimiento y confianza para cada respuesta
- 🛡️ Manejo gracioso de errores en la carga del modelo o procesamiento

**Ejemplo de Uso:**
```
# Pregunta en español
/tg-question ¿Cuál es el proceso para solicitar equipo nuevo?

# Pregunta en inglés
/tg-question What is the current sprint schedule?

# Pregunta de seguimiento (mantiene contexto)
/tg-question ¿Y quién es el responsable de aprobarlo?
```

**Tests Implementados:**
- ✅ Tests unitarios completos para LlamaAdapter y su integración con SlackAdapter
- ✅ Pruebas de detección de idioma con diversos tipos de preguntas
- ✅ Validación de mensajes de espera y respuestas finales
- ✅ Simulación de errores y verificación de fallbacks
- ✅ Tests de mantenimiento de contexto conversacional

**Documentación:**
- Se incluye documentación detallada en comentarios de código 
- Actualización de prompts para optimizar respuestas del LLM
- Guía de utilización en documentación principal
- Ejemplos de preguntas efectivas para usuarios finales

### Pull Request 4:

**Título:** 📄 [Feature] Implementación del comando /tg-summary con sistema dual de procesamiento

**Descripción:**  
Este PR implementa la funcionalidad completa del comando `/tg-summary` con un innovador sistema dual que maneja tanto URLs de Confluence como archivos adjuntos (PDFs, Word, TXT). La implementación resuelve las limitaciones técnicas de Slack mediante una separación inteligente: comandos slash para URLs y menciones para archivos, proporcionando una experiencia de usuario óptima para ambos casos de uso.

**Cambios Principales:**
1. Implementación del `ProcessSummaryUseCase` con soporte para múltiples tipos de contenido
2. Sistema dual de procesamiento: comandos slash (/tg-summary) para URLs y menciones (@TG-TheGuardian) para archivos
3. Adaptador PDF robusto con validación de tipos MIME y límites de tamaño (50MB)
4. Integración avanzada con Confluence para extraer contenido usando autenticación API
5. Sistema de caché inteligente para optimizar resúmenes frecuentes con TTL de 1 hora
6. Workarounds implementados para limitaciones de Slack en extracción de URLs

**Características Técnicas:**
- 🔄 **Sistema Dual**: Separación clara entre URLs (comandos slash) y archivos (menciones)
- 📎 **Soporte Multi-formato**: PDF, Word (.docx), texto plano (.txt), HTML
- 🔗 **Extracción Inteligente de URLs**: Manejo de hipervínculos de Slack y texto plano con workarounds
- 🔐 **Autenticación Confluence**: Integración con API tokens para acceso a contenido privado
- 💾 **Caché Optimizado**: Sistema de caché con claves únicas para URLs y metadatos de archivos
- 🛡️ **Validación Robusta**: Verificación de tipos MIME, tamaños de archivo y formatos de URL
- 📱 **Mensajes Educativos**: Guías claras para usuarios sobre cuándo usar cada método
- 🌐 **Soporte Bilingüe**: Generación de resúmenes en español e inglés según preferencia

**Ejemplo de Uso:**
```
# Para URLs de Confluence (comando slash)
/tg-summary https://confluence.empresa.com/display/TKA/Architecture
/tg-summary https://confluence.empresa.com/page es  # Español específico

# Para archivos adjuntos (mención con archivo)
[Subir archivo PDF al canal]
@TG-TheGuardian resumen
# o en inglés:
@TG-TheGuardian summary

# Comando educativo (sin parámetros)
/tg-summary
# Muestra: "📖 Para resumir URLs usa: /tg-summary [URL]
#          📎 Para resumir archivos: sube el archivo y menciona @TG-TheGuardian resumen"
```

**Tests Implementados:**
- ✅ **31 tests** con 100% de éxito cubriendo todos los escenarios
- ✅ Validación completa del sistema dual (comandos vs menciones)
- ✅ Tests de validación de archivos: tipos MIME, tamaños, formatos soportados
- ✅ Tests de extracción de URLs: hipervínculos, texto plano, dominios Confluence
- ✅ Workarounds de extracción con múltiples patrones de URLs
- ✅ Manejo de casos edge: archivos grandes, URLs malformadas, menciones vacías
- ✅ Integración con caché y verificación de TTL
- ✅ Tests de autenticación con Confluence API

**Arquitectura y Componentes:**
- `ProcessSummaryUseCase`: Lógica central de procesamiento con routing inteligente
- `SummaryCommand`: Validación y parsing de comandos con detección de tipos
- `PDFAdapter`: Extracción de contenido de múltiples formatos de archivo
- `ConfluenceAdapter`: Integración autenticada para contenido privado
- `ValidationMiddleware`: Sistema robusto de validación con mensajes educativos
- Sistema de caché con claves optimizadas para diferentes tipos de contenido

**Soluciones Técnicas Implementadas:**
- **Limitación de Slack**: Comandos slash no soportan archivos → Solución: Sistema dual
- **Extracción de URLs**: Hipervínculos de Slack inconsistentes → Workaround: Múltiples patrones
- **Autenticación Confluence**: Error 403 → Solución: Integración con API tokens
- **Gestión de memoria**: Archivos grandes → Solución: Límites y streaming
- **UX confusa**: Usuarios no sabían qué usar → Solución: Mensajes educativos automáticos

**Documentación:**
- Documentación completa del flujo dual en `docs/TG-SUMMARY-FLOW.md`
- Guía de configuración de Confluence en documentación de despliegue
- Ejemplos prácticos de uso para diferentes tipos de contenido
- Documentación de limitaciones de Slack y soluciones implementadas
- Actualización de permisos requeridos para manejo de archivos

**Permisos de Slack Requeridos**
```
OAuth Scopes:
- files:read          (Leer archivos subidos - CRÍTICO)
- channels:history    (Leer historial de canales - CRÍTICO)
- chat:write         (Enviar mensajes)
- commands           (Recibir comandos slash)
- app_mentions:read  (Recibir menciones - NUEVO para sistema dual)
```