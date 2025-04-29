import { Query, EntityExtraction } from './Query';

export interface Question {
  id: string;
  query: Query;
  context?: {
    previousQuestions?: string[];
    relevantDocuments?: string[];
    conversationId?: string;
  };
  metadata: {
    intent: string;
    confidence: number;
    entities: EntityExtraction[];
    language: 'es' | 'en';
    source?: 'slack' | 'api';
  };
  llmConfig: {
    model: string;
    temperature: number;
    maxTokens?: number;
    stopSequences?: string[];
  };
}

export interface QuestionResult {
  id: string;
  questionId: string;
  answer: string;
  sourceDocuments: {
    id: string;
    title: string;
    url: string;
    relevance: number;
  }[];
  metadata: {
    processingTime: number;
    confidence: number;
    modelUsed: string;
    tokensUsed?: number;
  };
} 