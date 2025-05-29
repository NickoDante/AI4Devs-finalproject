-------------------------------------------------------------------
#PROMPTS COMANDO "TG-SEARCH"
-------------------------------------------------------------------

##Prompt 1:
Eres un Programador Fullstack experto en desarrollo de aplicaciones con bots en Slack, integracion de LLMs locales, y desarrollo de API de confluence. Estamos desarrollando juntos el proyecto llamado "TG - TheGuardian". En el @TG-TheGuardian-README.md  encontraras todo el contexto, arquitectura, contenido y caracteristicas funcionales que se quiere lograr con el producto, y en el@TG-TheGuardian-Organigrama.md encontraras fechas de entrega, dias de ausencia, y el cronograma por dias con objetivos diarios, para lograr el MVP. De momento quiero que lo leas y tengas el contexto del proyecto antes de que comencemos. No resumas ni concluyas, ni ejecutes nada.

##Prompt 2:
De momento, vamos con los objetivos del dia Miercoles 30 de Abril. Que objetivos tenemos ? y para cada uno, que me sugieres realizar ? Explicamelo paso a paso.

##Prompt 3:
Perfecto. Tenemos estipuladas lo que llamaremos nuestros OBJETIVOS PRINCIPALES. Vamos con el primero: Pruebas de integracion de componentes base, siguiendo la priorizacion sugerida que mencionaste por lo que es critico para asegurarnos que todo funcione correctamente. Para ello mencionaste 3 subobjetivos y quiero que vayamos por el primero: Pruebas de integracion con Slack. Explicame paso a paso lo que haremos antes de ejecutar.

##Prompt 4:
Ahora que sabemos lo que haremos, hagamoslo. Mantengamoslo tan simple y sencillo como sea posible para que el proyecto no se vea afectado, ya que actualmente esta compilando perfecto y sin errores. 

##Prompt 5:
Vamos con el siguiente subobjetivo: Pruebas de integracion con MongoDB. Explicame paso a paso lo que haremos antes de ejecutarlo.

##Prompt 6:
Perfecto, ya ejecute "npm run test:mongodb" y las pruebas pasaron. Pasemos al subojetivo 3: Pruebas de integracion con Redis. De nuevo, explicame el paso a paso de lo que ejecutaras, antes de hacerlo. Manten toda implementacion de la manera mas limpia y sencilla posible, para que el proyecto siga siendo funcional y siga compilando correctamente.

##Prompt 7:
Con esto listo, tenemos el primer Objetivo Principal terminado. Vamos con el segundo objetivo principal: Documentar setup Inicial y configuraciones. Para esto, sugeriste hacer: 
- Documentacion de variables de entorno. Recuerda que estan en @.env , @.env.example (para repositorios) y @.env.local (para pruebas locales).
- Documentacion de configuracion de Docker.
- Guia de Instalacion rápida.

Quiero que añadas esto en el archivo @TG-TheGuardian-README.md, al final del documento. 

##Prompt 8:
Incluyamos el proceso de Despliegue del proyecto.

##Prompt 9:
Bien. Ahora vamos con el objetivo principal numero 3: Crear Scripts de utilidad (build, dev, test). Para ello, sugeriste: 
- Script de desarrollo..
- Script de construccion.
- Script de pruebas.
Me gustaria que los implementaramos, para considerar el objetivo completado. 

##Prompt 10:
Con estos scripts de utilidad, consideras el objetivo principal numero 3 terminado ? 

##Prompt 11:
Dicho esto, pasamos al ultimo objetivo principal numero 4: Review y ajustes de la etapa 1. Para ello, sugeriste las siguientes subtareas: 
1. Revisión de código:
- Verificar cumplimiento de estándares de código
- Revisar implementación de arquitectura hexagonal
- Validar manejo de errores y logging
2. Revisión de documentación:
- Verificar que toda la configuración esté documentada
- Validar que los README estén actualizados
- Comprobar que las guías de instalación sean claras
3. Revisión de seguridad:
- Verificar manejo seguro de tokens y secretos
- Revisar configuraciones de seguridad en MongoDB y Redis
- Validar implementación de rate limiting
4. Ajustes finales:
- Corregir cualquier problema identificado
- Optimizar configuraciones si es necesario
- Preparar el proyecto para la siguiente etapa. 

