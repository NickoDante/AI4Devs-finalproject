---------------------------------------------------------------------------
                    ORGANIGRAMA DE TG- THE GUARDIAN
---------------------------------------------------------------------------

ETAPAS DE TRABAJO
**Etapa 1: Setup Inicial y Configuración Base**
- Configuración del entorno de desarrollo, estructuras base y conexiones principales
- Duración: 2 semanas (21 Abril - 30 Abril, 2025)

**Etapa 2: Desarrollo Core y Funcionalidades Principales**
- Implementación de características principales del MVP
- Duración: 2 semanas (5 Mayo - 14 Mayo, 2025)

**Etapa 3: Desarrollo de Integraciones y Mejoras**
- Desarrollo de integraciones con servicios externos y optimizaciones
- Duración: 3 semanas (19 Mayo - 30 Mayo, 2025)

**Etapa 4: Testing, Depuración y Documentación Final**
- Pruebas, corrección de errores y documentación final
- Duración: 2 semanas (9 Junio - 16 Junio, 2025)

ORGANIGRAMA
---
Etapa 1
---
* Lunes 21 de Abril, 2025
* Semana #1
* Horas: 4
* Milestone: Código Funcional
* Objetivos:
- (✅) Crear repositorio y estructura base del proyecto
- (✅) Configurar entorno de desarrollo (TypeScript, ESLint, Prettier)
- (✅) Inicializar proyecto Node.js con dependencias básicas
- (✅) Crear estructura de carpetas siguiendo arquitectura hexagonal

* Martes 22 de Abril, 2025
* Semana #1
* Horas: 4
* Milestone: Código Funcional
* Objetivos:
- (✅) Configurar Docker y docker-compose
- (✅) Implementar conexión básica con MongoDB
- (✅) Implementar conexión básica con Redis
- (✅) Crear archivos de configuración base (.env, configs)

* Miércoles 23 de Abril, 2025
* Semana #1
* Horas: 4
* Milestone: Código Funcional
* Objetivos:
- (✅) Configurar app de Slack y obtener tokens necesarios
- (✅) Implementar conexión básica con Slack
- (✅) Crear estructura base para comandos de Slack
- (✅) Probar conexiones básicas end-to-end

* Lunes 28 de Abril, 2025
* Semana #2
* Horas: 4
* Milestone: Código Funcional
* Objetivos:
- (✅) Implementar modelos base de datos (User, Query, Document)
- (✅) Crear interfaces base para adaptadores
- (✅) Configurar sistema de logging
- (✅) Implementar manejo básico de errores

* Martes 29 de Abril, 2025
* Semana #2
* Horas: 4
* Milestone: Código Funcional
* Objetivo General:
  Implementación de la capa de seguridad y validación del sistema.
  Este día se centra en establecer los mecanismos de autenticación
  y autorización necesarios, junto con la implementación de
  validaciones robustas para todas las interacciones del sistema.
* Objetivos:
- (✅) Implementar autenticación básica con Slack
- (✅) Crear middleware de validación de requests
- (✅) Configurar sistema de caché con Redis
- (✅) Implementar healthchecks básicos

* Miércoles 30 de Abril, 2025
* Semana #2
* Horas: 4
* Milestone: Código Funcional
* Objetivo General:
  Finalización de la fase de configuración inicial y pruebas.
  Este día se dedica a realizar pruebas exhaustivas de integración,
  documentar toda la configuración implementada hasta el momento y
  preparar el sistema para la siguiente fase de desarrollo.
* Objetivos:
- (✅) Pruebas de integración de componentes base
- (✅) Documentar setup inicial y configuraciones
- (✅) Crear scripts de utilidad (build, dev, test)
- (✅) Review y ajustes de la etapa 1

---
Etapa 2
---
* Lunes 5 de Mayo, 2025
* Semana #3
* Horas: 4
* Milestone: Código Funcional
* Objetivo General:
  Implementación del comando /tg-search para búsqueda en Confluence.
  Este día se enfoca en establecer la estructura base del comando
  que permitirá a los usuarios buscar documentos mediante keywords,
  incluyendo la integración inicial con la API de Confluence.
* Objetivos:
- (✅) Implementar comando /tg-search base
- (✅) Crear sistema de búsqueda por keywords
- (✅) Implementar conexión con API de Confluence
- (✅) Configurar sistema de indexación de documentos

