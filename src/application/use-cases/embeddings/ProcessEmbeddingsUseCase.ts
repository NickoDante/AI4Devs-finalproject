import { AIAdapter } from '../../../domain/ports/AIAdapter';
import { CachePort } from '../../../domain/ports/CachePort';
import { Logger } from 'winston';

export interface EmbeddingDocument {
    id: string;
    content: string;
    metadata?: Record<string, any>;
}

export class ProcessEmbeddingsUseCase {
    constructor(
        private aiAdapter: AIAdapter,
        private cacheAdapter: CachePort,
        private logger: Logger
    ) {}

    /**
     * Procesa un documento y genera sus embeddings
     */
    async processDocument(document: EmbeddingDocument): Promise<void> {
        try {
            this.logger.info('🔄 Procesando documento para embeddings', {
                documentId: document.id
            });

            // Generar embeddings para el documento
            const embeddings = await this.aiAdapter.generateEmbeddings(document.content);

            // Almacenar embeddings con metadatos
            await this.cacheAdapter.storeVector(document.id, embeddings, {
                ...document.metadata,
                content: document.content.substring(0, 200) + '...' // Almacenar preview del contenido
            });

            this.logger.info('✅ Documento procesado exitosamente', {
                documentId: document.id,
                embeddingsLength: embeddings.length
            });
        } catch (error) {
            this.logger.error('❌ Error al procesar documento:', error);
            throw error;
        }
    }

    /**
     * Procesa múltiples documentos en batch
     */
    async processBatch(documents: EmbeddingDocument[]): Promise<void> {
        try {
            this.logger.info('🔄 Procesando batch de documentos', {
                count: documents.length
            });

            // Generar embeddings para todos los documentos
            const contents = documents.map(doc => doc.content);
            const embeddings = await this.aiAdapter.generateEmbeddingsBatch(contents);

            // Almacenar todos los embeddings
            await Promise.all(documents.map((doc, index) => 
                this.cacheAdapter.storeVector(doc.id, embeddings[index], {
                    ...doc.metadata,
                    content: doc.content.substring(0, 200) + '...'
                })
            ));

            this.logger.info('✅ Batch procesado exitosamente', {
                documentsProcessed: documents.length
            });
        } catch (error) {
            this.logger.error('❌ Error al procesar batch:', error);
            throw error;
        }
    }

    /**
     * Elimina los embeddings de un documento
     */
    async removeDocument(documentId: string): Promise<void> {
        try {
            await this.cacheAdapter.deleteVector(documentId);
            
            this.logger.info('✅ Embeddings eliminados', {
                documentId
            });
        } catch (error) {
            this.logger.error('❌ Error al eliminar embeddings:', error);
            throw error;
        }
    }

    /**
     * Actualiza los metadatos de un documento
     */
    async updateMetadata(documentId: string, metadata: Record<string, any>): Promise<void> {
        try {
            await this.cacheAdapter.updateVectorMetadata(documentId, metadata);
            
            this.logger.info('✅ Metadatos actualizados', {
                documentId,
                metadata: Object.keys(metadata)
            });
        } catch (error) {
            this.logger.error('❌ Error al actualizar metadatos:', error);
            throw error;
        }
    }
} 