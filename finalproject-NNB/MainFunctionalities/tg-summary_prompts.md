-------------------------------------------------------------------
#PROMPTS COMANDO "TG-SUMMARY"
-------------------------------------------------------------------

##Prompt 1:
Eres un Programador Fullstack experto en desarrollo de aplicaciones con bots en Slack, integracion de LLMs locales, y desarrollo de API de confluence. Estamos desarrollando juntos el proyecto llamado "TG - TheGuardian". Necesito que consideres: 

* En la carpeta "docs" , y en el @TG-TheGuardian-README.md encontraras todo el contexto, arquitectura, contenido y caracteristicas funcionales que se quiere lograr con el producto. 
* En el @TG-TheGuardian-Organigrama.md encontraras fechas de entrega, dias de ausencia, y el cronograma por dias con objetivos diarios, para lograr el MVP. 
* Actualmente vamos en la Etapa 2, y comenzaremos los objetivos del Miercoles 7 de Mayo.

De momento quiero que lo leas y tengas el contexto del proyecto antes de que comencemos. No resumas ni concluyas, ni ejecutes nada.

##Prompt 2:
Vamos a implementar la 3ra y ultima funcionalidad del bot: el comando "/tg-summary". Para ello, tenemos 4 objetivos principales: 

✅ Implementar comando /tg-summary
✅ Crear sistema de procesamiento de PDFs
✅ Implementar extracción de contenido de Confluence
✅ Desarrollar algoritmo de generación de resúmenes

Para esto, quiero que tengas presente los casos de uso de este comando: 
1. Una persona puede subir un pdf, para pedirle al bot que lo resuma.
2. Una persona puede pasar un link, para pedirle al bot que lo resuma.

Considera:
- El comando ya esta imoplementado y solo esta mostrando un mensaje quemado, siempre y cuando se envie un link.
- El comando responde cuando no se envia un link. Esto consideremos removerlo o replantear la forma en que le diremos al usuario que se debe usar un pdf o un link.
- Actualmente esta funcionando la version docker con @TG-Guardian_SlackBot_Test(Docker).bat . Necesito que, si vamos a hacer implementaciones y modificaciones, nos aseguremos que esto siempre este funcionando.
- Actualmente estan funcionando los comandos "mencion", "tg-question" y "tg-search". En lo posible, no toques nada de esa logica para que sigan funcionando.

Teniendo todos los anteriores puntos listos, como vas a hacer la funcionalidad ? Describeme el paso a paso del desarrollo del feature para entender (es la primera vez que hago un producto asi), y que cumpla con los objetivos principales del MVP para considerar los objetivos completados en su totalidad.

##Prompt 3:
Me parece un muy buen plan. Estos 8 pasos, seran nuestros "Pasos Principales". Empecemos con el Paso Principal 1: Modificar la Validación para Soportar PDFs y URLs. 

Recuerda que las implementaciones deben hacerse de la manera mas clara, escalable y robusta posible, y aseguremonos que no existan errores en los archivos que modifiquemos.

##Prompt 4:
Antes de pasar al paso principal 2, me gustaria que crearas documentacion de este comando en la carpeta "docs", tal como hemos hecho con @TG-SEARCH-FLOW.md y @TG-QUESTION-FLOW.md . Ademas de ello, recuerdo que en el comando de Mencion, donde aparecen las instrucciones de cada comando, lo actualicemos tambien para que el comando refleje que se puede usar pdfs, y URLs

##Prompt 5:
De momento, los comandos funcionan bien. Del lado de tg-summary funciona con URL, pero no esta detectando cuando subo un pdf (Imagen 1). El resultado es el siguiente (Imagen 2), que es lo que muestra segun entiendo, si no hay texto o archivo. 

##Prompt 6:
Volvi a hacer la misma prueba, y este fue el resultado. Aparentemente tampoco detecto el PDF, y se puso a buscar uno mas reciente, pero genero ese error. y el resultado fue un aparente "success" con dos respuestas (Imagen 2)

