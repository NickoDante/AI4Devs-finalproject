-------------------------------------------------------------------
#PROMPTS MEJORAS DEL CHATBOT
-------------------------------------------------------------------

##Prompt 1:
Eres un Programador Fullstack experto en desarrollo de aplicaciones con bots en Slack, integracion de LLMs locales, y desarrollo de API de confluence. Estamos desarrollando juntos el proyecto llamado "TG - TheGuardian". Necesito que consideres: 

* En la carpeta "docs", encontraras todos los archivos con el contexto, arquitectura, contenido y caracteristicas funcionales que se quiere lograr con el producto. Lee cada archivo.
* En el @TG-TheGuardian-Organigrama.md encontraras fechas de entrega, dias de ausencia, y el cronograma por dias con objetivos diarios, para lograr el MVP. 
* Ya estamos a punto de hacer la entrega final del proyecto. Quiero hacer un par de mejoras pero te las contare despues

De momento quiero que lo leas y tengas el contexto del proyecto antes de que comencemos. No resumas ni concluyas, ni ejecutes nada.

##Prompt 2:
Crea un archivo markdown .md llamado "tg-improvements.md", en la carpeta "finalproject-NNB/Improvements" , y quiero que de ahora en adelante, plasmes alli, cada uno de los prompts que exclusivamente yo te escriba en este chat, empezando con este prompt. El formato sera: 

```
-------------------------------------------------------------------
#PROMPTS MEJORAS DEL CHATBOT
-------------------------------------------------------------------

##Prompt (numero incremental de prompt):
(Contenido del prompt)

```

##Prompt 3:
Debo entregar el code base de todo este proyecto en un .zip. Que carpetas y archivos, consideras que deben ir en esa entrega, que sean realmente relevantes, y que no comprometan datos delicados como los que hay en el .env ? Solo responde, no ejecutes

##Prompt 4:
Nos vamos a centrar segun @TG-TheGuardian-Organigrama.md , en los objetivos del dia Martes 10 de Junio. 

Actualmente, las funcionalidades principales con los comandos "mencion (@TG)", "tg-search", "tg-question" y "tg-summary" funcionan bien y dan resultados, pero me gustaria que fuesen mucho mas eficientes. 

Es por ello que estoy considerando desarrollar el sistema RAG, con el fin de: 
- Optimizar los tiempos de respuesta de esos comandos
- Que nuestro actuar LLM (estamos usando Llama), pueda adquirir su conocimiento a partir de los espacios en Confluence que se le puedan setear.
- Que las respuestas de estos comandos sea mucho mas efectiva en aspectos como: Manera de responder (recordemos que es un personaje de TG y debe actuar como tal), y resumen (actualmente solo hace transcripciones y no resumenes de pdfs y links).

Me gustaria que, con este contexto, revises el proyecto actual, la estructura de cada carpeta para conocer lo que ya esta implementado, y con esto dicho, me expliques cuales son los pasos, para cumplir los objetivos del dia Martes 10 de Junio. Ten muy presente que no debemos instalar nuevas dependencias de no ser estrictamente necesario, al igual que la creacion de nuevos adapters o ports, si no son necesarios. Quiero que mantengamos la solucion sencilla, directa, clara, y limpia con lo estrictamente necesario. No ejecutes aun, solo explicame el plan de accion.

##Prompt 5:
Me gusta mucho el plan de acción. Desarrollemoslos de manera secuencial para cumplir los objetivos de la manera mas limpia y sencilla posible: 

1. Modelo Codificador
2. Base de datos Vectorial
3. Sistema de embeddings
4. Busqueda semantica
5. Mejoras en la personalidad.

Manten los cambios necesarios sin errores , verificando al final de lo implementado si hay errores de typescript. Recuerda reusar clases que ya identificas que existen, para incorporar las nuevas mejoras.

##Prompt 6:
Vamos a desarrollar el sistema de embeddings. Recuerda realizar los cambios estrictamente necesarios y mantenerlo sencillo, simple y limpio. Dejalo listo para luego implementar la busqueda semantica.

##Prompt 7:
He probado los cambios realizados y todos aparentemente funcionan bien, excepto por un caso particular. Intente usar el comando "tg-question" con un link a confluence, y segun el log, me arrojo todo el resumen que buscaba, pero no lo mostro en el chatbot. Tengo el log del resultado (Imagen 1) , y el resultado mostrado en Slack, luego de 8 mensajes de espera (Imagen 2). 

Me gustaria que analizaras lo sucedido, me explicaras que fue lo que sucedio, porque no se mostro el resultado, habiendo recibido el resumen en el log, y finalmente, implementemos una solucion para ese caso en particular, sin afectar en lo posible, los otros comandos que funcionan bien.

##Prompt 8:
Levantemos el docker. Me gustaria que revisaras el resultado.

##Prompt 9:
Esta funcionando bastante bien ! Ahora hay otro caso en particular con el comando "tg-summary" y los archivos adjuntos. El resultado lo esta haciendo pero: 
1. El primero no es un resumen, parece mas una transcripcion. Me gustaria que fuese mas una explicacion resumida del contenido, aprovechando que quien hace el resumen es un bot con personalidad
2. El resultado siempre me lo da en ingles, a pesar de usar el comando en español.

Realicemos los cambios pertinentes, pero sin comprometer los demas comando, ni el caso de summary con link. Recuerda que el feature ya funciona, solo que queremos mejorarlo en ese caso particular.