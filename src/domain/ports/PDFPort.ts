export interface PDFMetadata {
  title?: string;
  author?: string;
  subject?: string;
  creator?: string;
  producer?: string;
  creationDate?: Date;
  modificationDate?: Date;
  pages?: number;
  fileSize?: number;
  fileName?: string;
}

export interface PDFContent {
  text: string;
  metadata: PDFMetadata;
  pages: Array<{
    pageNumber: number;
    text: string;
  }>;
}

export interface PDFProcessingOptions {
  maxPages?: number;
  extractImages?: boolean;
  preserveFormatting?: boolean;
  timeout?: number; // en milisegundos
}

export interface PDFProcessingResult {
  success: boolean;
  content?: PDFContent;
  error?: string;
  processingTime?: number;
}

export interface PDFPort {
  /**
   * Extrae texto y metadatos de un archivo PDF desde un buffer
   * @param buffer Buffer del archivo PDF
   * @param options Opciones de procesamiento
   * @returns Resultado del procesamiento con contenido extraído
   */
  extractFromBuffer(buffer: Buffer, options?: PDFProcessingOptions): Promise<PDFProcessingResult>;

  /**
   * Extrae texto y metadatos de un archivo PDF desde una URL
   * @param url URL del archivo PDF
   * @param options Opciones de procesamiento
   * @returns Resultado del procesamiento con contenido extraído
   */
  extractFromUrl(url: string, options?: PDFProcessingOptions): Promise<PDFProcessingResult>;

  /**
   * Valida si un buffer contiene un PDF válido
   * @param buffer Buffer a validar
   * @returns true si es un PDF válido
   */
  validatePDF(buffer: Buffer): Promise<boolean>;

  /**
   * Obtiene información básica de un PDF sin extraer todo el contenido
   * @param buffer Buffer del archivo PDF
   * @returns Metadatos básicos del PDF
   */
  getMetadata(buffer: Buffer): Promise<PDFMetadata>;
} 