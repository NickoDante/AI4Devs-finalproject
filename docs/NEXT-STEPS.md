# Próximos Pasos para TG: The Guardian

Este documento describe las mejoras planeadas para el proyecto TG: The Guardian, específicamente relacionadas con una mejor integración entre los comandos y las fuentes de conocimiento como Confluence.

## Para el comando /tg-question

Las siguientes mejoras están pendientes de implementación para mejorar la capacidad del bot para responder preguntas utilizando información de Confluence:

### 1. Crear un documento de guía en Confluence

- Crear un documento en Confluence titulado "Guía para The Guardian AI" que contenga:
  - Terminología específica de la empresa
  - Explicaciones de productos y servicios
  - Estructura organizacional
  - Políticas y procedimientos comunes
- Hacer que este documento sea altamente consultable por el bot incluso para preguntas generales.
- Actualizar periódicamente este documento con nueva información relevante.

### 2. Añadir un corpus de ejemplos Q&A

- Crear un documento o sección en Confluence con preguntas y respuestas comunes (FAQ).
- Incluir formatos específicos de respuesta que se desea que Llama reproduzca.
- Organizar por categorías: RR.HH., Tecnología, Proyectos, etc.
- Incluir preguntas frecuentes de nuevos empleados.

### 3. Mejorar el sistema de búsqueda

- Modificar `searchRelevantDocuments` para buscar más allá de coincidencias exactas:
  - Extraer palabras clave de la pregunta
  - Realizar múltiples búsquedas con diferentes combinaciones de palabras clave
  - Implementar búsqueda semántica usando vectores de embeddings

```typescript
private async searchRelevantDocuments(question: string): Promise<SearchResult[]> {
  try {
    // Extraer palabras clave de la pregunta
    const keywords = this.extractKeywords(question);
    
    // Buscar usando las palabras clave originales
    let results = await this.knowledgePort.searchKnowledge(question);
    
    // Si no hay suficientes resultados, prueba con las palabras clave
    if (results.length < this.MAX_RELEVANT_DOCS && keywords.length > 0) {
      const keywordResults = await this.knowledgePort.searchKnowledge(keywords.join(' '));
      
      // Combinar y eliminar duplicados
      const combinedResults = [...results];
      for (const result of keywordResults) {
        if (!combinedResults.some(r => r.documentId === result.documentId)) {
          combinedResults.push(result);
        }
      }
      
      results = combinedResults;
    }
    
    // Ordenar por relevancia y limitar resultados
    return results
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, this.MAX_RELEVANT_DOCS);
  } catch (error) {
    this.logger.error('Error buscando documentos relevantes:', error);
    return [];
  }
}

private extractKeywords(text: string): string[] {
  // Eliminar palabras comunes y caracteres especiales
  const cleaned = text.toLowerCase()
    .replace(/[¿?!¡.,;:()\[\]{}]/g, '')
    .replace(/\s+/g, ' ');
  
  // Lista de palabras comunes a excluir
  const stopwords = ['el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 
    'y', 'o', 'pero', 'porque', 'como', 'que', 'cuando', 'donde', 'quien',
    'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were'];
  
  // Extraer palabras clave
  return cleaned.split(' ')
    .filter(word => word.length > 3 && !stopwords.includes(word))
    .slice(0, 5); // Limitar a las 5 palabras clave más relevantes
}
```

### 4. Implementar retroalimentación del usuario

- Añadir un sistema donde los usuarios puedan valorar las respuestas.
- Después de cada respuesta, incluir opciones para calificar su utilidad:
  ```
  ¿Fue útil esta respuesta?
  👍 Útil  |  👎 No útil
  ```
- Usar esta retroalimentación para:
  - Mejorar los ejemplos en Confluence
  - Ajustar los prompts para el LLM
  - Identificar áreas donde falta documentación

### 5. Enriquecer metadatos de documentos

- Trabajar en mejorar las etiquetas/categorías de los documentos en Confluence.
- Crear un sistema de "tags" estandarizado para:
  - Departamentos
  - Proyectos
  - Categorías de conocimiento
- Implementar un script que sugiera etiquetas para documentos existentes.

### 6. Ajustar la búsqueda por espacio

- Configurar diferentes espacios de Confluence para diferentes tipos de conocimiento.
- Implementar una heurística para determinar en qué espacio buscar según el tipo de pregunta:
  ```typescript
  private determineRelevantSpaces(question: string): string[] {
    const spaces = ['TKA']; // Por defecto, buscar en TKA
    
    // Patrones para determinar espacios adicionales
    if (/proyecto|project|development|desarrollo/i.test(question)) {
      spaces.push('NVP');
    }
    
    if (/HR|RRHH|personal|employee|empleado|vacaciones/i.test(question)) {
      spaces.push('HR');
    }
    
    return spaces;
  }
  ```

### 7. Preprocesamiento de documentos

- Implementar un sistema que periódicamente:
  - Genere resúmenes de documentos largos
  - Extraiga puntos clave de cada documento
  - Cree índices temáticos de los documentos
- Almacenar estos resúmenes como documentos adicionales en Confluence.

### 8. Implementar verificación de respuestas

- Añadir un paso de verificación que compruebe:
  - Si la respuesta del LLM contiene referencias a los documentos proporcionados
  - Si la respuesta aborda directamente la pregunta planteada
  - Si hay inconsistencias con la documentación de Confluence
- Si la verificación falla, regenerar la respuesta con prompts más específicos.

## Priorización sugerida

1. Crear el documento guía en Confluence (Alto impacto, baja complejidad)
2. Añadir el corpus de Q&A (Alto impacto, media complejidad)
3. Implementar retroalimentación del usuario (Alto impacto, media complejidad)
4. Mejorar el sistema de búsqueda (Alto impacto, alta complejidad)
5. Implementar verificación de respuestas (Medio impacto, alta complejidad)
6. Ajustar la búsqueda por espacio (Medio impacto, media complejidad)
7. Enriquecer metadatos de documentos (Bajo impacto, alta complejidad)
8. Preprocesamiento de documentos (Bajo impacto, alta complejidad) 