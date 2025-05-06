> Detalla en esta sección los prompts principales utilizados durante la creación del proyecto, que justifiquen el uso de asistentes de código en todas las fases del ciclo de vida del desarrollo. Esperamos un máximo de 3 por sección, principalmente los de creación inicial o  los de corrección o adición de funcionalidades que consideres más relevantes.
Puedes añadir adicionalmente la conversación completa como link o archivo adjunto si así lo consideras


## Índice

1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

## 1. Descripción general del producto

**Prompt 1:**
Soy Lead Programmer en una empresa de desarrollo de videojuegos en Colombia. Le pedi a mi equipo de trabajo (personas de multiples áreas como sector administrativo, ingenieros, diseñadores, productores, artistas, sonidistas, C-Levels, etc) una lista de necesidades que les gustaria cubrir con una Inteligencia Artificial, dentro de sus labores diarias, para que puedan ser mucho más efectivos.

En resumen, les pedi que me contaran lo que les gustaría que hiciese su "IA ideal", pensandolo como un producto. El archivo adjunto, contiene las respuestas recolectadas de cada trabajador (sus nombres estan en Mayusculas). Necesito que leas y conozcas la listas de necesidades antes de proseguir. 

No quiero que resumas ni concluyas, solo entender cada respuesta.

**Prompt 2:**
Estoy haciendo una maestría sobre desarrollo de software con Inteligencia Artificial, y debo realizar un proyecto final. Las instrucciones del proyecto se encuentran aqui:

-- Instrucciones de AI4Devs --

Con las instrucciones, y las necesidades de mi equipo de trabajo, me gustaria que me dieras 10 ideas de producto de software básico apoyado en IA, que pueda funcionar como proyecto final, pero que tambien pueda cubrir algunas de las necesidades de mi equipo.

Entregamelas en formato Markdown asi:
---------------------------------------------
[Titulo de la Idea]
---------------------------------------------

Descripcion:
[Descripcion de la idea en 2 lineas maximo]

Necesidades que cubre:
[Lista de necesidades que cubre de la lista de necesidades de arriba]

 Tiempo de desarrollo:
[Tiempo que puede tardar en tener un minimo producto viable funcional con los parametros que se quiere de la entrega]

 Dificultad: 
[Que tan dificil es implementar dicha idea de producto, teniendo en cuenta los agentes externos, APIs, teconlogias, etc]

 Tecnologias: 
[Tecnologias para usar tanto para el front end, como para el backend y la base de datos]

**Prompt 3:**
La idea 2 y la idea 9 me gustan mucho y me gustaria sacar el producto de alli. Que sea una plataforma que permita desde Slack, la consulta de información técnica y de procesos internos, usando IA para entender preguntas en lenguaje natural y extraer respuestas precisas, pero tambien, que ayude a generar, actualizar y acceder a documentación técnica en Confluence. 

Podrias generar una idea a partir de estos dos conceptos? Regresame la idea final, en Markdown, y usando el mismo formato anteriormente mencionado.

**Prompt 4:**
Perfecto, ahora pensemos en el nombre para el producto. Para ello quiero que hagas una lluvia de ideas de 25 posibles nombres, del producto de software, conociendo lo que hara. Considera: 
1. Es para una empresa de Videojuegos
2. La empresa se llama Teravision Games, abreviada tambien como TG
3. Tenemos una mascota en la compañia (imagen adjunta). Dicha mascota podria ser la representacion grafica del chatbot, asi que podria ser un nombre para dicho personaje.

**Prompt 5:**
Lo llamaremos "TG: The Guardian". Entregame ahora la opcion que llamaste "DocuChat", con este nuevo nombre, en el mismo formato y con las consideraciones adicionales: 
* El LLM interno para opciones predefinidas. 
* Especifica Que LLM seria el mas facil de usar
* Especifica como seria el frontend de esto
* Especifica el backend que podriamos usar
* Revisa si a nivel de tiempos cuanto nos puede tomar.

**Prompt 6:**
Podrias ayudarme a ser mas detallado con la información del nuevo producto "TG: The Guardian" ? Necesito: 
* Descripcion general pero mas detallada del producto (Parrafo de 10 lineas)
* Objetivo (Propósito del producto. Qué valor aporta, qué soluciona, y para quién.)
* Caracteristicas y funcionalidades principales. (Enumera y describe las características y funcionalidades específicas que tiene el producto para satisfacer las necesidades identificadas. Utiliza las 3 caracteristicas principales que te di, y enfatiza en que son necesidades que los mismos usuarios de la compañia estan necesitando).

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:**

