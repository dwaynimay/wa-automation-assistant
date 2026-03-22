// src/services/receiver/router.ts
//
// Pengambil keputusan: setelah pesan lolos semua filter dan antrean,
// router memutuskan "pesan ini harus diapakan?"
// Prioritas: command manual (!ping) → AI assistant.

import { runtimeState } from '../../config';
import { sendHumanizedMessage } from '../../core';
import { askAI } from '../../features';
import { getCommand } from './commands';

export async function routeMessage(
  text: string,
  chatId: string,
  msgId: string,
  senderName: string,
  senderJid: string,
  isReply: boolean = false,
  teksDibalas?: string,
): Promise<void> {
  // Rute 1: Command manual (diawali tanda seru, contoh: !ping)
  if (text.startsWith('!')) {
    const args = text.slice(1).split(' ');
    const commandName = args.shift()?.toLowerCase();

    if (commandName) {
      const command = getCommand(commandName);
      if (command) {
        console.log(`[Router] Menjalankan command: !${commandName}`);
        await command.execute(chatId, msgId, args);
        return;
      }
    }
  }

  // Rute 2: Kirim ke AI assistant
  console.log(`[Router] Mengarahkan ke AI untuk: ${senderName} (JID: ${senderJid})`);
  const balasanAI = await askAI(text, chatId, senderName, senderJid, isReply, teksDibalas);

  if (balasanAI) {
    runtimeState.lastBotText = balasanAI;

    await sendHumanizedMessage(chatId, balasanAI, msgId);
  }
}
