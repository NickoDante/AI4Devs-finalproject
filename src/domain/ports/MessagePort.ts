import { Message } from '../models/Message';
import { BotResponse } from '../models/BotResponse';

export interface MessagePort {
  // Métodos principales de comunicación
  sendMessage(channel: string, text: string): Promise<void>;
  processMessage(message: Message): Promise<BotResponse>;
  
  // Método de inicialización
  start(port?: number): Promise<void>;
  
  // Métodos opcionales
  sendThreadReply?(channel: string, threadTs: string, text: string): Promise<void>;
  updateMessage?(channel: string, ts: string, text: string): Promise<void>;
  deleteMessage?(channel: string, ts: string): Promise<void>;
  joinChannel?(channelId: string): Promise<void>;
  leaveChannel?(channelId: string): Promise<void>;
  getChannelHistory?(channel: string, limit?: number): Promise<Message[]>;
  getThreadHistory?(channel: string, threadTs: string): Promise<Message[]>;
} 