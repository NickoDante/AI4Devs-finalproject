# TG-TheGuardian - Prompts de Funcionalidades Principales

Este directorio contiene todos los prompts utilizados durante el desarrollo de las tres funcionalidades principales del chatbot TG-TheGuardian para Teravision Games.

## 📋 Menú de Funcionalidades

### 🔍 [TG-SEARCH: Búsqueda de Documentos](./tg-search_prompts.md)
**Comando:** `/tg-search [palabras clave] -- [espacio]`

Funcionalidad que permite buscar documentación en Confluence usando palabras clave. Los usuarios pueden buscar en espacios específicos o usar el espacio por defecto (TKA).

**Características principales:**
- Búsqueda por palabras clave en documentos de Confluence
- Soporte para espacios específicos (TKA, NVP, etc.)
- Formato: `palabras clave -- espacio` (espacio opcional)
- Resultados con enlaces directos y previsualizaciones

---

### ❓ [TG-QUESTION: Preguntas Inteligentes](./tg-question_prompts.md)
**Comando:** `/tg-question [pregunta en lenguaje natural]`

Funcionalidad que permite realizar consultas en lenguaje natural al chatbot, con soporte bilingüe y contexto conversacional.

**Características principales:**
- Procesamiento de lenguaje natural con modelo Llama local
- Detección automática de idioma (español/inglés)
- Mantenimiento de contexto conversacional
- Respuestas basadas en documentación de Confluence

---

### 📄 [TG-SUMMARY: Resúmenes de Documentos](./tg-summary_prompts.md)
**Comandos:** `/tg-summary [URL]` y `@TG-TheGuardian resumen/summary`

Funcionalidad dual que permite resumir tanto URLs de Confluence como archivos adjuntos (PDFs, Word, TXT).

**Características principales:**
- Sistema dual: comandos slash para URLs, menciones para archivos
- Soporte para múltiples formatos (PDF, Word, TXT, HTML)
- Resúmenes en español e inglés
- Integración con API de Confluence para contenido privado

---