##Prompt 7:
Vamos al Paso principal 2: Crear Adaptador para Procesamiento de PDFs. Recuerda mantener el @TG-SUMMARY-FLOW.md actualizado luego de tu implementacion.

##Prompt 8:
Cuando dices que los PDFs adjuntos requieren permisos de Slack, a que te refieres ? Indicame como habilitar dichos permisos.

##Prompt 9:
Acabo de darle los permisos que me sugeriste, y el Token no cambio. A partir de esto, que consideras deberiamos hacer antes de pasar al paso principal 3 ? Modifica los archivos que consideres necesarios, con las consioderaciones iniciales que te di (no tocar logica en lo posible de los otros comandos actualmente funcionales, y mantener sencillez y escalabilidad). Si vas a crear tests unitarios, usa como referencia lo que hicimos para los otros comandos: @question.command.test.ts y @search.command.test.ts 

##Prompt 10:
Tengo varios casos a revisar: 
1. Imagen 1: Quise usar el comando "tg-question", con la frase "Cuales son los benefits de Teravision Games ?", y me salto este error. Posiblemente por el signo "?", pero no lo se. Estamos seguros que no modificamos nada de este comando "tg-search" ? De ser asi, arreglalo.
2. Imagen 2: Al usar el comando "tg-summary", con un PDF, el resultado fue este. Me lo muestra como error, pero me dice "Found". Eso es bueno ? Me gustaria que el comando me muestre si esta revisando URL o PDF, y que, asi como muestra entre comillas en el comando "tg-question" el request que se le pidio, muestre tambien la URL a revisar, o el titulo del pdf que esta leyendo. Ademas de eso, no mostrarlo como error si es el resultado esperado.
3. Imagen 3: Al usar el comando "tg-summary", cuando quise copiar y pegar un enlace de Confluence, en vez de poner textualmente el "https://..." lo coloco como una frase de texto con un hipervinculo atachado. Al ser una frase, el comando lo reconocio invalido por no comenzar explicitamente con "https://"... Como podemos atacar ese caso ?

Ejecuta secuencialmente caso por caso, para que no hayan confusiones, y que puedas resolver uno a uno cada caso a revisar.

##Prompt 11:
Hay casos bordes sucediendo, y te lo explicare uno por uno. Primero vamos con este: 

- Use el comando "tg-summary", con el link explicito "https://teravisiongames.atlassian.net/wiki/spaces/UL/pages/3449913347/Raptor+Diamond+Currency ", pero el resultado que me mostro fue ambigua porque me dice que se genero resumen pero que falló (Imagen 2). El log me muestra esto (Imagen 1). 

##Prompt 12:
Recuerda que el URL no tiene que ser estrictamente de confluence. Lo estas considerando ? 

##Prompt 13:
El siguiente caso borde es usando el comando "tg-summary" y cuando adjunto un PDF. El resultado en Slack es este (Imagen 1), como si detectara el pdf pero lo considera como URL. Por otro lado, el log me muestra esto (Imagen 2) 

##Prompt 14:
Sigue fallando. Creo que es porque estamos tratando de resolver todo al tiempo. Vamos por partes: primero el resumen por URL. Actualmente, existen dos casos: Cuando paso un link explicito empezando por "http" o "https", y el otro caso es cuando se copia un texto, con un hipervinculo. Como ejemplo, vamos a ver este: 

- Caso 1: "https://teravisiongames.atlassian.net/wiki/spaces/TKA/pages/3130392600/C+Coding+Conventions "
- Caso 2: La frase "📝C++ Coding Conventions - TG Knowledge Archive - Confluence", que tiene un hipervinculo a "https://teravisiongames.atlassian.net/wiki/spaces/TKA/pages/3130392600/C+Coding+Conventions "

