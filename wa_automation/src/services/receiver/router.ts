// src/services/receiver/router.ts
//
// Pengambil keputusan: setelah pesan lolos semua filter dan antrean,
// router memutuskan "pesan ini harus diapakan?"
// Prioritas: command manual (!ping) → AI assistant.

import { runtimeState } from '../../config'; // ✅
import { sendHumanizedMessage } from '../../core'; // ✅
import { dbManager } from '../../core'; // ✅
import { askAI } from '../../features'; // ✅
import { getCommand } from './commands'; // ✅ via barrel baru

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
        return; // Selesai — tidak perlu lanjut ke AI
      }
    }
  }

  // Rute 2: Kirim ke AI assistant
console.log(`[Router] Mengarahkan ke AI untuk: ${senderName} (JID: ${senderJid})`);
  const balasanAI = await askAI(text, chatId, senderName, senderJid, isReply, teksDibalas);

  if (balasanAI) {
    // 1. Simpan teks balasan bot agar processor bisa mengenalinya nanti
    runtimeState.lastBotText = balasanAI;
    
    // 2. Kirim pesan seperti biasa (tanpa perlu menangkap ID dari WPP)
    await sendHumanizedMessage(chatId, balasanAI, msgId);
    
    // 3. DAFTARKAN BOT KE TABEL CONTACT (Agar SQLite tidak menolak pesannya)
    await dbManager.upsertContact({
      jid: 'bot_assistant',
      pushname: 'Dway AI', // Nama bot kamu
    });

    // 4. SIMPAN JAWABAN BOT KE DATABASE DENGAN ID BUATAN SENDIRI
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
  }
}