Empecemos con la subtarea 1. Realiza la revision de codigo de lo que actualmente tenemos, revisando los 3 items que me sugeriste de esta subtarea, pero siempre manteniendo cualquier cambio de manera simple y claro, buscando mantener las caracteristicas principales del proyecto para cumplir el MVP.

##Prompt 12:
Vamos ahora con la subtarea 2: Revision de documentacion. Realiza la revision necesaria, verificando que la configuracion este documentada, los README esten actualizados, y las guias de instalacion sean claras. El @readme.md y el @TG-TheGuardian-README.md de la raiz no debe ser revisado ni modificado.

##Prompt 13:
Con esto listo, hemos terminado la documentacion, por lo que ya no necesito que documentes más. Me gustaria que revisaramos si el proyecto esta listo en su etapa 1, para la siguiente etapa, segun @TG-TheGuardian-Organigrama.md 

##Prompt 14:
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

##Prompt 15:
Para cada ticket, damelos en el siguiente formato Markdown: 
```
-----
Ticket # (Numero del ticket)
*TITULO: * (Titulo del ticket)
*Descripcion: * (Descripcion no mayor a 3 lineas de lo que se hara)
*Prioridad: * (Prioridad definida arriba)
*Estimado: * (Tiempo en horas)
*Comentarios: * (Notas a considerar si aplica)
```

##Prompt 16:
Desarrollemos el primer ticket: Diseñar y documentar el flujo base del comando /tg-search. Para toda esta documentacion, crea un nuevo archivo Markdown, en la carpeta "docs". Recuerda mantener cualquier implementacion lo mas sencilla posible, y alineada al @TG-TheGuardian-README.md ya existente.

##Prompt 17:
Pasemos al Segundo Ticket: Implementar el endpoint/comando /tg-search en el bot. Explicame paso a paso como avanzaras para desarrollar este ticket. No ejecutes nada.

##Prompt 18:
Procedamos con los pasos. Recuerda que actualmente, cuando el bot es usado y se envia "/tg-search" tiene una respuesta predefinida en @SlackAdapter.ts aqui . Considera los cambios pertinentes.

##Prompt 19:
Procedamos con el 3er Ticket: Desarrollar el sistema de extracción de palabras clave desde la consulta del usuario.

##Prompt 20:
Vamos ahora con el ticket 4: Implementar el adaptador de conexión con la API de Confluence. Este por ser la integracion de una nueva API, me gustaria que tuviesemos cuidado y me indiques paso a paso donde debo intervenir para la configuracion del API. Hasta el momento, recuerdo que ya teniamos algunos archivos de test y adaptadores para Confluence como @ConfluenceAdapter.ts @ConfluenceDocument.ts , asi que revisa antes de implementar logica nueva. 

##Prompt 21:
Tengo 2 preguntas: 
1. Donde obtengo el CONFLUENCE_SPACE_KEY? 
2. Si quiero que el bot acceda a multiples espacios, que podemos hacer en ese caso ? 

##Prompt 22:
Entre las opciones que me sugieres. Cual consideras que tiene mayor impacto, es mejor, y es mas escalable ? 

##Prompt 23:
Vamos con la opcion C. Considera incluso casos como por ejemplo, si el espacio no existe.

##Prompt 24:
actualicemos los test primero, y luego, integramos el espacio dinamico. 

##Prompt 25:
Si, procede. 

##Prompt 26:
Hagamos 2 cosas: 
1. Actualicemos la documentacion. 
2. Es necesario esta linea en el .env ? 

##Prompt 27:
Procedamos con las pruebas del comando. 

