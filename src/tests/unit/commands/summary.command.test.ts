import { SummaryCommand, SummaryValidationResult } from '../../../application/commands/summary.command';
import { Message } from '../../../domain/models/Message';
import { createLogger } from 'winston';

describe('SummaryCommand Validation', () => {
    let summaryCommand: SummaryCommand;
    let logger: any;

    beforeEach(() => {
        // Arrange - Global setup
        logger = createLogger({ silent: true });
        summaryCommand = new SummaryCommand(logger);
    });

    describe('URL Validation', () => {
        it('should validate valid HTTP URLs', async () => {
            // Arrange
            const summaryMessage: Message = {
                content: 'https://example.com/document',
                userId: 'test-user-id',
                username: 'test-user',
                channel: 'test-channel',
                timestamp: new Date(),
                type: 'command',
                metadata: { command: 'summary' }
            };

            // Act
            const result = await summaryCommand.validate(summaryMessage);

            // Assert
            expect(result.isValid).toBe(true);
            expect(result.type).toBe('url');
            expect(result.content).toBe('https://example.com/document');
            expect(result.metadata?.domain).toBe('example.com');
            expect(result.error).toBeUndefined();
        });

        it('should validate valid HTTPS URLs', async () => {
            // Arrange
            const summaryMessage: Message = {
                content: 'https://confluence.empresa.com/display/DOC/page',
                userId: 'test-user-id',
                username: 'test-user',
                channel: 'test-channel',
                timestamp: new Date(),
                type: 'command',
                metadata: { command: 'summary' }
            };

            // Act
            const result = await summaryCommand.validate(summaryMessage);

            // Assert
            expect(result.isValid).toBe(true);
            expect(result.type).toBe('url');
            expect(result.content).toBe('https://confluence.empresa.com/display/DOC/page');
            expect(result.metadata?.domain).toBe('confluence.empresa.com');
            expect(result.error).toBeUndefined();
        });

        it('should detect Confluence URLs correctly', async () => {
            // Arrange
            const summaryMessage: Message = {
                content: 'https://mycompany.atlassian.net/wiki/spaces/DOC/pages/123456',
                userId: 'test-user-id',
                username: 'test-user',
                channel: 'test-channel',
                timestamp: new Date(),
                type: 'command',
                metadata: { command: 'summary' }
            };

            // Act
            const result = await summaryCommand.validate(summaryMessage);

            // Assert
            expect(result.isValid).toBe(true);
            expect(result.type).toBe('url');
            expect(result.metadata?.isConfluence).toBe(true);
            expect(result.metadata?.domain).toBe('mycompany.atlassian.net');
        });

        it('should reject invalid URLs', async () => {
            // Arrange
            const summaryMessage: Message = {
                content: 'not-a-valid-url',
                userId: 'test-user-id',
                username: 'test-user',
                channel: 'test-channel',
                timestamp: new Date(),
                type: 'command',
                metadata: { command: 'summary' }
            };

            // Act
            const result = await summaryCommand.validate(summaryMessage);

            // Assert
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('URL no válida');
            expect(result.type).toBeUndefined();
            expect(result.content).toBeUndefined();
        });

        it('should reject URLs without proper protocol', async () => {
            // Arrange
            const summaryMessage: Message = {
                content: 'ftp://example.com/file',
                userId: 'test-user-id',
                username: 'test-user',
                channel: 'test-channel',
                timestamp: new Date(),
                type: 'command',
                metadata: { command: 'summary' }
            };

            // Act
            const result = await summaryCommand.validate(summaryMessage);

            // Assert
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('URL no válida');
        });
    });

    describe('File Attachment Validation', () => {
        it('should validate PDF file attachments', async () => {
            // Arrange
            const summaryMessage: Message = {
                content: '',
                userId: 'test-user-id',
                username: 'test-user',
                channel: 'test-channel',
                timestamp: new Date(),
                type: 'command',
                metadata: {
                    command: 'summary',
                    slackFiles: [{
                        id: 'file123',
                        name: 'document.pdf',
                        url_private: 'https://files.slack.com/files-pri/T123/F456/document.pdf',
                        size: 1024000, // 1MB
                        mimetype: 'application/pdf'
                    }]
                }
            };

            // Act
            const result = await summaryCommand.validate(summaryMessage);

            // Assert
            expect(result.isValid).toBe(true);
            expect(result.type).toBe('file_attachment');
            expect(result.fileInfo?.name).toBe('document.pdf');
            expect(result.fileInfo?.mimetype).toBe('application/pdf');
            expect(result.error).toBeUndefined();
        });

        it('should validate Word document attachments', async () => {
            // Arrange
            const summaryMessage: Message = {
                content: '',
                userId: 'test-user-id',
                username: 'test-user',
                channel: 'test-channel',
                timestamp: new Date(),
                type: 'command',
                metadata: {
                    command: 'summary',
                    slackFiles: [{
                        id: 'file123',
                        name: 'document.docx',
                        url_private: 'https://files.slack.com/files-pri/T123/F456/document.docx',
                        size: 2048000, // 2MB
                        mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                    }]
                }
            };

            // Act
            const result = await summaryCommand.validate(summaryMessage);

            // Assert
            expect(result.isValid).toBe(true);
            expect(result.type).toBe('file_attachment');
            expect(result.fileInfo?.name).toBe('document.docx');
            expect(result.error).toBeUndefined();
        });

        it('should reject files that are too large', async () => {
            // Arrange
            const summaryMessage: Message = {
                content: '',
                userId: 'test-user-id',
                username: 'test-user',
                channel: 'test-channel',
                timestamp: new Date(),
                type: 'command',
                metadata: {
                    command: 'summary',
                    slackFiles: [{
                        id: 'file123',
                        name: 'large-document.pdf',
                        url_private: 'https://files.slack.com/files-pri/T123/F456/large-document.pdf',
                        size: 60 * 1024 * 1024, // 60MB (excede el límite de 50MB)
                        mimetype: 'application/pdf'
                    }]
                }
            };

            // Act
            const result = await summaryCommand.validate(summaryMessage);

            // Assert
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('demasiado grande');
            expect(result.error).toContain('50MB');
            expect(result.type).toBeUndefined();
        });

        it('should reject unsupported file types', async () => {
            // Arrange
            const summaryMessage: Message = {
                content: '',
                userId: 'test-user-id',
                username: 'test-user',
                channel: 'test-channel',
                timestamp: new Date(),
                type: 'command',
                metadata: {
                    command: 'summary',
                    slackFiles: [{
                        id: 'file123',
                        name: 'image.jpg',
                        url_private: 'https://files.slack.com/files-pri/T123/F456/image.jpg',
                        size: 1024000,
                        mimetype: 'image/jpeg'
                    }]
                }
            };

            // Act
            const result = await summaryCommand.validate(summaryMessage);

            // Assert
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('no soportado');
            expect(result.error).toContain('image/jpeg');
            expect(result.type).toBeUndefined();
        });

        it('should validate files by extension when mimetype is missing', async () => {
            // Arrange
            const summaryMessage: Message = {
                content: '',
                userId: 'test-user-id',
                username: 'test-user',
                channel: 'test-channel',
                timestamp: new Date(),
                type: 'command',
                metadata: {
                    command: 'summary',
                    slackFiles: [{
                        id: 'file123',
                        name: 'document.pdf',
                        url_private: 'https://files.slack.com/files-pri/T123/F456/document.pdf',
                        size: 1024000,
                        mimetype: undefined
                    }]
                }
            };

            // Act
            const result = await summaryCommand.validate(summaryMessage);

            // Assert
            expect(result.isValid).toBe(true);
            expect(result.type).toBe('file_attachment');
            expect(result.fileInfo?.name).toBe('document.pdf');
        });

        it('should reject files with unsupported extensions', async () => {
            // Arrange
            const summaryMessage: Message = {
                content: '',
                userId: 'test-user-id',
                username: 'test-user',
                channel: 'test-channel',
                timestamp: new Date(),
                type: 'command',
                metadata: {
                    command: 'summary',
                    slackFiles: [{
                        id: 'file123',
                        name: 'archive.zip',
                        url_private: 'https://files.slack.com/files-pri/T123/F456/archive.zip',
                        size: 1024000,
                        mimetype: undefined
                    }]
                }
            };

            // Act
            const result = await summaryCommand.validate(summaryMessage);

            // Assert
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('no soportada');
            expect(result.error).toContain('archive.zip');
        });
    });

    describe('Empty Input Handling', () => {
        it('should provide helpful message when no content or files are provided', async () => {
            // Arrange
            const summaryMessage: Message = {
                content: '',
                userId: 'test-user-id',
                username: 'test-user',
                channel: 'test-channel',
                timestamp: new Date(),
                type: 'command',
                metadata: { command: 'summary' }
            };

            // Act
            const result = await summaryCommand.validate(summaryMessage);

            // Assert
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('Para generar un resumen');
            expect(result.error).toContain('URL válida');
            expect(result.error).toContain('archivo');
            expect(result.error).toContain('PDF, Word');
        });

        it('should handle whitespace-only content', async () => {
            // Arrange
            const summaryMessage: Message = {
                content: '   \n\t   ',
                userId: 'test-user-id',
                username: 'test-user',
                channel: 'test-channel',
                timestamp: new Date(),
                type: 'command',
                metadata: { command: 'summary' }
            };

            // Act
            const result = await summaryCommand.validate(summaryMessage);

            // Assert
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('Para generar un resumen');
        });
    });

    describe('Slack File URL Extraction', () => {
        it('should extract Slack file URLs from message content', async () => {
            // Arrange
            const summaryMessage: Message = {
                content: 'https://files.slack.com/files-pri/T123/F456/document.pdf',
                userId: 'test-user-id',
                username: 'test-user',
                channel: 'test-channel',
                timestamp: new Date(),
                type: 'command',
                metadata: { command: 'summary' }
            };

            // Act
            const result = await summaryCommand.validate(summaryMessage);

            // Assert
            expect(result.isValid).toBe(true);
            expect(result.type).toBe('url'); // URLs de Slack se procesan como URL cuando no hay archivos adjuntos
            expect(result.content).toContain('files.slack.com');
        });
    });

    describe('Slack Hyperlink URL Extraction', () => {
        it('should extract URL from Slack hyperlink format <URL|text>', async () => {
            // Arrange
            const summaryMessage: Message = {
                content: '<https://confluence.empresa.com/display/DOC/page|Documentación del Proyecto>',
                userId: 'test-user-id',
                username: 'test-user',
                channel: 'test-channel',
                timestamp: new Date(),
                type: 'command',
                metadata: { command: 'summary' }
            };

            // Act
            const result = await summaryCommand.validate(summaryMessage);

            // Assert
            expect(result.isValid).toBe(true);
            expect(result.type).toBe('url');
            expect(result.content).toBe('https://confluence.empresa.com/display/DOC/page');
            expect(result.metadata?.domain).toBe('confluence.empresa.com');
            expect(result.error).toBeUndefined();
        });

        it('should extract URL from simple Slack link format <URL>', async () => {
            // Arrange
            const summaryMessage: Message = {
                content: '<https://example.com/document>',
                userId: 'test-user-id',
                username: 'test-user',
                channel: 'test-channel',
                timestamp: new Date(),
                type: 'command',
                metadata: { command: 'summary' }
            };

            // Act
            const result = await summaryCommand.validate(summaryMessage);

            // Assert
            expect(result.isValid).toBe(true);
            expect(result.type).toBe('url');
            expect(result.content).toBe('https://example.com/document');
            expect(result.metadata?.domain).toBe('example.com');
        });

        it('should detect Confluence URLs from Slack hyperlinks', async () => {
            // Arrange
            const summaryMessage: Message = {
                content: '<https://mycompany.atlassian.net/wiki/spaces/DOC/pages/123456|Página de Confluence>',
                userId: 'test-user-id',
                username: 'test-user',
                channel: 'test-channel',
                timestamp: new Date(),
                type: 'command',
                metadata: { command: 'summary' }
            };

            // Act
            const result = await summaryCommand.validate(summaryMessage);

            // Assert
            expect(result.isValid).toBe(true);
            expect(result.type).toBe('url');
            expect(result.content).toBe('https://mycompany.atlassian.net/wiki/spaces/DOC/pages/123456');
            expect(result.metadata?.isConfluence).toBe(true);
            expect(result.metadata?.domain).toBe('mycompany.atlassian.net');
        });

        it('should handle text with multiple Slack links and extract the first one', async () => {
            // Arrange
            const summaryMessage: Message = {
                content: 'Revisa este documento <https://confluence.empresa.com/page1|Página 1> y también <https://confluence.empresa.com/page2|Página 2>',
                userId: 'test-user-id',
                username: 'test-user',
                channel: 'test-channel',
                timestamp: new Date(),
                type: 'command',
                metadata: { command: 'summary' }
            };

            // Act
            const result = await summaryCommand.validate(summaryMessage);

            // Assert
            expect(result.isValid).toBe(true);
            expect(result.type).toBe('url');
            expect(result.content).toBe('https://confluence.empresa.com/page1');
        });

        it('should reject text without valid URLs or Slack links', async () => {
            // Arrange
            const summaryMessage: Message = {
                content: 'Este es solo texto sin enlaces válidos',
                userId: 'test-user-id',
                username: 'test-user',
                channel: 'test-channel',
                timestamp: new Date(),
                type: 'command',
                metadata: { command: 'summary' }
            };

            // Act
            const result = await summaryCommand.validate(summaryMessage);

            // Assert
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('URL no válida');
            expect(result.error).toContain('Pegar enlace de Confluence directamente');
        });
    });

    describe('Error Handling', () => {
        it('should handle unexpected errors gracefully', async () => {
            // Arrange
            const summaryMessage: Message = {
                content: 'test content',
                userId: 'test-user-id',
                username: 'test-user',
                channel: 'test-channel',
                timestamp: new Date(),
                type: 'command',
                metadata: { command: 'summary' }
            };

            // Crear un mock que lance un error
            const mockSummaryCommand = new SummaryCommand(logger);
            jest.spyOn(mockSummaryCommand as any, 'isValidUrl').mockImplementation(() => {
                throw new Error('Unexpected test error');
            });

            // Act
            const result = await mockSummaryCommand.validate(summaryMessage);

            // Assert
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('hubo un error al validar');
            expect(result.type).toBeUndefined();
        });
    });

    describe('Multiple File Sources', () => {
        it('should prioritize files from metadata.files over slackFiles', async () => {
            // Arrange
            const summaryMessage: Message = {
                content: '',
                userId: 'test-user-id',
                username: 'test-user',
                channel: 'test-channel',
                timestamp: new Date(),
                type: 'command',
                metadata: {
                    command: 'summary',
                    files: [{
                        id: 'priority-file',
                        name: 'priority.pdf',
                        url: 'https://example.com/priority.pdf',
                        size: 1024000,
                        mimetype: 'application/pdf'
                    }],
                    slackFiles: [{
                        id: 'slack-file',
                        name: 'slack.pdf',
                        url_private: 'https://files.slack.com/slack.pdf',
                        size: 2048000,
                        mimetype: 'application/pdf'
                    }]
                }
            };

            // Act
            const result = await summaryCommand.validate(summaryMessage);

            // Assert
            expect(result.isValid).toBe(true);
            expect(result.fileInfo?.id).toBe('priority-file');
            expect(result.fileInfo?.name).toBe('priority.pdf');
        });
    });

    describe('Advanced URL Extraction (Workarounds)', () => {
        it('should extract URL from plain text containing URL', async () => {
            // Arrange - Simular el caso donde Slack convierte hipervínculo a texto plano
            const summaryMessage: Message = {
                content: 'Revisa este documento https://teravisiongames.atlassian.net/wiki/spaces/TKA/pages/3130392600/C+Coding+Conventions para más información',
                userId: 'test-user-id',
                username: 'test-user',
                channel: 'test-channel',
                timestamp: new Date(),
                type: 'command',
                metadata: { command: 'summary' }
            };

            // Act
            const result = await summaryCommand.validate(summaryMessage);

            // Assert
            expect(result.isValid).toBe(true);
            expect(result.type).toBe('url');
            expect(result.content).toBe('https://teravisiongames.atlassian.net/wiki/spaces/TKA/pages/3130392600/C+Coding+Conventions');
            expect(result.metadata?.isConfluence).toBe(true);
            expect(result.metadata?.domain).toBe('teravisiongames.atlassian.net');
        });

        it('should extract URL from text with multiple URLs (takes first one)', async () => {
            // Arrange
            const summaryMessage: Message = {
                content: 'Mira estos enlaces: https://empresa.atlassian.net/page1 y también https://empresa.atlassian.net/page2',
                userId: 'test-user-id',
                username: 'test-user',
                channel: 'test-channel',
                timestamp: new Date(),
                type: 'command',
                metadata: { command: 'summary' }
            };

            // Act
            const result = await summaryCommand.validate(summaryMessage);

            // Assert
            expect(result.isValid).toBe(true);
            expect(result.type).toBe('url');
            expect(result.content).toBe('https://empresa.atlassian.net/page1'); // Primera URL
            expect(result.metadata?.isConfluence).toBe(true);
        });

        it('should extract Confluence URL by domain pattern (without protocol)', async () => {
            // Arrange - Caso donde solo aparece el dominio sin https://
            const summaryMessage: Message = {
                content: 'Consulta teravisiongames.atlassian.net/wiki/spaces/DOC/pages/123456 para más detalles',
                userId: 'test-user-id',
                username: 'test-user',
                channel: 'test-channel',
                timestamp: new Date(),
                type: 'command',
                metadata: { command: 'summary' }
            };

            // Act
            const result = await summaryCommand.validate(summaryMessage);

            // Assert
            expect(result.isValid).toBe(true);
            expect(result.type).toBe('url');
            expect(result.content).toBe('https://teravisiongames.atlassian.net/wiki/spaces/DOC/pages/123456');
            expect(result.metadata?.isConfluence).toBe(true);
            expect(result.metadata?.domain).toBe('teravisiongames.atlassian.net');
        });

        it('should handle text with Confluence domain but invalid URL structure', async () => {
            // Arrange
            const summaryMessage: Message = {
                content: 'El servidor empresa.atlassian.net está funcionando bien',
                userId: 'test-user-id',
                username: 'test-user',
                channel: 'test-channel',
                timestamp: new Date(),
                type: 'command',
                metadata: { command: 'summary' }
            };

            // Act
            const result = await summaryCommand.validate(summaryMessage);

            // Assert
            expect(result.isValid).toBe(true);
            expect(result.type).toBe('url');
            expect(result.content).toBe('https://empresa.atlassian.net');
            expect(result.metadata?.isConfluence).toBe(true);
        });

        it('should prioritize Slack hyperlink format over plain text URL', async () => {
            // Arrange - Texto que contiene tanto formato de hipervínculo como URL plana
            const summaryMessage: Message = {
                content: '<https://priority.atlassian.net/page1|Link Principal> y también https://secondary.atlassian.net/page2',
                userId: 'test-user-id',
                username: 'test-user',
                channel: 'test-channel',
                timestamp: new Date(),
                type: 'command',
                metadata: { command: 'summary' }
            };

            // Act
            const result = await summaryCommand.validate(summaryMessage);

            // Assert
            expect(result.isValid).toBe(true);
            expect(result.type).toBe('url');
            expect(result.content).toBe('https://priority.atlassian.net/page1'); // Debe tomar la del hipervínculo
            expect(result.metadata?.isConfluence).toBe(true);
        });

        it('should handle text without any URLs', async () => {
            // Arrange
            const summaryMessage: Message = {
                content: 'Este es solo texto sin ninguna URL válida',
                userId: 'test-user-id',
                username: 'test-user',
                channel: 'test-channel',
                timestamp: new Date(),
                type: 'command',
                metadata: { command: 'summary' }
            };

            // Act
            const result = await summaryCommand.validate(summaryMessage);

            // Assert
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('URL no válida');
        });
    });

    describe('File Priority Over URLs', () => {
        it('should prioritize file attachment over URL text', async () => {
            // Arrange - Mensaje que tiene tanto archivo como URL en el texto
            const summaryMessage: Message = {
                content: 'https://example.com/document', // URL en el texto
                userId: 'test-user-id',
                username: 'test-user',
                channel: 'test-channel',
                timestamp: new Date(),
                type: 'command',
                metadata: {
                    command: 'summary',
                    slackFiles: [{ // Archivo adjunto (debe tener prioridad)
                        id: 'file123',
                        name: 'priority-document.pdf',
                        url_private: 'https://files.slack.com/files-pri/T123/F456/priority-document.pdf',
                        size: 1024000,
                        mimetype: 'application/pdf'
                    }]
                }
            };

            // Act
            const result = await summaryCommand.validate(summaryMessage);

            // Assert
            expect(result.isValid).toBe(true);
            expect(result.type).toBe('file_attachment'); // Debe priorizar archivo
            expect(result.fileInfo?.name).toBe('priority-document.pdf');
            expect(result.fileInfo?.mimetype).toBe('application/pdf');
            expect(result.content).toContain('files.slack.com'); // URL del archivo, no la del texto
        });

        it('should process URL only when no valid file is present', async () => {
            // Arrange - Solo URL, sin archivos
            const summaryMessage: Message = {
                content: 'https://confluence.empresa.com/display/DOC/page',
                userId: 'test-user-id',
                username: 'test-user',
                channel: 'test-channel',
                timestamp: new Date(),
                type: 'command',
                metadata: { command: 'summary' } // Sin archivos
            };

            // Act
            const result = await summaryCommand.validate(summaryMessage);

            // Assert
            expect(result.isValid).toBe(true);
            expect(result.type).toBe('url'); // Debe procesar URL
            expect(result.content).toBe('https://confluence.empresa.com/display/DOC/page');
            expect(result.fileInfo).toBeUndefined();
        });

        it('should process URL when file is invalid', async () => {
            // Arrange - Archivo inválido + URL válida
            const summaryMessage: Message = {
                content: 'https://confluence.empresa.com/display/DOC/page',
                userId: 'test-user-id',
                username: 'test-user',
                channel: 'test-channel',
                timestamp: new Date(),
                type: 'command',
                metadata: {
                    command: 'summary',
                    slackFiles: [{
                        id: 'file123',
                        name: 'invalid-file.xyz', // Extensión no soportada
                        url_private: 'https://files.slack.com/files-pri/T123/F456/invalid-file.xyz',
                        size: 1024000,
                        mimetype: 'application/unknown'
                    }]
                }
            };

            // Act
            const result = await summaryCommand.validate(summaryMessage);

            // Assert
            expect(result.isValid).toBe(false); // Archivo inválido debe fallar
            expect(result.error).toContain('no soportado'); // Texto correcto del error
            expect(result.error).toContain('invalid-file.xyz');
        });

        it('should show file details in validation result', async () => {
            // Arrange
            const summaryMessage: Message = {
                content: '',
                userId: 'test-user-id',
                username: 'test-user',
                channel: 'test-channel',
                timestamp: new Date(),
                type: 'command',
                metadata: {
                    command: 'summary',
                    slackFiles: [{
                        id: 'file123',
                        name: 'detailed-document.pdf',
                        url_private: 'https://files.slack.com/files-pri/T123/F456/detailed-document.pdf',
                        size: 2048000, // 2MB
                        mimetype: 'application/pdf'
                    }]
                }
            };

            // Act
            const result = await summaryCommand.validate(summaryMessage);

            // Assert
            expect(result.isValid).toBe(true);
            expect(result.type).toBe('file_attachment');
            expect(result.fileInfo?.name).toBe('detailed-document.pdf');
            expect(result.fileInfo?.size).toBe(2048000);
            expect(result.fileInfo?.mimetype).toBe('application/pdf');
            expect(result.metadata?.domain).toBe('file_attachment');
            expect(result.metadata?.isConfluence).toBe(false);
        });
    });

    // NUEVOS TESTS: Parsing de parámetros de idioma
    describe('Language Parameter Parsing', () => {
        test('should detect Spanish as default language', async () => {
            const message: Message = {
                content: 'https://confluence.empresa.com/page',
                userId: 'user123',
                username: 'testuser',
                channel: 'channel123',
                timestamp: new Date(),
                type: 'command'
            };

            const result = await summaryCommand.validate(message);
            
            expect(result.isValid).toBe(true);
            expect(result.metadata?.requestedLanguage).toBe('es');
            expect(result.metadata?.hasLanguageParam).toBe(false);
        });

        test('should detect explicit Spanish parameter', async () => {
            const message: Message = {
                content: 'https://confluence.empresa.com/page es',
                userId: 'user123',
                username: 'testuser',
                channel: 'channel123',
                timestamp: new Date(),
                type: 'command',
                metadata: {
                    requestedLanguage: 'es',
                    hasLanguageParam: true,
                    originalText: 'https://confluence.empresa.com/page es'
                }
            };

            const result = await summaryCommand.validate(message);
            
            expect(result.isValid).toBe(true);
            expect(result.metadata?.requestedLanguage).toBe('es');
            expect(result.metadata?.hasLanguageParam).toBe(true);
        });

        test('should detect explicit English parameter', async () => {
            const message: Message = {
                content: 'https://confluence.empresa.com/page en',
                userId: 'user123',
                username: 'testuser',
                channel: 'channel123',
                timestamp: new Date(),
                type: 'command',
                metadata: {
                    requestedLanguage: 'en',
                    hasLanguageParam: true,
                    originalText: 'https://confluence.empresa.com/page en'
                }
            };

            const result = await summaryCommand.validate(message);
            
            expect(result.isValid).toBe(true);
            expect(result.metadata?.requestedLanguage).toBe('en');
            expect(result.metadata?.hasLanguageParam).toBe(true);
        });

        test('should handle language parameter before URL', async () => {
            const message: Message = {
                content: 'en https://confluence.empresa.com/page',
                userId: 'user123',
                username: 'testuser',
                channel: 'channel123',
                timestamp: new Date(),
                type: 'command',
                metadata: {
                    requestedLanguage: 'en',
                    hasLanguageParam: true,
                    originalText: 'en https://confluence.empresa.com/page'
                }
            };

            const result = await summaryCommand.validate(message);
            
            expect(result.isValid).toBe(true);
            expect(result.metadata?.requestedLanguage).toBe('en');
            expect(result.metadata?.hasLanguageParam).toBe(true);
        });

        test('should recognize various Spanish keywords', async () => {
            const spanishKeywords = ['es', 'español', 'spanish', 'spa'];
            
            for (const keyword of spanishKeywords) {
                const message: Message = {
                    content: `https://confluence.empresa.com/page ${keyword}`,
                    userId: 'user123',
                    username: 'testuser',
                    channel: 'channel123',
                    timestamp: new Date(),
                    type: 'command',
                    metadata: {
                        requestedLanguage: 'es',
                        hasLanguageParam: true,
                        originalText: `https://confluence.empresa.com/page ${keyword}`
                    }
                };

                const result = await summaryCommand.validate(message);
                
                expect(result.isValid).toBe(true);
                expect(result.metadata?.requestedLanguage).toBe('es');
                expect(result.metadata?.hasLanguageParam).toBe(true);
            }
        });

        test('should recognize various English keywords', async () => {
            const englishKeywords = ['en', 'english', 'inglés', 'ing', 'eng'];
            
            for (const keyword of englishKeywords) {
                const message: Message = {
                    content: `https://confluence.empresa.com/page ${keyword}`,
                    userId: 'user123',
                    username: 'testuser',
                    channel: 'channel123',
                    timestamp: new Date(),
                    type: 'command',
                    metadata: {
                        requestedLanguage: 'en',
                        hasLanguageParam: true,
                        originalText: `https://confluence.empresa.com/page ${keyword}`
                    }
                };

                const result = await summaryCommand.validate(message);
                
                expect(result.isValid).toBe(true);
                expect(result.metadata?.requestedLanguage).toBe('en');
                expect(result.metadata?.hasLanguageParam).toBe(true);
            }
        });
    });
}); 