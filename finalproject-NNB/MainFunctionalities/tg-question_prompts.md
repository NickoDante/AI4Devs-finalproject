-------------------------------------------------------------------
#PROMPTS COMANDO "TG-QUESTION"
-------------------------------------------------------------------

##Prompt 1:
Eres un Programador Fullstack experto en desarrollo de aplicaciones con bots en Slack, integracion de LLMs locales, y desarrollo de API de confluence. Estamos desarrollando juntos el proyecto llamado "TG - TheGuardian". Necesito que consideres: 

* En la carpeta "docs" , y en el @TG-TheGuardian-README.md  encontraras todo el contexto, arquitectura, contenido y caracteristicas funcionales que se quiere lograr con el producto. 
* En el@TG-TheGuardian-Organigrama.md encontraras fechas de entrega, dias de ausencia, y el cronograma por dias con objetivos diarios, para lograr el MVP. 
* Actualmente vamos en la Etapa 2, y comenzaremos los objetivos del Martes 6 de Mayo.

De momento quiero que lo leas y tengas el contexto del proyecto antes de que comencemos. No resumas ni concluyas, ni ejecutes nada.

##Prompt 2:
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

##Prompt 3:
Con esto establecido, iremos paso por paso, dentro de los 7 pasos del plan de desarrollo, comenzando con el Paso 1: Configuracion Base. 

Recuerda que actualmente ya tenemos conexiones funcionando a Slack y a Confluence gracias al comando "/tg-search" que tenemos funcionando para buscar documentos en confluence desde Slack (mas info en @TG-SEARCH-FLOW.md ). 

A partir de este proceso, quiero que siempre revises el codigo existente y solo crees archivos si lo ves estrictamente necesario. 

##Prompt 4:
Vamos con el Paso 2: Implementacion del comando en Slack. Para esto, considera que el comando ya existe tanto en el API de Slack (en la pagina web) configurado, como en el proyecto, ya que responde al comando "/tg-question" devolviendo una respuesta generica. Incluso devuelve un mensaje si el input no termina en caracter "?". Esto ultimo me gustaria removerlo porque limita las consultas en lenguaje natural.

Ejecuta el paso y dejalo listo para que luego continuemos con el Paso 3: Sistema de procesamiento natural.

##Prompt 5:
Estoy teniendo problemas con el comando "npm run build". Me puedes decir de que se trata y corregirlo? 

##Prompt 6:
Corrige @HandleCommandUseCase.ts , @CachePort.ts y @commands.ts que tienen errores de compilacion

##Prompt 7:
Funciona! Y la app ya ejecuta bien, pero con los cambios que implementamos, tenemos varios cambios a ajustar: 

1. Al ejecutar "/tg-search", el resultado es Imagen 1 atachada. Se perdio la seccion "Ver Documento" como se veia antes en la Imagen 2 atachada. Esto se debe al cambio realizado en @ProcessMessageUseCase.ts , en la linea 156 a 162. Por favor corrigelo, trayendo la seccion de vuelta.
2. El comando "/tg-summary" antes enviaba un mensaje predeterminado al ejecutarse, ubicado en lo que borraste de @SlackAdapter.ts linea 253. Traelo de vuelta. Nadie te dijo que borraras eso.

##Prompt 8:
Los cambios fueron aplicados y funcionan ! Sin embargo hay un caso interesante: Al querer usar el comando "/tg-search" asi: "/tg-search time off", donde "time off" son las palabras clave, por alguna razon, me genera un error (Imagen 1) y en Slack solo me dice esto (Imagen 2). Sin embargo, con palabras ya usadas, funciona bien, y con palabras nuevas tambien. 

1. Cuentame de que se trata.
2. Para ese mensaje de Slack, Agregale un "Intentalo de nuevo", que le permita al usuario conocer que es el request el que tuvo el problema, no el.

##Prompt 9:
Para mejorar el problema de "/tg-search", limitemos el numero de resultados a solo 4 en lista. Si se llegan a detectar mas de 4 resultados, que aparezcan los 4 resultados, y un mensaje diciendo algo como "Hey!  Necesito más ojos! Hay mas resultados en Confluence... Si estos resultados no son suficientes, ingresa a Confluence directamente". Recuerda que el Bot debe tener una personalidad, por lo que el mensaje debe ser amistoso.

##Prompt 10:
Ya tenemos funcionando el comando "/tg-question", y con los ajustes requeridos para que nos envie una respuesta estatica en Slack. Retomando nuestros siguientes pasos del plan de desarrollo:

Paso 3: Sistema de procesamiento natural
Paso 4: Integración con LLM

Recuerda que para esto, estamos considerando Llama como el LLM escogido, debe vivir de manera local, y que ya tenemos un adaptador para el LLM llamado @OpenAIAdapter.ts . Para ello, considera: 