* Martes 6 de Mayo, 2025
* Semana #3
* Horas: 4
* Milestone: Código Funcional
* Objetivo General:
  Desarrollo del comando /tg-question para consultas en lenguaje natural.
  Este día se centra en la implementación del sistema de procesamiento
  de preguntas, tanto para consultas sobre proyectos como para temas
  administrativos, integrando el LLM para generar respuestas contextuales.
* Objetivos:
- (✅) Implementar comando /tg-question
- (✅) Crear sistema de procesamiento de lenguaje natural
- (✅) Implementar integración con LLM
- (✅) Desarrollar sistema de contexto para respuestas

* Miércoles 7 de Mayo, 2025
* Semana #3
* Horas: 4
* Milestone: Código Funcional
* Objetivo General:
  Implementación del comando /tg-summary para generación de resúmenes.
  Este día se dedica a crear la funcionalidad de resumen de documentos,
  permitiendo procesar tanto enlaces de Confluence como archivos PDF,
  y generando resúmenes concisos y relevantes.
* Objetivos:
- (✅) Implementar comando /tg-summary
- (✅) Crear sistema de procesamiento de PDFs
- (✅) Implementar extracción de contenido de Confluence
- (✅) Desarrollar algoritmo de generación de resúmenes

* Lunes 12 de Mayo, 2025
* Semana #4
* Horas: 4
* Milestone: Testing y Documentación
* Objetivo General:
  Inicio de la fase de pruebas unitarias de los comandos principales.
  Este día se enfoca en crear y ejecutar tests exhaustivos para cada
  comando implementado, asegurando su correcto funcionamiento y
  manejando diferentes casos de uso y escenarios de error.
* Objetivos:
- (✅) Implementar tests unitarios para /tg-search
- (✅) Implementar tests unitarios para /tg-question
- (✅) Implementar tests unitarios para /tg-summary
- (✅) Documentar resultados de pruebas

* Martes 13 de Mayo, 2025
* Semana #4
* Horas: 4
* Milestone: Documentación Técnica
* Objetivo General:
  Documentación detallada de la arquitectura y APIs del sistema.
  Este día se dedica a crear documentación técnica completa,
  incluyendo diagramas de arquitectura, flujos de datos y
  especificaciones de cada comando implementado.
* Objetivos:
- (✅) Documentar APIs y endpoints
- (✅) Crear guías de uso de comandos actualizados
- (✅) Documentar flujos principales
- (✅) Preparar documentación de arquitectura

* Miércoles 14 de Mayo, 2025
* Semana #4
* Horas: 4
* Milestone: Documentación Técnica
* Objetivo General:
  Finalización y revisión de la documentación técnica completa.
  Este día se enfoca en completar toda la documentación pendiente,
  realizar revisiones de calidad y asegurar que toda la información
  esté actualizada y sea precisa.
* Objetivos:
- (✅) Finalizar documentación técnica
- (✅) Crear diagramas de arquitectura
- (✅) Documentar configuraciones y variables
- (✅) Review final de documentación

---
Etapa 3
---
* Lunes 19 de Mayo, 2025
* Semana #5
* Horas: 4
* Milestone: Código Funcional
* Objetivo General:
  Integración completa con Confluence y mejora del sistema de búsqueda.
  Este día se centra en establecer una conexión robusta con Confluence,
  implementando un sistema de indexación eficiente y asegurando
  la correcta recuperación y procesamiento de documentos.
* Objetivos:
- (✅) Implementar integración con Confluence
- (✅) Crear sistema de indexación de documentos
- (✅) Implementar búsqueda avanzada
- (✅) Pruebas de integración con Confluence

* Martes 20 de Mayo, 2025
* Semana #5
* Horas: 4
* Milestone: Código Funcional
* Objetivo General:
  Optimización del sistema de resúmenes y procesamiento de documentos.
  Este día se dedica a mejorar la calidad de los resúmenes generados,
  refinando los prompts del LLM y estableciendo un sistema de
  retroalimentación para mejorar la precisión de las respuestas.
* Objetivos:
- (✅) Implementar sistema de resúmenes avanzado
- (✅) Optimizar prompts de LLM
- (✅) Crear sistema de feedback
- (✅) Pruebas de generación de resúmenes

