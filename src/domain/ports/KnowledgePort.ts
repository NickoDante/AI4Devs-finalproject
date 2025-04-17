export interface KnowledgePort {
  searchKnowledge(query: string): Promise<SearchResult[]>;
  saveKnowledge(content: KnowledgeContent): Promise<void>;
  updateKnowledge(id: string, content: KnowledgeContent): Promise<void>;
}

export interface SearchResult {
  id: string;
  content: string;
  relevance: number;
  source: string;
  lastUpdated: Date;
}

export interface KnowledgeContent {
  title: string;
  content: string;
  tags?: string[];
  source: string;
  metadata?: Record<string, any>;
} 