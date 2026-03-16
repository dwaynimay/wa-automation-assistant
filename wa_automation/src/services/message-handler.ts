import { STATE, BOT_RULES } from '../config'; // <-- Tambahkan BOT_RULES di import
import { getWPP } from '../core/wpp/instance';
import { sendHumanizedMessage } from '../core/wpp/sender';
import { memoryManager } from '../core/memory';
import { askAI } from '../features/ai-assistant';
import { getCommand } from './command-registry'; 

export function setupMessageHandler() {
  const WPP = getWPP();
  console.log("🤖 [Bot] Router Pesan Aktif & Mendengarkan...");

  WPP.on('chat.new_message', async (msg: any) => {
    try {
      if (!STATE.botAktif) return;

      // ==========================================
      // 🛡️ SISTEM FILTERING BERDASARKAN CONFIG
      // ==========================================
      
      // 1. Filter Status/Story WA (Biasanya msg.isStatusV3 bernilai true untuk story)
      if (msg.isStatusV3 && !BOT_RULES.respondToStatus) return;

      // 2. Filter Pesan Sendiri (fromMe)
      if (msg.id?.fromMe && !BOT_RULES.respondToSelf) return;

      // 3. Filter Pesan Grup
      if (msg.isGroup && !BOT_RULES.respondToGroups) return;

      const chatId = typeof msg.from === 'string' ? msg.from : (msg.from._serialized || String(msg.from));

      // 4. Filter Whitelist Nomor Pribadi (Jika array tidak kosong)
      if (!msg.isGroup && BOT_RULES.whitelistNumbers.length > 0) {
        if (!BOT_RULES.whitelistNumbers.includes(chatId)) return;
      }

      // 5. Filter Whitelist Grup (Jika array tidak kosong)
      if (msg.isGroup && BOT_RULES.whitelistGroups.length > 0) {
        if (!BOT_RULES.whitelistGroups.includes(chatId)) return;
      }

      // ==========================================

      const text = (msg.body || "").trim();
      if (!text) return;

      const msgId = msg.id?._serialized || String(msg.id);
      if (memoryManager.isMessageProcessed(msgId)) return;

      console.log(`📩 [Pesan Baru Lolos Filter] dari ${chatId}: "${text}"`);

      // ==========================================
      // 🔀 ROUTING SYSTEM (Command vs AI)
      // ==========================================
      if (text.startsWith('!')) {
        const args = text.slice(1).split(' ');
        const commandName = args.shift()?.toLowerCase();

        if (commandName) {
          const command = getCommand(commandName);
          if (command) {
            await command.execute(chatId, msgId, args);
            return;
          }
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