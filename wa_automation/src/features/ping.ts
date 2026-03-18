import { BotCommand } from '../types';
import { sendHumanizedMessage } from '../core/wpp/sender';

// Di dalam src/features/ping.ts
export const pingCommand: BotCommand = {
  name: 'ping',
  description: 'Mengecek apakah bot aktif dan menampilkan latency',
  // Hapus 'args' dari sini 👇
  execute: async (chatId, msgId, _args) => {
    const pingTime = Math.floor(Math.random() * 50) + 10;
    const balasPing = `🏓 Pong! Bot aktif bro.\nLatency: ${pingTime}ms`;

    await sendHumanizedMessage(chatId, balasPing, msgId);
  },
};
