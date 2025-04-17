import { Message } from '../models/Message';
import { BotResponse } from '../models/BotResponse';

export interface AIAdapter {
  processMessage(message: Message): Promise<BotResponse>;
  clearContext(): Promise<void>;
} 