Eres un experto en arquitectura de software. Basado en la vision general del producto, y el alcance que queremos tener para esta primera version funcional, selecciona entre todos los diagramas posibles, cual es el más adecuado para representar los componentes principales de la aplicación y las tecnologías utilizadas. Considera: 

* Diagramas de bloques
* Diagramas de componentes
* Diagrama de implementación
* Diagrama de flujo de datos
* Diagrama de secuencia
* Diagrama de flujo de usuario
* Diagrama de relación de entidad
* Diagrama de flujo

Cuando tengas el escogido, explica si sigue algún patrón predefinido:

1. Modelo - Vista - Controlador (MVC)
2. Capas
2. Arquitectura de Microservicios
3. Arquitectura Hexagonal (puertos y adaptadores)
4. Arquitectura de capas de servicio
5. Arquitectura Orientada a Servicios (SOA)
6. Modelo-Vista-VistaModelo (MVVM)

Justifica por qué se ha elegido esta arquitectura, y destaca los beneficios principales que aportan al proyecto y justifican su uso, así como sacrificios o déficits que implica.

**Prompt 2:**
Quiero crear el diagrama de componentes siguiendo el patron de arquitectura Hexagonal en Mermaid. Hazlo de manera detallada y revisando que las conexiones de dominio, puertos y adaptadores tenga sentido.

### **2.2. Descripción de componentes principales:**

**Prompt 1:**
Con la información brindada hasta el momento, cuales consideras que son los componentes más importantes del producto? y cuál la tecnología a usar para cada uno de ellos?

**Prompt 2:**
Regresame el resultado en una tabla en formato Markdown, identificando por cada nivel, sus componentes, rol clave, Tecnologia, e importancia del nivel.

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1:**
Teniendo en cuenta la descripcion general del proyecto, el diagrama de arquitectura, y la descripcion de los componentes principales, quiero que me sugieras la estructura del proyecto. Explica brevemente el propósito de las carpetas principales, y si obedece a algún patrón o arquitectura específica, o incluso, si obedece al patrón hexagonal que ya hemos definido.

### **2.4. Infraestructura y despliegue**

**Prompt 1:**
Hablemos de infraestructura, te parece? Cual consideras que es el mejor diagrama para representar la infraestructura y despliegue de este proyecto ?

**Prompt 2:**
Vamos con un diagrama en formato Mermaid que nos permita visualizar dicho diagrama. Necesito que expliques el proceso de despliegue que se sigue, para que la informacion del producto sea clara. Manten el diagrama entendible, razonable y que apunte a las 3 caracteristicas principales del producto, para que se pueda realizar el MVP dentro de los tiempos establecidos.

### **2.5. Seguridad**

**Prompt 1:**
Eres un experto en ciber seguridad en este tipo de aplicaciones. Cuales pueden ser las mayores preocupaciones en seguridad que detectas en este proyecto ? Lista las 5 preocupaciones mas importantes, en orden de prioridad. Utiliza terminologia clara para un individuo que no conoce sobre ciber seguridad.

**Prompt 2:**
Traduceme esto en un checklist tecnico para considerar en un Readme que estoy elaborando en formato Markdown.

**Prompt 3:**
A partir de estas consideraciones, describe las practicas de seguridad principales que se debe tener presente en el proyecto, añadiendo ejemplos si procede.

### **2.6. Tests**

---------------------------------------
     FUNCIONALIDAD 1: /tg-search
---------------------------------------
**Prompt 1:**
Teniendo en cuenta la funcionalidad que acabamos de realizar, con respecto a busqueda por medio de palabras clave, y usando espacios de confluences definidos, quiero que trabajemos en Test unitarios. Revisemos los test realizados hasta el momento en @search.command.test.ts y cuentame, que sugerencias podrias ver en cada una de ellas (de haberlas).

**Prompt 2:**
Ahora, me gustaria que revisaramos los test realizados durante el proceso de creacion de la funcionalidad, teniendo en cuenta los criterios: 

