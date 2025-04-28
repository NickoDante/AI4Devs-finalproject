export interface SearchResult {
  id: string;
  content: string;
  relevance: number;
  source: string;
  lastUpdated: Date;
  metadata: {
    spaceKey: string;
    version: number;
    labels: string[];
    url: string;
  };
}

export interface KnowledgeContent {
  title: string;
  content: string;
  tags?: string[];
}

export interface KnowledgePort {
  searchKnowledge(query: string, spaceKey?: string): Promise<SearchResult[]>;
  saveKnowledge(content: KnowledgeContent): Promise<void>;
  updateKnowledge(id: string, content: KnowledgeContent): Promise<void>;
} 