import { runtimeState } from '../../config';
import { getWPP, dbManager } from '../../core';
import { extractMessageData } from './extractor';
import { passesFilter } from './filter';
import { addMessageToStitcher } from './stitcher';

// Jika pakai Set:
const MEDIA_TYPES = new Set([
  'image',
  'video',
  'audio',
  'ptt',
  'document',
  'sticker',
]);

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

    // ─── Handle Media ──────────────────────────────────────────────────────
    let mediaFilePath: string | undefined;
    let mediaMimeType: string | undefined = dataPesan.mimeType;
    let mediaSize: number | undefined;

    const isMediaMessage = MEDIA_TYPES.has(dataPesan.tipePesan);

    if (isMediaMessage && dataPesan.hasMedia) {
      const WPP = getWPP();
      // message ID dalam format: "true_628xxx@c.us_ABCDEF1234"
      const messageId = dataPesan.idPesan;

      if (WPP && messageId) {
        try {
          console.log(
            `[Processor] Downloading media (${dataPesan.tipePesan}): ${messageId}`,
          );

          // ✅ API yang benar sesuai dokumentasi WPP.js:
          // WPP.chat.downloadMedia(id) → Promise<Blob>
          const blob = await WPP.chat.downloadMedia(messageId);

          // Ambil mimeType dari Blob (lebih akurat dari msg.mimetype)
          mediaMimeType =
            blob.type || dataPesan.mimeType || 'application/octet-stream';
          mediaSize = blob.size;

          // ✅ Konversi Blob → base64 data URL menggunakan WPP.util.blobToBase64
          // Hasil format: "data:image/jpeg;base64,/9j/4AAQ..."
          const base64DataUrl = await WPP.util.blobToBase64(blob);

          // Kirim ke Python untuk disimpan ke disk
          // Python akan strip prefix "data:image/jpeg;base64," sendiri
          const savedPath = await dbManager.uploadMedia(
            base64DataUrl,
            mediaMimeType,
            messageId,
          );

          if (savedPath) {
            mediaFilePath = savedPath;
            console.log(
              `[Processor] Media tersimpan di: ${savedPath} (${mediaSize} bytes)`,
            );
          }
        } catch (mediaErr) {
          // Gagal download media tidak fatal — pesan tetap tersimpan tanpa file
          console.error('[Processor] Gagal download media:', mediaErr);
        }
      }
    }
    // ──────────────────────────────────────────────────────────────────────

    await dbManager.saveMessage({
      message_id: dataPesan.idPesan,
      chat_jid: dataPesan.idChat,
      sender_jid: dataPesan.pengirimAsli,
      is_from_me: isFromMe ? 1 : 0,
      role: role === 'bot' ? 'assistant' : 'user',
      message_type: (dataPesan.tipePesan as any) ?? 'chat',
      content: dataPesan.teks || null, // ← caption saja, BUKAN base64
      timestamp: dataPesan.waktu,
      quoted_message_id: dataPesan.idPesanDibalas,
      media_file_path: mediaFilePath, // ← path di disk
      media_mime_type: mediaMimeType,
      media_size: mediaSize,
    });

    console.log(`[Processor] Role: ${role} | Tipe: ${dataPesan.tipePesan}`);

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