1. Usa nombres en Ingles para variables y funciones. Los comentarios dejalos en español para entender lo que se esta haciendo.
2. Utiliza nombres de funciones de prueba descriptivos que indiquen claramente lo que se esta haciendo.
3. Usa patron Arrange--Act-Assert para mejorar la legibilidad
4. Parametriza las pruebas que sigan un patron similar
5. Usa mensajes de afirmación, por si la prueba sale mal, para detectarla rapidamente.

Recuerda mantener el codigo lo mas sencillo y simple posible, y asegurarte de que, no solo las pruebas unitarias puedan pasar sin problema y que no tengan errores de compilacion o errores linter, sino que la funcionalidad permanezca intacta. En este momento todo funciona bien.

**Prompt 3:**
Resolvamos los errores de integracion de Slack. Si se tratan de archivos faltantes, revisa bien que no esten creados en el proyecto y solo si no hay nada de eso, crearlos.

---

### 3. Modelo de Datos

**Prompt 1:**
Eres un arquitecto de software experto. Me gustaria empezar a desarrollar el diagrama de modelo de datos del proyecto "TG: The Guardian", pero antes que nada quiero que analicemos toda la informacion recolectada hasta el momento. La puedes encontrar en el README adjunto.

**Prompt 2:**
Con el analisis realizado, quiero que primero, definas los esquemas detallados para cada entidad, donde especifiques campos, tipos y validaciones.

**Prompt 3:**
Ahora, con esta información, valida si el modelo de datos es valido para el MVP que se quiere realizar en el tiempo establecido. De encontrar mejoras, me gustaria que modificaras el modelo de datos propuesto indicando el porque de las modificaciones, para que se pueda completar el alcance del MVP.

**Prompt 4:**
Usa mermaid para representar el modelo de datos final, y utilizar todos los parámetros que permite la sintaxis para dar el máximo detalle, por ejemplo las claves primarias y foráneas.

**Prompt 5:**
Con ese modelo de datos establecido, quiero que realices la descripcion de cada una de las entidades principales de "TG:The Guardian". Incluye el máximo detalle como el nombre y tipo de cada atributo, descripción breve si procede, claves primarias y foráneas, relaciones y tipo de relación, restricciones (unique, not null…), etc. 

---

### 4. Especificación de la API

**Prompt 1:**
Es claro que nuestro producto tendra API externo. Me resumes cuales son los que usaremos? Regresamelos con el siguiente formato
- Titulo
- Razon por la que lo usaremos
- Importancia
- Dificultad
- En donde lo usaremos.
- Podremos prescindir de el para el MVP ?

**Prompt 2:**
Vamos con los APIs esenciales para el producto. Para cada uno de ellos, describe los endpoints principales (maximo 3) en formato OpenAPI. Opcionalmente puedes añadir un ejemplo de peticion y de respuesta para mayor claridad.

---

### 5. Historias de Usuario

**Prompt 1:**
Eres un Product Manager con alta experiencia en productos de tecnologia. Adjunto la documentacion del proyecto "TG: The Guardian" que estoy a punto de iniciar. Con las funcionalidades principales claras, el despliegue listo, el MVP claro, y los tiempos que tenemos, quiero que me organices una lista de las Epicas del proyecto para que se pueda llevar a cabo el MVP dentro del tiempo establecido.

**Prompt 2:**
Dado el objetivo general del producto y sus funciones principales, quiero que generemos 10 Historias de usuario por cada funcionalidad principal, considerando diferentes usuarios (personal de distintas areas de trabajo en la empresa de videojuegos, personal nuevo, etc), y sus necesidades (documentacion tecnica, onboarding, proceso de permisos, vacaciones, time off, certificados, datos de la compañia, etc). Entregamelos en formato Markdown asi:  "Como un [tipo de usuario], quiero [realizar una acción] para [obtener un beneficio]".

**Prompt 3:**
Quiero que agrupemos todo en un mismo documento para tener visual de todas las historias de usuario. Luego, analiza las funcionalidades existentes del producto para identificar los cinco problemas más comunes que los usuarios podrían enfrentar y sugerir mejoras.

**Prompt 4:**
Ahora me gustaria que las organizaramos. Estima por cada una, en una escala de 1 a 5, donde 1 es bajo y 5 es alto, de las historias de usuario:
- Impacto en el usuario y valor que aporta en un proyecto con respecto a eficiencia.
- Frecuencia o concurrencia de ser usado.
- Complejidad y esfuerzo estimado de implementación. 
- Riesgos y dependencias entre tareas. 

Regresalo en una tabla Markdown.

