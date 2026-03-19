// src/features/cek-jid/setup-shortcuts.ts
//
// Fitur shortcut keyboard untuk developer/owner.
// Alt + C: Ambil JID (ID chat) dari percakapan yang sedang dibuka.

import { getWPP } from '../../core/wpp'; // ✅
import { tampilkanNotifikasi } from '../../ui'; // ✅

export function setupShortcuts(): void {
  window.addEventListener('keydown', async (e) => {
    if (e.altKey && e.key.toLowerCase() === 'c') {
      const WPP = getWPP();

      if (!WPP) {
        console.error('[CekJid] WPP belum siap.');
        return;
      }

      try {
        const activeChat = await WPP.chat.getActiveChat();

        if (activeChat) {
          const jid = activeChat.id._serialized ?? activeChat.id;
          const nama = activeChat.name ?? 'Tidak diketahui';
          window.prompt(`🔑 JID [${nama}]:`, jid);
        } else {
          tampilkanNotifikasi('Buka chat dulu baru tekan Alt + C', 'error');
        }
      } catch (err) {
        console.error('[CekJid] Error:', err);
      }
    }
  });
}
