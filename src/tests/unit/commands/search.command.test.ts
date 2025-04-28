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
        it('should use TKA as default space when no space is specified', async () => {
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
    });

    describe('Space Key Validation', () => {
        it.each([
            ['TKA', 'TKA Knowledge Archive', 'code conventions'],
            ['NVP', 'NVP Documentation', 'architecture design']
        ])('should validate %s space correctly', async (spaceKey: string, expectedName: string, searchTerms: string) => {
            // Arrange
            const searchMessage: Message = {
                content: `${spaceKey} ${searchTerms}`,
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
            expect(result.spaceKey).toBe(spaceKey);
            expect(result.spaceName).toBe(expectedName);
            expect(result.keywords).toEqual(searchTerms.split(' '));
            expect(result.error).toBeUndefined();
        });

        it('should reject invalid space key', async () => {
            // Arrange
            const invalidSpace = 'INVALID';
            const searchMessage: Message = {
                content: `${invalidSpace} search terms`,
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
            expect(result.error).toContain(invalidSpace);
            expect(result.error).toContain('TKA');
            expect(result.error).toContain('NVP');
            expect(result.spaceKey).toBeUndefined();
            expect(result.spaceName).toBeUndefined();
        });

        it('should reject valid space with no keywords', async () => {
            // Arrange
            const searchMessage: Message = {
                content: 'TKA    ',
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
                content: 'TKA @#$%^&*',
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