**Prompt 5:**
Pasemoslo a MoSCoW. Me gustaria visualizarlas y con ello, que me sugieras las 10 historias mas importantes con los 4 criterios mencionados anteriormente.

**Prompt 6:**
Regalame las 10 historias seleccionadas, de manera detalladas siguiendo el formato: 

- Titulo (Manteniendo el formato base)
- Descripcion
- Criterios de Aceptacion
- Notas adicionales (de ser necesario)
- Historias relacionadas (de ser necesario)

Considera:
- Enfocarte en el usuario 
- Mantener un formato simple y conciso 
- Priorizar y estimar 
- Fomentar la colaboracion 
- Al incluir criterios de aceptacion: Definir claramente los criterios que deben cumplirse para considerar una historia "terminada".

Regresame la respuesta en formato Markdown.

---

### 6. Tickets de Trabajo

**Prompt 1:**
Necesito crear tickets de trabajo para el desarrollo, porque debo entregar documentados un ticket para backend, uno para frontend y uno de base de dato, dando todo el detalle requerido para desarrollar la tarea de inicio a fin teniendo en cuenta las buenas prácticas al respecto. Que me recomiendas con la info que tenemos hasta el momento?

**Prompt 2:**
Me gustaria armar tickets similares, pensando en funcionalidad end-to-end, para la historia de usuario "Como un nuevo empleado, quiero buscar documentación de onboarding para completar mis primeras tareas sin depender de alguien más."

Crea una lista de 6 tickets de trabajo, que cubra toda la historia de usuario y considerando los tiempos del MVP para ser desarrollada (recuerda que soy el unico programador del producto).

Entregame la lista en un formato Markdown, en donde cada ticket siga el siguiente formato: 

- Titulo claro y conciso 
- Descripcion
- Tipo de ticket (Feature, Bug, Imporovement, Research)
- Frontend, Backend o Base de datos.
- Proposito
- Detalles especificos
- Criterios de aceptacion
- Prioridad 
- Estimado de Esfuerzo (horas)
- Etiquetas o Tags 
- Comentarios y Notas  (si aplica)

**Prompt 3:**
Hagamos lo mismo, para la historia "Como un empleado nuevo, quiero saber cómo solicitar vacaciones para planificar mi primer viaje personal sin errores."

**Prompt 4:**
Hagamoslo una ultima vez, para la historia "Como un desarrollador, quiero obtener un resumen del documento de arquitectura del sistema para entenderlo sin leerlo completo."

---

### 7. Pull Requests

---------------------------------------
#### Pull Request #1: Configuracion Base.
---------------------------------------
**Propmt 1:**
Eres un Programador Fullstack experto en desarrollo de aplicaciones con bots en Slack, integracion de LLMs locales, y desarrollo de API de confluence. Vamos a desarrollar juntos el proyecto llamado "TG - TheGuardian". En el @TG-TheGuardian-README.md encontraras todo el contexto, arquitectura, contenido, MVP, tiempos, y caracteristicas funcionales que se quiere lograr con el producto. De momento quiero que lo leas y tengas el contexto del proyecto antes de que comencemos. 

**Prompt 2:**
Ahora quiero que leas especificamente la seccion de Organigrama en @TG-TheGuardian-README.md. Para que sepas lo que haremos el dia de Hoy, Lunes 22 de Abril. No ejecutes nada, solo entiende lo que haremos. 

**Prompt 3:**
Vamos a revisar el primer objetivo. El repositorio ya esta listo, y en este momento estamos en la raiz del proyecto. Nos faltaria revisar si hace falta algo mas en la estructura del proyecto. Revisa el proyecto actual por si hace falta algo primordial. Mantenlo sencillo y solo modificando lo que sea necesario para lograr el objetivo del MVP. 

**Prompt 4:**
Segun @readme.md tenemos una estructura de carpetas. Revisa tus sugerencias si hace sentido con esta estructura documentada para saber si es necesaria. 

**Prompt 5:**
Teniendo ahora en cuenta ese enfoque, de los objetivos que tenemos del dia 22 de Abril, cuales consideras ya estan completados y cuales hacen falta por completar ? 

**Prompt 6:**
Empecemos configurando el entorno de desarrollo. Hay una seccion en el @TG-TheGuardian-README.md llamada "Instalación del Proyecto desde Cero", que puede ayudar con el setup de los archivos json y .env. Usa esta seccion para generar y modificar lo que haga falta y completar ese objetivo. Recuerda mantener el foco, solamente en lo verdaderamente primordial e importante.

