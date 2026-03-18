// File: src/features/shortcuts.ts
import { getWPP } from '../core/wpp';
import { tampilkanNotifikasi } from '../ui';

/**
 * Fitur Shortcut Keyboard
 * * Fungsi ini mendaftarkan listener global untuk tombol shortcut.
 * Saat ini mendukung:
 * - Alt + C: Mengambil JID (ID Chat) dari obrolan yang sedang dibuka.
 */
export function setupShortcuts() {
  window.addEventListener('keydown', async (e) => {
    // 🔍 FITUR SHORTCUT CEK JID (ALT + C)
    if (e.altKey && e.key.toLowerCase() === 'c') {
      const WPP = getWPP();

      if (!WPP) {
        console.error('❌ Shortcuts: WPP belum siap.');
        return;
      }

      try {
        const activeChat = await WPP.chat.getActiveChat();

        if (activeChat) {
          const jid = activeChat.id._serialized || activeChat.id;
          const nama = activeChat.name || 'Tidak diketahui';

          // Gunakan prompt agar user bisa langsung copy ID-nya
          window.prompt(`🔑 JID [${nama}]:`, jid);
        } else {
          tampilkanNotifikasi('Buka chat dulu baru tekan Alt + C', 'error');
        }
      } catch (err) {
        console.error('❌ Shortcuts Error:', err);
      }
    }
  });
}
