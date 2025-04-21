export interface BotResponse {
  content: string;
  type: 'text' | 'error' | 'search_result' | 'summary';
  threadId?: string;
  attachments?: Array<{
    title?: string;
    text?: string;
    imageUrl?: string;
    color?: string;
  }>;
  metadata?: {
    source?: string;
    confidence?: number;
    error?: boolean;
    message?: string;
    tokensUsed?: number;
    promptTokens?: number;
    completionTokens?: number;
    [key: string]: any;
  };
} 