Lo que deberia suceder es: 
- CASO 1: Al ejecutar el comando "tg-summary" con un link explicito, revisa primero si es URL o PDF. Si es URL, verifica si es URL general o URL de confluence (que contiene el attlasian.net). Luego de eso, notifica si el input es valido o no. Aun no debe resumir.
- CASO 2: Al ejecutar el comando "tg-summary" con un texto con hipervinculo atachado, revisa si el texto tiene o no hipervinculo. De no tenerlo se considera error. De tenerlo, extrae el hipervinculo y sigue los pasos del caso 1 como link explicito.

En ambos casos, debe mostrar lo que esta buscando: En el caso 1 lo esta mostrando bien (Imagen 1), pero en el caso 2 no lo hace (Imagen 2)

##Prompt 15:
Con la URL explicita funciona perfecto. Pero con el texto con hipervinculo no. Lo sigue tomando como texto cualquiera. Este es el Log. Que configuracion necesitamos o como podemos trabajar un workaround ya que lo seguimos intentando y no hemos dado con el tema. Sera que es la manera en que validamos si es texto o link ? 

##Prompt 16:
Ok, de momento no funciona el texto con hipervionculo y lo dejaremos asi, solamente con links explicitos. Ahora quiero que nos concentremos en PDFs. Cuando uso el comando "tg-summary", no pongo ningun texto adicional, pero si adjunto el documento pdf. El resultado es el de la Imagen. Me gustaria que: 
- al ejecutar el comando "tg-summary" primero revise si hay documentos atachados, antes de revisar si hay hipervinculo. 
- De existir el archivo adjunto valido (por los formatos), que al igual que en el caso del link explicito, me muestre que si esta recibiendo el archivo de manera exitosa y que me muestre aunque sea el titulo del archivo. Que no resuma aun nada. 
- De no existir el archivo adjunto o no ser valido, ahi si revisar el texto para saber si hay link y con ello seguir el caso de URL. 

##Prompt 17:
Actualiza el @TG-SUMMARY-FLOW.md con los cambios que tenemos hasta el momento. 

##Prompt 18:
Replanteemos la manera en que recibimos el archivo adjunto, porque no lo esta reconociendo. Este es el Log, y este es el resultado en Slack. Recuerda que estoy usando "tg-summary" sin texto, pero con archivo adjunto. Sera la manera en que estamos leyendo el archivo en Slack ? 

##Prompt 19:
Actualicemos @TG-SUMMARY-FLOW.md,  el @readme.md y @TG-TheGuardian-README.md con este nuevo workaround

##Prompt 20:
Con esto en cuenta, y teniendo en cuenta que apagamos temporalmente la funcionalidad de resumir, con URLs, y ahora con pdfs con mencion. Consideras que estamos listos para el Paso Principal 3 ? 

##Prompt 21:
Actualmente, con cada una de las soluciones que implementamos para el "tg-summary", cual deberia ser el resultado del uso de cada uno ? 

##Prompt 22:
Inicialmente, cuando empezamos a trabajar en este comando, habiamos establecido estos pasos principales: 

Paso 1: Modificar la Validación para Soportar PDFs y URLs ⏱️ (30 min)
Paso 2: Crear Adaptador para Procesamiento de PDFs ⏱️ (1.5 horas)
Paso 3: Crear Servicio de Extracción de Contenido ⏱️ (1 hora)
Paso 4: Crear Servicio de Generación de Resúmenes ⏱️ (1 hora)
Paso 5: Crear Caso de Uso para Procesamiento de Resúmenes ⏱️ (45 min)
Paso 6: Modificar SlackAdapter para Manejar Archivos ⏱️ (45 min)
Paso 7: Actualizar el Comando para Usar la Nueva Lógica ⏱️ (30 min)
Paso 8: Testing y Validación ⏱️ (30 min)

Sin embargo, en el paso 2 donde nos encontramos actualmente, fue cuando decidimos el workaround para manejar URLs y PDFs. Me gustaria re-analizar ese plan con los cambios para establecer el nuevo plan paso a paso, agregando el tema de reactivar el procesamiento en cada caso.

