import { ConversationContext } from '../../application/use-cases/ManageConversationContextUseCase';

export interface CachePort {
  saveContext(channelId: string, context: ConversationContext): Promise<void>;
  getContext(channelId: string): Promise<ConversationContext | null>;
  deleteContext(channelId: string): Promise<void>;
  cacheSearchResults(query: string, results: any[], ttlSeconds?: number): Promise<void>;
  getCachedSearchResults(query: string): Promise<any[] | null>;
} 