**Prompt 7:**
Ya pude correr "docker-compose up --build" sin problema. Eso en que punto nos deja con los objetivos diarios ? Que tenemos completo y que nos hace falta ? 

**Prompt 8:**
Revisemos los objetivos del dia Martes 23 de Abril. Segun lo que tebnemos actualmente en el proyecto, que esta completado y que esta pendiente ? Recuerda revisar la lista de objetivos del dia, no la tabla del organigrama.

**Prompt 9:**
Vamos entonces con el objetivo "Probar conexiones básicas end-to-end" de Slack. Cuentame, que necesitamos para esto ? Explicalo paso a paso, no ejecutes nada ni sugieras comandos. Solo explicame lo que vamos a hacer para que todo funcione. 

**Prompt 10:**
Funciono ! Eso me gusta mucho ! solo que fue usado con el comando "npm run dev" y estaba usandolo antes con "docker-compose up --build" que levantaba la app tambien. Ahora que la ejecuto, me sale este error. Se debe a que simplificamos o cual es la explicacion?  Podemos resolverlo para que el programa pueda correr alli tambien ? 

---------------------------------------
#### Pull Request #2: Comando /tg-search
---------------------------------------
**Prompt 1:**
Hoy vamos a trabajar en el Dia 1 de la Semana 3. Los objetivos principales seran:

* Implementar comando /tg-search base.
* Crear sistema de búsqueda por keywords.
* Implementar conexión con API de Confluence.
* Configurar sistema de indexación de documentos.

Para ello, el flujo debe suceder de tal forma que pueda cumplir una historia de usuario como la resaltada en el readme. 

De aqui podemos destacar y considerar: 
1. Persona usa el comando para hacer una consulta con palabras clave
2. El bot toma las palabras clave y busca en Confluence documentos relacionados con esas palabras clave
3. Responde con minimo 1 documento de regreso.
4. La respuesta puede traer un resumen breve del documento, y el link al documento en si.

Con esto dicho, no quiero que ejecutes nada de codigo aun. Me gustaria que definieras la lista de tickets de trabajo, para considerar los objetivos de hoy, terminados, cumpliendo con esta funcionalidad principal, manteniendolo en el MVP planteado, y realizando sugerencias (Ej: Que no sea por Keywords sino por preguntas en lenguaje natural).

Regresame la lista de tickets, solo con el titulo para saber cuantas cosas debemos hacer.

**Prompt 2:**
Prioricemos los tickets. Para cada ticket, damelos en el siguiente formato Markdown: 
```
-----
Ticket # (Numero del ticket)
*TITULO: * (Titulo del ticket)
*Descripcion: * (Descripcion no mayor a 3 lineas de lo que se hara)
*Prioridad: * (Prioridad definida arriba)
*Estimado: * (Tiempo en horas)
*Comentarios: * (Notas a considerar si aplica)
```

**Prompt 3:**
Desarrollemos el primer ticket: Diseñar y documentar el flujo base del comando /tg-search. Para toda esta documentacion, crea un nuevo archivo Markdown, en la carpeta "docs". Recuerda mantener cualquier implementacion lo mas sencilla posible, y alineada al @TG-TheGuardian-README.md ya existente.

**Prompt 4:**
Pasemos al Segundo Ticket: Implementar el endpoint/comando /tg-search en el bot. Explicame paso a paso como avanzaras para desarrollar este ticket. No ejecutes nada.

**Prompt 5:**
Procedamos con los pasos. Recuerda que actualmente, cuando el bot es usado y se envia "/tg-search" tiene una respuesta predefinida en @SlackAdapter.ts aqui . Considera los cambios pertinentes.

**Prompt 6:**
Procedamos con el 3er Ticket: Desarrollar el sistema de extracción de palabras clave desde la consulta del usuario.

**Prompt 7:**
Vamos ahora con el ticket 4: Implementar el adaptador de conexión con la API de Confluence. Este por ser la integracion de una nueva API, me gustaria que tuviesemos cuidado y me indiques paso a paso donde debo intervenir para la configuracion del API. Hasta el momento, recuerdo que ya teniamos algunos archivos de test y adaptadores para Confluence como @ConfluenceAdapter.ts @ConfluenceDocument.ts , asi que revisa antes de implementar logica nueva. 

