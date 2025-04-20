export interface Message {
  userId: string;
  username: string;
  content: string;
  timestamp: Date;
  channel: string;
  threadId?: string;
  type?: 'direct_message' | 'mention' | 'command' | 'bot_message';
  metadata?: {
    command?: string;
    source?: string;
    [key: string]: any;
  };
} 