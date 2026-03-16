import { STATE } from '../config';
import { getWPP, sendHumanizedMessage } from '../core/wpp';
import { memoryManager } from '../core/memory';
import { askAI } from '../features/ai-assistant';
import { handlePing } from '../features/ping';

export function setupMessageHandler() {
  const WPP = getWPP();
  console.log("🤖 [Bot] Router Pesan Aktif & Mendengarkan...");

  WPP.on('chat.new_message', async (msg: any) => {
    try {
      if (!STATE.botAktif) return;
      if (msg.id?.fromMe) return; // Abaikan pesan sendiri
      if (msg.isGroup) return;    // Abaikan grup (bisa diubah nanti kalau butuh)

      const text = (msg.body || "").trim();
      if (!text) return;

      const msgId = msg.id?._serialized || String(msg.id);
      if (memoryManager.isMessageProcessed(msgId)) return;

      // Fix ID supaya pasti string
      const chatId = typeof msg.from === 'string' ? msg.from : (msg.from._serialized || String(msg.from));
      console.log(`📩 [Pesan Baru] dari ${chatId}: "${text}"`);

      // ==========================================
      // 🔀 ROUTING SYSTEM (Command vs AI)
      // ==========================================
      if (text.startsWith('!')) {
        const args = text.slice(1).split(' ');
        const command = args.shift()?.toLowerCase();

        switch (command) {
          case 'ping':
            const balasPing = handlePing();
            await sendHumanizedMessage(chatId, balasPing, msgId);
            return; // Stop di sini, jangan lanjut ke AI
            
          // Tambahin case lain di sini nanti, misal: case 'cuaca': handleCuaca();
        }
      }

      // Default: Lempar ke AI
      const balasanAI = await askAI(text, chatId);
      if (balasanAI) {
        await sendHumanizedMessage(chatId, balasanAI, msgId);
      }

    } catch (err) {
      console.error("❌ Error saat memproses pesan:", err);
    }
  });
}