// Declaración de tipos para el adaptador wrapper

declare module './wrapper/llama-adapter-wrapper' {
  /**
   * Obtiene la función getLlama de node-llama-cpp
   */
  export function getLlama(): Promise<any>;
  
  /**
   * Obtiene la clase LlamaChatSession de node-llama-cpp
   */
  export function getLlamaChatSession(): Promise<any>;
  
  /**
   * Obtiene una instancia de Llama utilizando el wrapper seguro
   */
  export function getLlamaWrapper(): Promise<any>;
}

export = './wrapper/llama-adapter-wrapper'; 