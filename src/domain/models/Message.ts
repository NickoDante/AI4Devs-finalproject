import { ObjectId } from 'mongodb';

export interface Message {
  _id?: ObjectId;
  content: string;
  userId: string;
  username: string;
  channel: string;
  timestamp: Date;
  type: 'direct_message' | 'mention' | 'command' | 'bot_message';
  threadId?: string;
  metadata?: {
    command?: 'search' | 'question' | 'summary';
    error?: boolean;
    errorMessage?: string;
    source?: string;
    [key: string]: any;
  };
} 