import { Message } from '../models/Message';
import { BotResponse } from '../models/BotResponse';

export interface AIAdapter {
  processMessage(message: Message): Promise<BotResponse>;
  clearContext(): Promise<void>;
  
  /**
   * Genera embeddings para un texto dado
   * @param text Texto para generar embeddings
   * @returns Array de números representando el embedding
   */
  generateEmbeddings(text: string): Promise<number[]>;
  
  /**
   * Genera embeddings para múltiples textos en batch
   * @param texts Array de textos para generar embeddings
   * @returns Array de arrays de números representando los embeddings
   */
  generateEmbeddingsBatch(texts: string[]): Promise<number[][]>;
} 