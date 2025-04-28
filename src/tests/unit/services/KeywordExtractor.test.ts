import { KeywordExtractor } from '../../../application/services/KeywordExtractor';
import { createLogger } from 'winston';

describe('KeywordExtractor', () => {
    let keywordExtractor: KeywordExtractor;
    let logger: any;

    beforeEach(() => {
        logger = createLogger({ silent: true });
        keywordExtractor = new KeywordExtractor(logger);
    });

    it('should extract keywords from a simple query', () => {
        const query = 'guía de onboarding para nuevos empleados';
        const keywords = keywordExtractor.extractKeywords(query);
        
        expect(keywords).toContain('guía');
        expect(keywords).toContain('onboarding');
        expect(keywords).toContain('nuevos');
        expect(keywords).toContain('empleados');
    });

    it('should handle queries with special characters', () => {
        const query = '¿Cómo hacer el onboarding?';
        const keywords = keywordExtractor.extractKeywords(query);
        
        expect(keywords).toContain('hacer');
        expect(keywords).toContain('onboarding');
    });

    it('should filter out common words', () => {
        const query = 'el proceso de onboarding y la guía';
        const keywords = keywordExtractor.extractKeywords(query);
        
        expect(keywords).not.toContain('el');
        expect(keywords).not.toContain('de');
        expect(keywords).not.toContain('y');
        expect(keywords).not.toContain('la');
        expect(keywords).toContain('proceso');
        expect(keywords).toContain('onboarding');
        expect(keywords).toContain('guía');
    });

    it('should handle empty queries', () => {
        const query = '';
        const keywords = keywordExtractor.extractKeywords(query);
        
        expect(keywords).toEqual(['']);
    });

    it('should handle queries with only common words', () => {
        const query = 'el la los las';
        const keywords = keywordExtractor.extractKeywords(query);
        
        expect(keywords).toEqual(['el la los las']);
    });

    it('should handle queries with numbers and special characters', () => {
        const query = 'onboarding 2024 - guía #1';
        const keywords = keywordExtractor.extractKeywords(query);
        
        expect(keywords).toContain('onboarding');
        expect(keywords).toContain('guía');
    });
}); 