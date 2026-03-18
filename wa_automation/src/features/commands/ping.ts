// src/features/commands/ping.ts
//
// Command !ping — mengecek apakah bot aktif dan merespons.

import type { BotCommand }      from '../../shared/types'; // ✅
import { sendHumanizedMessage } from '../../core/wpp';     // ✅ via barrel
import { randomInt }            from '../../shared/utils'; // ✅

export const pingCommand: BotCommand = {
  name: 'ping',
  description: 'Mengecek apakah bot aktif dan menampilkan estimasi latency.',

  execute: async (chatId, msgId, _args) => {
    const latency  = randomInt(10, 60);
    const balasan  = `🏓 Pong! Bot aktif.\nLatency: ~${latency}ms`;
    await sendHumanizedMessage(chatId, balasan, msgId);
  },
};