##Prompt 28:
Al usar el modo "npm run dev" me salto este error .

##Prompt 29: 
No hay errores, eso esta bien. Pero al usar el comando, no pasa nada. Lo intente con @TG-Guardian_SlackBot_Test(Docker).bat (levanta docker y usa el producto en modo "produccion"), y use @TG-Guardian_SlackBot_Test(Local-StartServices).bat (levanta MongoDB y Redis de manera local para usar "npm run dev"). Ninguno tuvo resultado. Niiquiera se si tengo conexion con Confluence.

##Prompt 30:
No veo los logs de Confluence. Recuerdo que esto antes nos sucedia con el adaptador de Slack, porque el Adaptador nunca se le llamaba su metodo Start() en el @index.ts . Es solo una hipotesis. Podrias revisarlo ? 

##Prompt 31:
Segun la imagen atachada 1, se hace una conexion satisfactoria con Confluence. Segun la imagen atachada 2, el comando es recibido, procesado, y hay respuesta, pero no se si debia devolver link o no. EL resultado en Slack, es lo que hay en la imagen atachada 3. Es intencional ? Trabajaremos en el link despues o como debia funcionar ? Ayudame a analizar estos resultados y explicamelos. 

##Prompt 32:
Entiendo que hayas encontrado la version antigua y estoy de acuerdo en que debemos eliminarla para mantener una sola. Realiza el cambio, pero recuerda nuestro objetivo actual que es resolver la discrepancia entre "SearchCommand" y "ProcessMessageUseCase", para tener un solo resultado al usar el comando.

##Prompt 33:
Revisa @SlackAdapter.ts , @index.ts y @search.command.test.ts que tienen errores.

##Prompt 34:
@search.command.test.ts presenta errores de nuevo

##Prompt 35:
Ya tenemos respuesta ! Y me gusta ! Lo unico es que el formato se ve extraño porque manda muchos caracteres. Revisa en @ProcessMessageUseCase.ts que: 
* La seccion de la linea 136, el formato este correcto para que la frase "Ver Documento sea clickeable, con el hipervinculo en result.metadata.url , para que no sea necesario mostrar todo el link.
* La seccion de la linea 137, muestra el contenido de manera muy literal con todo y formato HTML (Ejemplo: <h3 style="text-align: center;">Contenido </h3><p /><ol start="1"><li><p><ac:link><ri:page ri:content-title="NL-Cesantias e Intereses" ri:version-at-save="1" /><ac:link-body>Cesant&iacute;) y todo eso no es necesario. Solo el contenido de texto.
* La seccion de la linea 138 es de Tags o etiquetas. Si no hay etiquetas, coloca una frase que indique que no las tiene.

##Prompt 36:
Teniendo en cuenta la funcionalidad que acabamos de realizar, con respecto a busqueda por medio de palabras clave, y usando espacios de confluences definidos, quiero que trabajemos en Test unitarios. Revisemos los test realizados hasta el momento en @search.command.test.ts y cuentame, que sugerencias podrias ver en cada una de ellas (de haberlas).

##Prompt 37:
Me gustaria revisar los tests solamente de @search.command.test.ts . Recuerda que hasta el momento la funcionalidad del comando /tg-search sigue ocurriendo correctamente y la quiero mantener asi.

##Prompt 38:
Ya casi acabamos. En el @SlackAdapter.ts teniamos unos mensajes antes en la funcion "/tg-question" y "tg-summary" que igual funcionaban al hacer preguntas y validar incluso si eran validos los inputs. Quiero que los traigas de vuelta, exactamente como funcionaban antes para que convivan con la funcionalidad de "/tg-search" actual. Parte del codigo era: 

