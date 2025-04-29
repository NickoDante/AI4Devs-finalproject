import { SearchCommand } from '../../../application/commands/search.command';
import { Message } from '../../../domain/models/Message';
import { createLogger } from 'winston';
import { CONFLUENCE_SPACES } from '../../../config/confluence.config';

describe('SearchCommand Validation', () => {
    let searchCommand: SearchCommand;
    let logger: any;

    beforeEach(() => {
        // Arrange - Global setup
        logger = createLogger({ silent: true });
        searchCommand = new SearchCommand(logger);
    });

    describe('Input Validation', () => {
        it.each([
            ['empty string', ''],
            ['whitespace only', '    ']
        ])('should reject invalid input when content is %s', async (testCase: string, inputContent: string) => {
            // Arrange
            const searchMessage: Message = {
                content: inputContent,
                userId: 'test-user-id',
                username: 'test-user',
                channel: 'test-channel',
                timestamp: new Date(),
                type: 'command',
                metadata: { command: 'search' }
            };

            // Act
            const result = await searchCommand.validate(searchMessage);

            // Assert
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('Por favor, proporciona palabras clave para buscar');
            expect(result.keywords).toBeUndefined();
            expect(result.spaceKey).toBeUndefined();
            expect(result.spaceName).toBeUndefined();
        });
    });

    describe('Default Space Handling', () => {
        it('should use TKA as default space when no double dash is used', async () => {
            // Arrange
            const searchMessage: Message = {
                content: 'search keywords example',
                userId: 'test-user-id',
                username: 'test-user',
                channel: 'test-channel',
                timestamp: new Date(),
                type: 'command',
                metadata: { command: 'search' }
            };

            // Act
            const result = await searchCommand.validate(searchMessage);

            // Assert
            expect(result.isValid).toBe(true);
            expect(result.spaceKey).toBe('TKA');
            expect(result.spaceName).toBe('TKA Knowledge Archive');
            expect(result.keywords).toEqual(['search', 'keywords', 'example']);
            expect(result.error).toBeUndefined();
        });

        it('should handle multiple words without double dash correctly', async () => {
            // Arrange
            const searchMessage: Message = {
                content: 'arquitectura microservicios patrones',
                userId: 'test-user-id',
                username: 'test-user',
                channel: 'test-channel',
                timestamp: new Date(),
                type: 'command',
                metadata: { command: 'search' }
            };

            // Act
            const result = await searchCommand.validate(searchMessage);

            // Assert
            expect(result.isValid).toBe(true);
            expect(result.spaceKey).toBe('TKA');
            expect(result.spaceName).toBe('TKA Knowledge Archive');
            expect(result.keywords).toEqual(['arquitectura', 'microservicios', 'patrones']);
            expect(result.error).toBeUndefined();
        });

        it('should handle single word without double dash', async () => {
            // Arrange
            const searchMessage: Message = {
                content: 'onboarding',
                userId: 'test-user-id',
                username: 'test-user',
                channel: 'test-channel',
                timestamp: new Date(),
                type: 'command',
                metadata: { command: 'search' }
            };

            // Act
            const result = await searchCommand.validate(searchMessage);

            // Assert
            expect(result.isValid).toBe(true);
            expect(result.spaceKey).toBe('TKA');
            expect(result.spaceName).toBe('TKA Knowledge Archive');
            expect(result.keywords).toEqual(['onboarding']);
            expect(result.error).toBeUndefined();
        });
    });

    describe('Space Key Validation with Double Dash', () => {
        it.each([
            ['code conventions -- TKA', 'TKA', 'TKA Knowledge Archive', ['code', 'conventions']],
            ['architecture design -- NVP', 'NVP', 'NVP Documentation', ['architecture', 'design']]
        ])('should validate search "%s" correctly', async (searchInput: string, expectedSpaceKey: string, expectedSpaceName: string, expectedKeywords: string[]) => {
            // Arrange
            const searchMessage: Message = {
                content: searchInput,
                userId: 'test-user-id',
                username: 'test-user',
                channel: 'test-channel',
                timestamp: new Date(),
                type: 'command',
                metadata: { command: 'search' }
            };

            // Act
            const result = await searchCommand.validate(searchMessage);

            // Assert
            expect(result.isValid).toBe(true);
            expect(result.spaceKey).toBe(expectedSpaceKey);
            expect(result.spaceName).toBe(expectedSpaceName);
            expect(result.keywords).toEqual(expectedKeywords);
            expect(result.error).toBeUndefined();
        });

        it('should reject invalid space key after double dash', async () => {
            // Arrange
            const searchMessage: Message = {
                content: 'search terms -- INVALID',
                userId: 'test-user-id',
                username: 'test-user',
                channel: 'test-channel',
                timestamp: new Date(),
                type: 'command',
                metadata: { command: 'search' }
            };

            // Act
            const result = await searchCommand.validate(searchMessage);

            // Assert
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('INVALID');
            expect(result.error).toContain('TKA');
            expect(result.error).toContain('NVP');
            expect(result.spaceKey).toBeUndefined();
            expect(result.spaceName).toBeUndefined();
        });

        it('should reject when no keywords before double dash', async () => {
            // Arrange
            const searchMessage: Message = {
                content: ' -- TKA',
                userId: 'test-user-id',
                username: 'test-user',
                channel: 'test-channel',
                timestamp: new Date(),
                type: 'command',
                metadata: { command: 'search' }
            };

            // Act
            const result = await searchCommand.validate(searchMessage);

            // Assert
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('No se pudieron extraer palabras clave válidas');
            expect(result.keywords).toBeUndefined();
            expect(result.spaceKey).toBeUndefined();
        });
    });

    describe('Error Handling', () => {
        it('should handle unexpected errors gracefully', async () => {
            // Arrange
            const searchMessage: Message = {
                content: 'test content',
                userId: 'test-user-id',
                username: 'test-user',
                channel: 'test-channel',
                timestamp: new Date(),
                type: 'command',
                metadata: { command: 'search' }
            };

            // Crear un mock del KeywordExtractor que lance un error
            const mockKeywordExtractor = {
                extractKeywords: jest.fn().mockImplementation(() => {
                    throw new Error('Unexpected test error');
                })
            };

            // Crear una instancia de SearchCommand con el mock
            const commandWithMockExtractor = new SearchCommand(logger);
            (commandWithMockExtractor as any).keywordExtractor = mockKeywordExtractor;

            // Act
            const result = await commandWithMockExtractor.validate(searchMessage);

            // Assert
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('Lo siento, hubo un error');
            expect(result.keywords).toBeUndefined();
            expect(result.spaceKey).toBeUndefined();
            expect(result.spaceName).toBeUndefined();
        });

        it('should reject invalid keyword characters', async () => {
            // Arrange
            const searchMessage: Message = {
                content: '@#$%^&* -- TKA',
                userId: 'test-user-id',
                username: 'test-user',
                channel: 'test-channel',
                timestamp: new Date(),
                type: 'command',
                metadata: { command: 'search' }
            };

            // Act
            const result = await searchCommand.validate(searchMessage);

            // Assert
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('No se pudieron extraer palabras clave válidas');
            expect(result.keywords).toBeUndefined();
            expect(result.spaceKey).toBeUndefined();
        });
    });
}); 