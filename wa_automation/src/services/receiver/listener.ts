// src/services/receiver/listener.ts
//
// Pintu masuk pertama semua pesan WhatsApp.
// Tugasnya SATU: dengarkan event dari WPP, lalu lempar ke processor.
// Tidak ada logika bisnis di sini.

import { getWPP } from '../../core/wpp'; // ✅ via barrel
import { processIncomingMessage } from './processor';

export function setupMessageListener(): void {
  const WPP = getWPP();

  // Guard: pastikan WPP sudah tersedia sebelum mendaftar listener
  if (!WPP) {
    console.error(
      '[Listener] WPP belum siap. Listener tidak dapat didaftarkan.',
    );
    return;
  }

  WPP.on('chat.new_message', async (msg: unknown) => {
    console.log('[Listener] Pesan baru masuk, dikirim ke processor...');
    await processIncomingMessage(msg);
  });

  console.log('[Listener] Aktif dan siap mendengarkan pesan masuk.');
}
