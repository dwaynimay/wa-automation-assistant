// src/services/receiver/processor.ts
//
// Orkestrator utama: menerima pesan mentah, mengekstrak, memvalidasi,
// lalu memutuskan apakah pesan ini perlu dibalas bot atau tidak.

import { runtimeState }          from '../../config';          // ✅
import { extractMessageData }    from './extractor';
import { passesFilter }          from './filter';
import { addMessageToStitcher }  from './stitcher';

export async function processIncomingMessage(msg: unknown): Promise<void> {
  try {
    const dataPesan = await extractMessageData(msg);

    // Abaikan pesan yang bukan teks biasa (gambar, sticker, dll tanpa teks)
    if (!dataPesan.teks || dataPesan.tipePesan !== 'chat') return;

    const m        = msg as Record<string, any>;
    const isFromMe = m?.id?.fromMe === true;

    // --- Tentukan role pengirim ---
    let role: 'user' | 'bot' | 'owner' = 'user';
    let namaFix = dataPesan.namaPanggilan;

    if (isFromMe) {
      if (dataPesan.teks === runtimeState.lastBotText) {
        role    = 'bot';
        namaFix = 'BOT AI';
      } else {
        role    = 'owner';
        namaFix = 'Owner';
      }
    }

    // TODO: Simpan ke database saat dbManager sudah siap
    // await dbManager.saveUser(dataPesan.idChat, namaFix);
    // await dbManager.saveMessage(dataPesan.idPesan, dataPesan.idChat, role, dataPesan.teks);
    console.log(`[Processor] Role: ${role} | Nama: ${namaFix}`);

    // Jangan balas pesan dari diri sendiri (bot maupun owner mengetik manual)
    if (isFromMe) return;

    // Jangan balas kalau bot sedang dimatikan atau pesan tidak lolos filter
    if (!runtimeState.isBotActive) {
      console.log('[Processor] Bot tidak aktif, pesan diabaikan.');
      return;
    }

    if (!passesFilter(m, dataPesan.idChat)) return;

    // Lulus semua pengecekan — serahkan ke stitcher untuk dikumpulkan sebelum dibalas
    addMessageToStitcher(dataPesan);

  } catch (err) {
    console.error('[Processor] Error tidak tertangani:', err);
  }
}