import { PDFPort, PDFContent, PDFMetadata, PDFProcessingOptions, PDFProcessingResult } from '../../domain/ports/PDFPort';
import { Logger } from 'winston';
import * as https from 'https';
import * as http from 'http';

const pdfParse = require('pdf-parse');

export class PDFAdapter implements PDFPort {
  private readonly DEFAULT_TIMEOUT = 30000; // 30 segundos
  private readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  private readonly DEFAULT_MAX_PAGES = 100;

  constructor(private readonly logger: Logger) {}

  async extractFromBuffer(buffer: Buffer, options?: PDFProcessingOptions): Promise<PDFProcessingResult> {
    const startTime = Date.now();
    
    try {
      this.logger.info('Iniciando extracción de PDF desde buffer', {
        bufferSize: buffer.length,
        options
      });

      // Validar tamaño del archivo
      if (buffer.length > this.MAX_FILE_SIZE) {
        return {
          success: false,
          error: `El archivo PDF es demasiado grande. Tamaño máximo permitido: ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`,
          processingTime: Date.now() - startTime
        };
      }

      // Validar que sea un PDF
      const isValidPDF = await this.validatePDF(buffer);
      if (!isValidPDF) {
        return {
          success: false,
          error: 'El archivo no es un PDF válido',
          processingTime: Date.now() - startTime
        };
      }

      // Configurar opciones de procesamiento
      const processingOptions = {
        max: options?.maxPages || this.DEFAULT_MAX_PAGES
      };

      // Extraer contenido del PDF
      const pdfData = await pdfParse(buffer, processingOptions);

      // Procesar metadatos
      const metadata: PDFMetadata = {
        title: pdfData.info?.Title || undefined,
        author: pdfData.info?.Author || undefined,
        subject: pdfData.info?.Subject || undefined,
        creator: pdfData.info?.Creator || undefined,
        producer: pdfData.info?.Producer || undefined,
        creationDate: pdfData.info?.CreationDate ? new Date(pdfData.info.CreationDate) : undefined,
        modificationDate: pdfData.info?.ModDate ? new Date(pdfData.info.ModDate) : undefined,
        pages: pdfData.numpages,
        fileSize: buffer.length
      };

      // Procesar contenido por páginas (simulado, pdf-parse no separa por páginas por defecto)
      const pages = this.splitTextIntoPages(pdfData.text, pdfData.numpages);

      const content: PDFContent = {
        text: pdfData.text,
        metadata,
        pages
      };

      const processingTime = Date.now() - startTime;

      this.logger.info('Extracción de PDF completada exitosamente', {
        pages: pdfData.numpages,
        textLength: pdfData.text.length,
        processingTime
      });

      return {
        success: true,
        content,
        processingTime
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.logger.error('Error extrayendo contenido del PDF:', error);
      
      return {
        success: false,
        error: `Error procesando PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        processingTime
      };
    }
  }

  async extractFromUrl(url: string, options?: PDFProcessingOptions): Promise<PDFProcessingResult> {
    const startTime = Date.now();
    
    try {
      this.logger.info('Descargando PDF desde URL:', { url });

      // Descargar el PDF desde la URL
      const buffer = await this.downloadPDFFromUrl(url, options?.timeout || this.DEFAULT_TIMEOUT);
      
      // Usar el método de extracción desde buffer
      const result = await this.extractFromBuffer(buffer, options);
      
      // Agregar información de la URL a los metadatos
      if (result.success && result.content) {
        result.content.metadata.fileName = this.extractFileNameFromUrl(url);
      }

      return result;

    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.logger.error('Error descargando PDF desde URL:', error);
      
      return {
        success: false,
        error: `Error descargando PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        processingTime
      };
    }
  }

  async validatePDF(buffer: Buffer): Promise<boolean> {
    try {
      // Verificar que el buffer tenga el header de PDF
      const pdfHeader = buffer.slice(0, 4).toString();
      if (pdfHeader !== '%PDF') {
        return false;
      }

      // Intentar parsear el PDF básicamente
      await pdfParse(buffer, { max: 1 }); // Solo procesar la primera página para validación
      return true;

    } catch (error) {
      this.logger.warn('PDF validation failed:', error);
      return false;
    }
  }

  async getMetadata(buffer: Buffer): Promise<PDFMetadata> {
    try {
      const pdfData = await pdfParse(buffer, { max: 1 }); // Solo primera página para metadatos

      return {
        title: pdfData.info?.Title || undefined,
        author: pdfData.info?.Author || undefined,
        subject: pdfData.info?.Subject || undefined,
        creator: pdfData.info?.Creator || undefined,
        producer: pdfData.info?.Producer || undefined,
        creationDate: pdfData.info?.CreationDate ? new Date(pdfData.info.CreationDate) : undefined,
        modificationDate: pdfData.info?.ModDate ? new Date(pdfData.info.ModDate) : undefined,
        pages: pdfData.numpages,
        fileSize: buffer.length
      };

    } catch (error) {
      this.logger.error('Error obteniendo metadatos del PDF:', error);
      return {
        fileSize: buffer.length
      };
    }
  }

  private async downloadPDFFromUrl(url: string, timeout: number): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https:') ? https : http;
      
      const request = client.get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
          return;
        }

        const chunks: Buffer[] = [];
        let totalSize = 0;

        response.on('data', (chunk: Buffer) => {
          totalSize += chunk.length;
          
          // Verificar tamaño máximo durante la descarga
          if (totalSize > this.MAX_FILE_SIZE) {
            request.destroy();
            reject(new Error(`El archivo es demasiado grande. Tamaño máximo: ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`));
            return;
          }
          
          chunks.push(chunk);
        });

        response.on('end', () => {
          resolve(Buffer.concat(chunks));
        });

        response.on('error', (error) => {
          reject(error);
        });
      });

      request.setTimeout(timeout, () => {
        request.destroy();
        reject(new Error(`Timeout descargando PDF después de ${timeout}ms`));
      });

      request.on('error', (error) => {
        reject(error);
      });
    });
  }

  private extractFileNameFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const fileName = pathname.split('/').pop() || 'documento.pdf';
      
      // Asegurar que tenga extensión .pdf
      return fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
    } catch {
      return 'documento.pdf';
    }
  }

  private splitTextIntoPages(text: string, numPages: number): Array<{ pageNumber: number; text: string }> {
    // Esta es una implementación simplificada
    // pdf-parse no proporciona separación por páginas por defecto
    const textLength = text.length;
    const avgCharsPerPage = Math.ceil(textLength / numPages);
    
    const pages: Array<{ pageNumber: number; text: string }> = [];
    
    for (let i = 0; i < numPages; i++) {
      const start = i * avgCharsPerPage;
      const end = Math.min((i + 1) * avgCharsPerPage, textLength);
      const pageText = text.slice(start, end);
      
      pages.push({
        pageNumber: i + 1,
        text: pageText
      });
    }
    
    return pages;
  }
} 