* Instalemos la version mas actualizada de Llama que se adapte a nuestro proyecto
* Recuerda los parametros de seguridad del @readme.md , para tener en cuenta a la hora de implementar el LLM en nuestro proyecto. 
* Cambiemos el nombre del adaptador de "OpenAIAdapter" a "LlamaAdapter" y con ello, revisemos que todas las referencias a ese archivo sean reemplazadas para su buena fucionalidad.
* Generemos una prueba cuando se ejecute el comando "/tg-question", para validar que el LLM fue integrado correctamente en el proyecto.

##Prompt 11:
Tengo mi .env listo para ser modificado. Como debo hacerlo ? 

##Prompt 12:
Ayudame entendiendo como debo descargar paso a paso el modelo GGUF compatible, que le venga mejor a este proyecto

##Prompt 13:
El test funciona. Me gustaria saber en este punto: Consideras los pasos 3 y 4 terminados ? 

##Prompt 14:
Quiero que ahora revisemos el Paso 5: Sistema de contexto, y luego de finalizado, revisemos el flujo completo que me sugeriste asi: 

1. Usuario envía /tg-question ¿Cómo funciona el sistema de combate?
2. NLP procesa la pregunta y extrae intención
3. Sistema busca documentos relevantes en VectorDB
4. LLM genera respuesta basada en documentos encontrados
5. Se guarda contexto en Redis
6. Se envía respuesta formateada al usuario

Recuerda que antes de cualquier implementacion, revisa muy bien la estructura del proyecto por si hay archivos ya creados y que no tengamos duplicados. Mantenlo sencillo y claro para cumplir el objetivo del MVP y con ello, los objetivos del 06 de Mayo segun@TG-TheGuardian-Organigrama.md .

##Prompt 15:
Me gustaria hacer dos modificaciones: 
1. el archivo @QUESTION_FLOW.md , pase a llamarse "TG-QUESTION-FLOW.md".
2. La informacion sobre el comado "/tg-question" que añadiste en @ARCHITECTURE.md , debe vivir en ese nuevo archivo.
3. El archivo debe tener la estructura y explicaciones, tal como lo tiene @TG-SEARCH-FLOW.md

##Prompt 16:
Dos nuevos ajustes: 
1. Me gustaria actualizar los pasos de instalacion tanto en @INSTALLATION.md como en @readme.md y @TG-TheGuardian-README.md  (si existe el campo de texto sobre instalacion), para explicar que se debe instalar el modelo de Llama.
2. Hay alguna forma de que, al ejecutar la aplicacion, detecte si no esta Llama, para sugerir la instalacion o para que instale el modelo ? Haz lo que sea mas sencillo. 

##Prompt 17:
El modelo Llama que instalamos, busca en confluence las respuestas a las preguntas que le hacemos ? O como responde ? El test indico en la pregunta que era una empresa fundada en Barcelona, pero esa respuesta es erronea. Es una empresa Colombiana. Podrias explciarme el flujo que esta haciendo el comando para responder ? 

##Prompt 18:
Con esto listo, ya podria probar el comando en Slack, verdad ? 

##Prompt 19:
Y que me dices de "npm install" ? Es que estoy ejecutando el @TG-Guardian_SlackBot_Test(Docker).bat que antes de la implementacion del comando, funcionaba bastante bien, pero ahora me genera un error y la ventana se cierra. Esto fue lo ultimo que capte. Podrias correr el comado aqui y verificar si tiene errores ? 

##Prompt 20:
Iniciando la app, me genero este error, y no se inicializo como debia. A que se debe ? 

##Prompt 21:
Corramos el comando "docker-compose up --build" para verificar que no haya errores

##Prompt 22:
Varias Cosas: 
1. Debo llevar la configuracion que hiciste de Redi, en el docker file, al .env ? 
2. Revisemos el error de MongoDB
3. cada vez que se lanza el comando de docker, se demora muchisimo en ejecutarse la app. Hay alguna manera de optimizarlo ? No lo hagas solo quiero que respondas. 
4. Estamos considerando tambien las pruebas locales que haciamos con @TG-Guardian_SlackBot_Test(Local-StartServices).bat y con el .env.local ? 

##Prompt 23:
Primero resolvamos el error de MongoDB, e intentemos optimizar el Docker enseguida. 

##Prompt 24:
El docker funciono perfecto! Me gustaria hacer dos modificaciones mas: 
1. Cuando uso el comando "/tg-question" el comando tarda en dar una respuesta, pero el usuario no sabe que debe esperar. Podemos colocar un mensaje amistoso (recuerda que The Guardian es nuestro personaje de multiples ojos) para que el usuario espere por la respuesta?
2. Intente probar de manera local y no me funciono. Use @TG-Guardian_SlackBot_Test(Local-StartServices).bat para levantar el MongoDB y el Redis localmente, pero al ejecutar "npm run dev", nunca se ejecuta la app. Podemos revisar y modificar para que funcione, sin comprometer lo que ya sirve al probar con Docker ? 

