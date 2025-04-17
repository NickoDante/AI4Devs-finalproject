import { Message } from '../models/Message';
import { BotResponse } from '../models/BotResponse';

export interface MessagePort {
  processMessage(message: Message): Promise<BotResponse>;
  sendMessage(channel: string, text: string): Promise<void>;
  start(port: number): Promise<void>;
  getMessageHistory?(channel: string, limit?: number): Promise<Message[]>;
  deleteOldMessages?(daysToKeep?: number): Promise<void>;
} 