```
    if (message.type === 'command' && message.metadata?.command) {
      switch (message.metadata.command) {
        case 'search':
          return {
            content: `🔍 *Búsqueda de Documentos:* "${message.content}"\n\nBuscando en la base de documentos...\n• Término de búsqueda: ${message.content}\n• Solicitado por: ${message.username}\n• Canal: <#${message.channel}>`,
            type: 'text',
            metadata: {
              source: 'Búsqueda de documentos',
              confidence: 0.95
            }
          };

        case 'question':
          return {
            content: `❓ *Nueva Pregunta:* "${message.content}"\n\nAnalizando tu consulta...\n• Pregunta: ${message.content}\n• Solicitado por: ${message.username}\n• Canal: <#${message.channel}>`,
            type: 'text',
            metadata: {
              source: 'Sistema de preguntas y respuestas',
              confidence: 0.90
            }
          };

        case 'summary':
          return {
            content: `📝 *Solicitud de Resumen:* "${message.content}"\n\nGenerando resumen del documento...\n• Documento: ${message.content}\n• Tipo: ${message.content.endsWith('.pdf') ? 'PDF' : 'Link'}\n• Solicitado por: ${message.username}\n• Canal: <#${message.channel}>`,
            type: 'text',
            metadata: {
              source: 'Generador de resúmenes',
              confidence: 0.85
            }
          };
      }
```
o tambien
```
    this.app.command('/tg-question', async ({ command, ack, respond }) => {
      await ack();
      console.log('❓ Comando question recibido:', command);
      try {
        // Validar el comando
        await this.validationMiddleware.validateCommand('/tg-question')({ body: command } as any, { json: respond } as any, async () => {
          const botResponse = await this.processCommand(command, '/tg-question');
          await respond(this.formatResponse(botResponse));
        });
      } catch (error) {
        console.error('Error en comando question:', error);
        await respond('Lo siento, ocurrió un error al procesar tu pregunta.');
      }
    });

    this.app.command('/tg-summary', async ({ command, ack, respond }) => {
      await ack();
      console.log('📝 Comando summary recibido:', command);
      try {
        // Validar el comando
        await this.validationMiddleware.validateCommand('/tg-summary')({ body: command } as any, { json: respond } as any, async () => {
          const botResponse = await this.processCommand(command, '/tg-summary');
          await respond(this.formatResponse(botResponse));
        });
      } catch (error) {
        console.error('Error en comando summary:', error);
        await respond('Lo siento, ocurrió un error al generar el resumen.');
```

##Prompt 39:
A partir de todo lo desarrollado con respecto a la funcionalidad "/tg-search", redacta un Pull Request en la linea 1189 de @readme.md 

##Prompt 40:
Quiero hacer un ajuste enla manera en que se usa el comando "/tg-search". Me gustaria que: 
* En vez de ir "(espacio en confluence) (palabras clave)" como inputs, en ese orden, sea "(palabras clave) -- (espacio en confluence)"
* Uses el doble guion como indicacion de uso de un espacio en confluence especifico. Ejemplo: 
```
/tg-search code conventions -- NVP
```
Estare usando el comando tg-search, las palabras clave son "code conventions" y le estoy pasando "NVP" como parametro de espacio de confluence especifico a buscar.
* En caso de que en el comando no se use el doble guion, se asume que se buscara en el espacio por defecto, en este caso TKA.

Realiza los ajustes en donde consideres necesarios, especificamente en @ProcessMessageUseCase.ts ,@SlackAdapter.ts, @search.command.test.ts , @search.command.ts de ser el caso. Al finalizar, actualiza la documentacion en el@TG-SEARCH-FLOW.md 

##Prompt 41:
Dos cosas : 
1. Consideraste en el test @search.command.test.ts el caso cuando no se envia doble guion ? 
2. La seccion resaltada en @ProcessMessageUseCase.ts aun no esta actualizada con el nuevo orden y la indicacion que el espacio en confluence es opcional..

##Prompt 42:
Realiza una descripcion de los test para el comando "/tg-search" en el @readme.md , en la linea 654, basado en lo que tenemos en @search.command.test.ts y comenzando con el formato: 
```
#### Funcionalidad: (Nombre del comando)
(Contenido)
```