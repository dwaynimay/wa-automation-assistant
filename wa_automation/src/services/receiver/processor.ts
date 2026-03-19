// src/services/receiver/processor.ts
//
// Orkestrator utama: menerima pesan mentah, mengekstrak, memvalidasi,
// lalu memutuskan apakah pesan ini perlu dibalas bot atau tidak.

import { runtimeState } from '../../config';
import { dbManager } from '../../core';
import { extractMessageData } from './extractor';
import { passesFilter } from './filter';
import { addMessageToStitcher } from './stitcher';

export async function processIncomingMessage(msg: unknown): Promise<void> {
  try {
    const dataPesan = await extractMessageData(msg);

    // Abaikan pesan yang bukan teks biasa (gambar, sticker, dll tanpa teks)
    if (!dataPesan.teks || dataPesan.tipePesan !== 'chat') return;

    const m = msg as Record<string, any>;
    const isFromMe = m?.id?.fromMe === true;

    // --- Tentukan role pengirim ---
    let role: 'user' | 'bot' | 'owner' = 'user';
    let namaFix = dataPesan.namaPanggilan;

    if (isFromMe) {
      if (dataPesan.teks === runtimeState.lastBotText) {
        role = 'bot';
        namaFix = 'BOT AI';
      } else {
        role = 'owner';
        namaFix = 'Owner';
      }
    }

    // TODO: Simpan ke database saat dbManager sudah siap
    // Dengan tiga baris baru ini:
    await dbManager.upsertContact({
      jid: dataPesan.pengirimAsli,
      pushname: dataPesan.namaPanggilan,
    });

    await dbManager.upsertChat({
      chat_jid: dataPesan.idChat,
      chat_name: dataPesan.isGroup ? dataPesan.namaProfil : null,
      is_group: dataPesan.isGroup ? 1 : 0,
    });

    await dbManager.saveMessage({
      message_id: dataPesan.idPesan,
      chat_jid: dataPesan.idChat,
      sender_jid: dataPesan.pengirimAsli,
      is_from_me: isFromMe ? 1 : 0,
      role: role === 'bot' ? 'assistant' : 'user',
      message_type: (dataPesan.tipePesan as any) ?? 'chat',
      content: dataPesan.teks,
      timestamp: dataPesan.waktu,
      quoted_message_id: dataPesan.idPesanDibalas,
    });
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