* Miércoles 21 de Mayo, 2025
* Semana #5
* Horas: 4
* Milestone: Código Funcional
* Objetivo General:
  Implementación del sistema de caché y optimización de respuestas.
  Este día se enfoca en mejorar el rendimiento general del sistema,
  implementando estrategias de caché eficientes y optimizando
  el tiempo de respuesta de los comandos.
* Objetivos:
- (✅) Implementar sistema de caché avanzado
- (✅) Optimizar búsquedas frecuentes
- (✅) Mejorar formato de respuestas
- ( ) Pruebas de rendimiento

* Lunes 26 de Mayo, 2025
* Semana #6
* Horas: 4
* Milestone: Código Funcional
* Objetivo General:
  Implementación de sistema de logging y monitoreo avanzado.
  Este día se dedica a establecer un sistema robusto de seguimiento,
  que permita identificar y resolver problemas rápidamente,
  mejorando la capacidad de mantenimiento del sistema.
* Objetivos:
- (✅) Implementar logging avanzado
- (✅) Crear sistema de métricas
- (✅) Optimizar manejo de errores
- (✅) Pruebas de robustez

* Martes 27 de Mayo, 2025
* Semana #6
* Horas: 4
* Milestone: Código Funcional
* Objetivo General:
  Optimización de seguridad y rendimiento del sistema.
  Este día se enfoca en implementar medidas de seguridad adicionales,
  mejorando el control de acceso y la protección de datos,
  mientras se optimiza el consumo de recursos.
* Objetivos:
- (✅) Implementar rate limiting
- (✅) Mejorar seguridad general
- (✅) Optimizar consumo de recursos
- (✅) Pruebas de carga

* Miércoles 28 de Mayo, 2025
* Semana #6
* Horas: 4
* Milestone: Código Funcional
* Objetivo General:
  Preparación del sistema para el período de ausencia.
  Este día se dedica a asegurar la estabilidad del sistema,
  documentando el estado actual y preparando mecanismos
  de recuperación automática ante posibles fallos.
* Objetivos:
- (✅) Review general de funcionalidades
- (✅) Preparar para ausencia (1-7 Junio)
- (✅) Documentar estado actual
- (✅) Backup completo del proyecto

---
Etapa 4
---
* Lunes 9 de Junio, 2025
* Semana #7
* Horas: 4
* Milestone: Proyecto Final
* Objetivo General:
  Implementación de sistema OAuth para autenticación individual de usuarios.
  Este día se centra en desarrollar un sistema de autenticación empresarial
  que permita a cada usuario acceder a Confluence con sus propias credenciales,
  respetando los permisos individuales y mejorando la seguridad del sistema.
* Objetivos:
- ( ) Implementar OAuth 2.0 para Confluence
- ( ) Crear UserConfluenceAdapter para tokens individuales
- ( ) Desarrollar flujo de autorización en Slack
- ( ) Implementar endpoint de callback OAuth

* Martes 10 de Junio, 2025
* Semana #7
* Horas: 4
* Milestone: Proyecto Final
* Objetivo General:
  Desarrollo del sistema RAG (Retrieval-Augmented Generation) base.
  Este día se dedica a implementar la arquitectura fundamental del sistema RAG,
  incluyendo el modelo codificador para vectorización de documentos y
  la base de datos vectorial para búsqueda semántica avanzada.
* Objetivos:
- ( ) Implementar modelo codificador (sentence-transformers)
- ( ) Crear base de datos vectorial (Chroma/Pinecone)
- ( ) Desarrollar sistema de embeddings de documentos
- ( ) Implementar búsqueda semántica por similitud

* Miércoles 11 de Junio, 2025
* Semana #7
* Horas: 4
* Milestone: Proyecto Final
* Objetivo General:
  Integración del sistema RAG con comandos existentes.
  Este día se enfoca en integrar el sistema RAG con los comandos
  /tg-question y /tg-summary, mejorando significativamente la calidad
  de las respuestas mediante recuperación contextual inteligente.
* Objetivos:
- ( ) Integrar RAG con comando /tg-question
- ( ) Integrar RAG con comando /tg-summary
- ( ) Implementar ranking de relevancia contextual
- ( ) Crear sistema de contexto dinámico expandido

