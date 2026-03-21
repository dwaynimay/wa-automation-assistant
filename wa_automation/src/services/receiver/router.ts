// src/services/receiver/router.ts
//
// Pengambil keputusan: setelah pesan lolos semua filter dan antrean,
// router memutuskan "pesan ini harus diapakan?"
// Prioritas: command manual (!ping) → AI assistant.

import { runtimeState } from '../../config';
import { sendHumanizedMessage } from '../../core';
import { dbManager } from '../../core';
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

    // ─────────────────────────────────────────────────────────────────────
    // FIX BUG 1: Pastikan chat & contact sudah ada di DB SEBELUM save_message
    // Tanpa ini, save_message akan error 500 karena FOREIGN KEY constraint:
    //   messages.chat_jid → chats.chat_jid (belum ada!)
    //   messages.sender_jid → contacts.jid (belum ada!)
    // ─────────────────────────────────────────────────────────────────────

    // 1a. Daftarkan chat room (jika belum ada)
    await dbManager.upsertChat({
      chat_jid: chatId,
      chat_name: null,   // chat japri tidak punya nama group
      is_group: 0,
    });

    // 1b. Daftarkan contact bot (jika belum ada)
    await dbManager.upsertContact({
      jid: 'bot_assistant',
      pushname: 'Dway AI',
    });

    // 1c. Baru simpan pesan balasan bot
    const sentMsgId = `bot_msg_${Date.now()}`;
    await dbManager.saveMessage({
      message_id: sentMsgId,
      chat_jid: chatId,
      sender_jid: 'bot_assistant',
      is_from_me: 1,
      role: 'assistant',
      message_type: 'chat',
      content: balasanAI,
      timestamp: Math.floor(Date.now() / 1000),
      quoted_message_id: msgId,
    });

    console.log(`[Router] ✅ Balasan bot tersimpan ke DB. (msg_id: ${sentMsgId})`);
  }
}