---------------------------------------
#### Pull Request #3: Comando /tg-question
---------------------------------------
**Prompt 1:**
Vamos a implementar la funcionalidad del comando "/tg-question". Para ello, tenemos 4 objetivos principales: 
* Implementar el comando /tg-question
* Crear sistema de procesamiento de lenguaje natural
* Implementar integración con LLM
* Desarrollar sistema de contexto para respuestas

Quiero que respondas a las siguientes preguntas antes de empezar a ejecutar: 
1. Cual es el LLM que usaremos y consideres mejor para el servisio, teniendo en cuenta lo que se busca con el proyecto? Hazme una lista de 3 posibles candidatos, con ventajas y desventajas, dificultad de implementacion, y valor al proyecto. Concluye entre las 3 la mas acertada.
2. Como manejaremos el tema de conversaciones por lenguaje natural ? El LLM sera capaz de leer los archivos de confluence para responder? (eso estaria genial). Quiero entender como lo definiremos para este MVP, y con ello, saber el alcance que tendra. 
3. Como mantendremos la seguridad de la informacion del LLM ? Me interesa que sea un LLM local. Encuentras mas info de seguridad en el @readme.md de ser necesario.
4. Teniendo todos los anteriores puntos listos, como vas a hacer la funcionalidad ? Describeme el paso a paso del desarrollo del feature para entender (es la primera vez que hago un producto asi), y que cumpla con los objetivos principales.

**Prompt 2:**
Con esto establecido, iremos paso por paso, dentro de los 7 pasos del plan de desarrollo, comenzando con el Paso 1: Configuracion Base. 

Recuerda que actualmente ya tenemos conexiones funcionando a Slack y a Confluence gracias al comando "/tg-search" que tenemos funcionando para buscar documentos en confluence desde Slack (mas info en @TG-SEARCH-FLOW.md ). 

A partir de este proceso, quiero que siempre revises el codigo existente y solo crees archivos si lo ves estrictamente necesario. 

**Prompt 3:**
Vamos con el Paso 2: Implementacion del comando en Slack. Para esto, considera que el comando ya existe tanto en el API de Slack (en la pagina web) configurado, como en el proyecto, ya que responde al comando "/tg-question" devolviendo una respuesta generica. Incluso devuelve un mensaje si el input no termina en caracter "?". Esto ultimo me gustaria removerlo porque limita las consultas en lenguaje natural.

Ejecuta el paso y dejalo listo para que luego continuemos con el Paso 3: Sistema de procesamiento natural.

**Prompt 4:**
Ya tenemos funcionando el comando "/tg-question", y con los ajustes requeridos para que nos envie una respuesta estatica en Slack. Retomando nuestros siguientes pasos del plan de desarrollo:

Paso 3: Sistema de procesamiento natural
Paso 4: Integración con LLM

Recuerda que para esto, estamos considerando Llama como el LLM escogido, debe vivir de manera local, y que ya tenemos un adaptador para el LLM llamado @OpenAIAdapter.ts . Para ello, considera: 

* Instalemos la version mas actualizada de Llama que se adapte a nuestro proyecto
* Recuerda los parametros de seguridad del @readme.md , para tener en cuenta a la hora de implementar el LLM en nuestro proyecto. 
* Cambiemos el nombre del adaptador de "OpenAIAdapter" a "LlamaAdapter" y con ello, revisemos que todas las referencias a ese archivo sean reemplazadas para su buena fucionalidad.
* Generemos una prueba cuando se ejecute el comando "/tg-question", para validar que el LLM fue integrado correctamente en el proyecto.

**Prompt 5:**
Quiero que ahora revisemos el Paso 5: Sistema de contexto, y luego de finalizado, revisemos el flujo completo que me sugeriste asi: 

1. Usuario envía /tg-question ¿Cómo funciona el sistema de combate?
2. NLP procesa la pregunta y extrae intención
3. Sistema busca documentos relevantes en VectorDB
4. LLM genera respuesta basada en documentos encontrados
5. Se guarda contexto en Redis
6. Se envía respuesta formateada al usuario

Recuerda que antes de cualquier implementacion, revisa muy bien la estructura del proyecto por si hay archivos ya creados y que no tengamos duplicados. Mantenlo sencillo y claro para cumplir el objetivo del MVP y con ello, los objetivos del 06 de Mayo segun@TG-TheGuardian-Organigrama.md .