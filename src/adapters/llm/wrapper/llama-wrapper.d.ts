// Declaración de tipos para el wrapper de Llama

export declare class MockLlama {
  loadModel(): Promise<{
    createContext(): Promise<{
      getSequence(): any;
    }>;
  }>;
}

export declare function getLlama(): any;
export declare class LlamaChatSession {
  constructor(options: { contextSequence: any });
  prompt(message: string, options?: { systemPrompt?: string }): Promise<string>;
}
export declare function getLlamaWrapper(): Promise<any>; 