* Lunes 15 de Junio, 2025
* Semana #8
* Horas: 4
* Milestone: Proyecto Final
* Objetivo General:
  Testing integral de sistemas avanzados y optimización.
  Este día se dedica a realizar pruebas exhaustivas del OAuth y RAG,
  identificando y corrigiendo problemas de rendimiento y seguridad,
  asegurando la estabilidad de las nuevas funcionalidades.
* Objetivos:
- ( ) Testing del sistema OAuth completo
- ( ) Testing del sistema RAG y precisión de respuestas
- ( ) Optimización de rendimiento vectorial
- ( ) Pruebas de seguridad y permisos

* Martes 16 de Junio, 2025
* Semana #8
* Horas: 4
* Milestone: Proyecto Final
* Objetivo General:
  Documentación avanzada y entrega final del proyecto.
  Este día se centra en documentar las nuevas funcionalidades avanzadas,
  crear guías de implementación empresarial y realizar la entrega final
  con un sistema de nivel empresarial completo.
* Objetivos:
- ( ) Documentar sistema OAuth y guías de configuración
- ( ) Documentar arquitectura RAG y modelos utilizados
- ( ) Crear guía de deployment empresarial
- ( ) Entrega final con demo de funcionalidades avanzadas

### Tabla Resumen del Proyecto

| Milestone 			| Fecha 			| Etapa 				| Prioridad | Objetivos |
|-----------------------|-------------------|-----------------------|-----------|-----------|
| Código Funcional 		| 21-23 Abril, 2025 	| 1 - Setup Inicial 	| Alta 		| • Crear repositorio y estructura base<br>• Configurar entorno desarrollo<br>• Implementar conexiones básicas |
| Código Funcional 		| 28-30 Abril, 2025 | 1 - Setup Inicial 	| Alta 		| • Implementar modelos y adaptadores<br>• Configurar autenticación y caché<br>• Pruebas de integración base |
| Código Funcional 		| 5-7 Mayo, 2025 		| 2 - Desarrollo Core 	| Alta 		| • Implementar comandos principales (/tg-search, /tg-question, /tg-summary)<br>• Crear sistemas de búsqueda y procesamiento<br>• Integrar LLM y Confluence |
| Testing y Documentación | 12-14 Mayo, 2025 	| 2 - Desarrollo Core 	| Alta 		| • Implementar tests unitarios<br>• Documentar APIs y flujos<br>• Finalizar documentación técnica |
| 🛫 VIAJE 				| 15-18 Mayo, 2025	| - 					| - 		| Viaje a Medellín 		|
| Código Funcional 		| 19-21 Mayo, 2025 	| 3 - Integraciones 	| Alta 		| • Integrar Confluence<br>• Implementar resúmenes avanzados<br>• Sistema de feedback |
| Código Funcional 		| 26-28 Mayo, 2025 	| 3 - Integraciones 	| Media 	| • Implementar métricas<br>• Optimizar rendimiento<br>• Preparar para ausencia |
| 🛫 VIAJE 				| 1-7 Junio, 2025 	| - 					| - 		| Viaje a USA 			|
| Proyecto Final 		| 9-11 Junio, 2025 	| 4 - Funcionalidades Avanzadas | Alta 		| • Implementar OAuth 2.0 para autenticación individual<br>• Desarrollar sistema RAG (Retrieval-Augmented Generation)<br>• Integrar RAG con comandos existentes |
| Proyecto Final 		| 15-16 Junio, 2025 	| 4 - Funcionalidades Avanzadas | Alta 		| • Testing integral de OAuth y RAG<br>• Documentación empresarial avanzada<br>• Entrega final con funcionalidades enterprise |

### Fechas Clave

🎯 **Entregas Principales:**
- Documentación Técnica: 14 de Mayo, 2025
- Código Funcional: 30 de Mayo, 2025
- Proyecto Final: 16 de Junio, 2025

✈️ **Períodos de Ausencia:**
- Medellín: 15-18 Mayo, 2025
- USA: 1-7 Junio, 2025

⚠️ **Períodos de Buffer:**
- Pre-documentación: 13-14 Mayo (25% del tiempo)
- Pre-código funcional: 26-28 Mayo (25% del tiempo)
- Pre-entrega final: 15-16 Junio (25% del tiempo) 