##Prompt 23:
Trabajemos ahora con el Plan revisado. Paso Principal 3: Reactivación del Procesamiento. Recuerda siempre mantener codigo simple, claro y robusto que permita cumplir el objetivo, y de ser necesario, actualizar la documentacion de @TG-SUMMARY-FLOW.md . Omite los subpasos de testing, porque yo hare eso de manera manual, pero dejalo listo para tener el resultado deseado, y ready para el Paso Principal 4: Optimizaciones y Mejoras.

##Prompt 24:
En el sistema dual, me gustaria que en el caso del archivo adjunto, funcione con la palabra "summary" y tambien con la palabra "resume".
Ej: 
```
@tg summary  + archivo adjunto
@tg resume + archivo adjunto
```
Esto para permitir que se pueda tener el comando en ingles y español. 

##Prompt 25:
Que me recomiendas para manejar el mismo tema con el comando de URL ? Tengo en mi cabeza que, by default, sea en español... pero que si le pongo un parametro opcional de lenguaje, le pueda setear el lenguaje de resultado 
EJ: 
/tg-summary ULR + ES/EN (Opcional)

##Prompt 26:
Implementemoslo. Dejemoslo claro, actualizado en documentacion, aseguremonos que no hay errores, actualicemos los tests, y dejemoslo listo para el paso Principal 4.

##Prompt 27:
Al parecer tenemos un error. Fui a ejecutar @TG-Guardian_SlackBot_Test(Docker).bat y ya no funciona. Se cierra solo. podriamos ejecutar el com,ando desde aqui ? 

##Prompt 28:
Estoy haciendo el test de manera manual para ambos casos: 

Caso 1: Al usar el comando para URL, este fue el resultado (Imagen 1). No hizo el resumen, y marco un error 403, pero si logro detectarlo como un URL valido. Esto a que se debe ? Si se trata de permisos para entrar a confluence, como podemos habilitarlo? Las variables de entorno de Confluence ya se encuentran en un .env, asi que, como podemos darle acceso a cualquier user a que haga login de confluence ? 

Caso 2: Al pasarle un archivo pdf, lo reconoce sin problemas. El tema es que dice que esta procesando el documento, pero no hace nada mas (Imagen 2). A que se debe ? 

Primero resolvamos el Caso 1, asumiendo que el .env ya esta listo y creado.

##Prompt 29:
Esta fallando de nuevo el @TG-Guardian_SlackBot_Test(Docker).bat porque se cierra al ejecutar. El docker desktop ya esta abierto. 

##Prompt 30:
Ya casi estamos. Tengo varias correcciones y ajustes por hacer: 

1. Al usar el comando de mencion, donde muestra instrucciones, me gustaria que actualizaramos el de Summary, incluyendo las dos vias por las que se puede resumir (Imagen 1).
2. Cuando fui a usar el comando "tg-summary" para poner una URL, resumio el documento que previamente existia en PDF. El resumen esta bien, pero debia era resumir el URL que le pase (Imagen 2). Me gustaria que solo resumieramos PDFs si fue usado con el comando de mencion, no con el historial, y que al usar el comando para resumir URLs, le de prioridad a las URLs.
3. Al usar el comando de mencion, para resumir archivos PDFs, se quedo estancado en el mismo sitio, diciendo que esta procesando, pero no hace nada (Imagen 3). Deberia hacer lo que accidentalmente esta haciendo el punto 2, sin arreglar, porque ahi si esta resumiendo el PDF. 

##Prompt 31:
Verifica si el Paso Principal 4: Optimizaciones y Mejoras, ya esta completado en su totalidad. Has lo mismo para el Paso Principal 5: Testing Integral .

##Prompt 32:
Agrega en el @readme.md , especificamente en la linea 1435, un nuevo Pull Request, con todo lo que realizamos con respecto al comando "tg-summary". Guiate del formato manejado aqui .