##Prompt 25:
No es necesario que crearas un archivo @DESARROLLO.md , porque ya existia @DEPLOYMENT.md . Revisa y ajusta @DEPLOYMENT.md , con la info que hay en @DESARROLLO.md para que finalmente, borres la que se llame "DESARROLLO"

##Prompt 26:
Haciendo la prueba local, ahora si inicia la app pero llega a un punto donde se queda aqui y me genera este error ahora. "[ERROR] 22:04:00 Error: require() cannot be used on an ESM graph with top-level await. Use import() instead. To see where the top-level await comes from, use --experimental-print-required-tla." Revisalo y corrigelo. Recuerda no comprometer la funcionalidad de Docker que ya estaba funcionando

##Prompt 27:
Corrijamos los problemas de @LlamaAdapter.ts para asegurarnos que todo funcione correctamente

##Prompt 28:
Llama me responde en ingles siempre. Me gustaria que respondiese a partir del lenguaje de la pregunta. Tambien, regresame los logs de inicializacion del Adapter, porque me son muy utiles. 

##Prompt 29:
A partir de lo desarrollado, Que tests unitarios podrias sugerirme para el comando "/tg-question"?

##Prompt 30:
Me gustaria que aplicaramos los tests de comando, de deteccion correcta de idioma, de generacion de respuestas, de manejo de errores y de mensajes de fallback. Actualmente tenemos el de @search.command.test.ts para los comandos de test , asi que revisa la estructura del proyecto y crea los tests como consideres conveniente

##Prompt 31:
Con esto, hemos creado la segunda funcionalidad importante de The Guardian. Documenta el Pull Request con respecto a todo lo desarrollado con el comando "/tg-question", y añadelo en la linea 1307 del @readme.md . En ese documento, ya existen otros 2 pull requests documentados antes de esa linea, asi que puedes guiarte de esas mismas plantillas para generar el pull request nuevo.

##Prompt 32:
Finalmente, vamos a mejorar el comando "tg-question": 

1. Cuando envio la pregunta, aparece un apartado de "The Guardian esta procesando tu pregunta...". Añade la pregunta que se hizo en plan 'The Guardian está procesando tu pregunta '(pregunta realizada)'...'.
2. En ocasiones la respuesta se demora muchisimo. Hay alguna alternativa para que cada X segundos, mandemos un mensaje de un banco de mensajes aleatorio, que permita saber que aun esta procesando, y que se detenga para cuando la respuesta fue encontrada?
3. Cuando finalmente encuentra la respuesta, No lo hace en el idioma esperado. Revisalo.
4. Al dar una respuesta, empieza con un mensaje amigable.
5. Al dar una respuesta, en el apartado de Fuente, coloca el link de donde viene la info. A veces esta solo buscando afuera.
6. En Confianza, revisa si ese valor es acorde. Dame opciones para ver cual aplicamos.

##Prompt 33:
Esta bien, pero en @ProcessQuestionUseCase.ts , me gustaria: 

1. Podriamos refactorizar de algun modo el enhanceMessageWithContext() ? Veo en varios sitios que le pasamos el "prompt" de la IA de manera repetida. 
2. En esa misma funcion le exigimos a la IA que debe responder siempre en Español. Me gustaria que lo dejaramos escalable, dependiendo al idioma de la pregunta: 
Ejemplos:
- Si se pregunta en español, se responde en español. 
- Si se pregunta en ingles, se responde en ingles.

##Prompt 34:
Tengo varias preocupaciones: 

1. Me preocupa que Llama esta buscando informacion afuera, y no desde confluence primero. Lo ideal es que primero consulte si hay documentacion en Confluence sobre lo que se esta preguntando y de ser asi, responda para que en el apartado de Fuente, añada el link del documento.
2. Como puedo yo entrenarlo mejor ? Que tips me darias para que se familiarice mas con el Confluence ? 

##Prompt 35:
Me gustan mucho las recomendaciones sugeridas. Quiero que ejecutemos: 

# Del 1. Mejorar la priorizacion de informacion de Confluence.
1.1 Aumentar el numero de documentos recuperados.
1.2 Mejorar el Prompt para el LLM.
1.3 Incluir URLs en el contexto
1.4 Extraer fragmentos mas largos para dar mayor contexto.

# Del 2. Tips para entrenar y familiarizar Llama con Confluence
Esto lo dejaremos en pausa, no ejecutes ninguno de esos. Me gustaria que los documentaras en un archivo Markdown en la carpeta "docs" como "NEXT-STEPS.md" y lo añadas en una seccion "Para el comando /tg-question".

# Del 3. Mejoras al calculo de confianza.
Hagamos la mejora que sugieres.

##Prompt 36:
Como ya tenemos tests del comando "/tg-question", me gustaria documentarlo en el @readme.md , exactamente en la linea 681. Lee primero todos los test que hicimos del comando, y documentalo en el formato correcto. Para el formato, guiate de las lineas 656-677 del archivo, donde documentamos las pruebas de "/tg-search"