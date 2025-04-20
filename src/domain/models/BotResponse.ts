export interface BotResponse {
  content: string;
  type: 'text' | 'error' | 'action';
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
    error?: string | boolean;
    actionType?: string;
    actionData?: any;
    [key: string]: any;
  };
} 