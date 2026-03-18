import { ChatMessage } from '../types';
import { appConfig } from '../config';

const chatMemory: Record<string, ChatMessage[]> = {};
const ingatanPesan = new Set<string>();

export const memoryManager = {
  getHistory(chatId: string): ChatMessage[] {
    if (!chatMemory[chatId]) {
      chatMemory[chatId] = [];
    }
    return chatMemory[chatId];
  },

  addMessage(chatId: string, message: ChatMessage) {
    const history = this.getHistory(chatId);
    history.push(message);
    if (history.length > appConfig.maxHistory) {
      chatMemory[chatId] = history.slice(-appConfig.maxHistory);
    }
  },

  removeLastMessage(chatId: string) {
    if (chatMemory[chatId] && chatMemory[chatId].length > 0) {
      chatMemory[chatId].pop();
    }
  },

  isMessageProcessed(msgId: string): boolean {
    if (ingatanPesan.has(msgId)) return true;
    ingatanPesan.add(msgId);
    return false;
  },
};
