import { runtimeState } from '../../config';
import { dbManager } from '../../core';
import { extractMessageData } from './extractor';
import { passesFilter } from './filter';
import { addMessageToStitcher } from './stitcher';

export async function processIncomingMessage(msg: unknown): Promise<void> {
  try {
    const dataPesan = await extractMessageData(msg);
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

    // ========================================================
    // TAHAP 1: SIMPAN KE DATABASE (SEMUA JENIS PESAN MASUK!)
    // ========================================================
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
      message_type: (dataPesan.tipePesan as any) ?? 'chat', // Bisa 'image', 'audio', 'sticker', dll
      content: dataPesan.teks || '', // Kalau gambar tanpa caption, set kosong
      timestamp: dataPesan.waktu,
      quoted_message_id: dataPesan.idPesanDibalas,
    });
    
    // ========================================================
    // TAHAP 2: PENYARINGAN UNTUK AI (FILTERING)
    // ========================================================
    
    // 1. Jangan balas pesan dari diri sendiri (bot maupun owner)
    if (isFromMe) return;

    // 2. Jangan balas kalau toggle bot sedang dimatikan
    if (!runtimeState.isBotActive) return;

    // 3. Hentikan jika BUKAN pesan teks biasa atau reply (misal: stiker / VN tanpa teks)
    // AI hanya memproses jika ada teksnya atau tipe pesannya memang chat/reply
    if (!dataPesan.teks && !['chat', 'reply'].includes(dataPesan.tipePesan)) {
        return; // Berhenti di sini. Data sudah aman di database, tapi AI dibiarkan tidur.
    }

    // 4. Filter khusus (whitelist / jam kerja / antrean)
    if (!passesFilter(m, dataPesan.idChat)) return;

    // Lulus semua pengecekan — serahkan ke antrean (stitcher) sebelum dibalas AI
    addMessageToStitcher(dataPesan);

  } catch (err) {
    console.error('[Processor] Error tidak tertangani:', err);
  }
}