// src/services/receiver/processor.ts

import { runtimeState } from '../../config';
import { getWPP, dbManager } from '../../core';
import { extractMessageData } from './extractor';
import { passesFilter } from './filter';
import { addMessageToStitcher } from './stitcher';

const MEDIA_TYPES = new Set([
  'image', 'video', 'audio', 'ptt', 'document', 'sticker',
]);

export async function processIncomingMessage(msg: unknown): Promise<void> {
  try {
    const dataPesan = await extractMessageData(msg);
    const m = msg as Record<string, any>;
    const isFromMe = m?.id?.fromMe === true;

    // ── Tentukan role pengirim ────────────────────────────────────────────
    let role: 'user' | 'bot' | 'owner' = 'user';

    if (isFromMe) {
      role = dataPesan.teks === runtimeState.lastBotText ? 'bot' : 'owner';
    }

    // ── Tentukan sender untuk DB ──────────────────────────────────────────
    // PENTING: jika pesan dari kita sendiri, gunakan 'bot_assistant' sebagai
    // sender_jid agar konsisten dengan yang didaftarkan di contacts.
    const senderJid   = isFromMe ? 'bot_assistant' : dataPesan.pengirimAsli;
    const senderName  = isFromMe ? 'Dway AI'       : dataPesan.namaPanggilan;

    console.log(`[Processor] Role: ${role} | Tipe: ${dataPesan.tipePesan} | Dari: ${senderName}`);

    // ========================================================
    // TAHAP 1: SIMPAN KE DATABASE
    // Urutan ini WAJIB — SQLite memakai FOREIGN KEY:
    //   contacts → chats → messages
    // ========================================================

    // 1a. Daftarkan kontak (DULU sebelum apapun)
    await dbManager.upsertContact({ jid: senderJid, pushname: senderName });

    // 1b. Daftarkan chat room (DULU sebelum save_message)
    await dbManager.upsertChat({
      chat_jid: dataPesan.idChat,
      chat_name: dataPesan.isGroup ? dataPesan.namaProfil : null,
      is_group: dataPesan.isGroup ? 1 : 0,
    });

    // ─── Handle Media ─────────────────────────────────────────────────────
    let mediaFilePath: string | undefined;
    let mediaMimeType: string | undefined = dataPesan.mimeType;
    let mediaSize: number | undefined;

    if (MEDIA_TYPES.has(dataPesan.tipePesan) && dataPesan.hasMedia) {
      const WPP = getWPP();
      if (WPP && dataPesan.idPesan) {
        try {
          const blob = await WPP.chat.downloadMedia(dataPesan.idPesan);
          mediaMimeType = blob.type || dataPesan.mimeType || 'application/octet-stream';
          mediaSize     = blob.size;

          const base64DataUrl = await WPP.util.blobToBase64(blob);
          const savedPath = await dbManager.uploadMedia(
            base64DataUrl,
            mediaMimeType,
            dataPesan.idPesan,
            dataPesan.tipePesan,
          );

          if (savedPath) {
            mediaFilePath = savedPath;
            console.log(`[Processor] Media tersimpan: ${savedPath} (${mediaSize} bytes)`);
          }
        } catch (mediaErr) {
          console.error('[Processor] Gagal download media:', mediaErr);
        }
      }
    }

    // ── PERBAIKAN BUG quoted_message_id ──────────────────────────────────
    // `dataPesan.idPesanDibalas` kadang berupa OBJECT dari WPP (bukan string).
    // SQLite tidak bisa menerima object — harus dikonversi ke string atau null.
    //
    // Contoh nilai bermasalah yang dikirim WPP:
    //   { _serialized: "true_628xxx_ABCDEF", fromMe: true, ... }
    //
    // Solusi: ambil ._serialized jika object, atau String() jika primitif.
    const rawQuotedId = dataPesan.idPesanDibalas as any;
    const quotedId: string | undefined =
      rawQuotedId == null          ? undefined                    // null/undefined → undefined
      : typeof rawQuotedId === 'object'
        ? (rawQuotedId?._serialized ?? String(rawQuotedId))       // object → ambil _serialized
        : String(rawQuotedId);                                    // string/number → cast ke string

    if (rawQuotedId != null && typeof rawQuotedId === 'object') {
      console.warn('[Processor] ⚠️ quoted_message_id adalah object, sudah dikonversi:', quotedId);
    }

    // 1c. Baru simpan pesan (contacts + chats sudah pasti ada)
    await dbManager.saveMessage({
      message_id:        dataPesan.idPesan,
      chat_jid:          dataPesan.idChat,
      sender_jid:        senderJid,
      is_from_me:        isFromMe ? 1 : 0,
      role:              role === 'bot' ? 'assistant' : 'user',
      message_type:      (dataPesan.tipePesan as any) ?? 'chat',
      content:           dataPesan.teks || null,
      timestamp:         dataPesan.waktu,
      quoted_message_id: quotedId,          // ← sudah dijamin string atau undefined
      media_file_path:   mediaFilePath,
      media_mime_type:   mediaMimeType,
      media_size:        mediaSize,
    });

    // ========================================================
    // TAHAP 2: FILTER UNTUK AI
    // ========================================================

    if (isFromMe)                    return; // jangan balas diri sendiri
    if (!runtimeState.isBotActive)   return; // toggle bot mati
    if (!dataPesan.teks && !['chat', 'reply'].includes(dataPesan.tipePesan)) return;
    if (!passesFilter(m, dataPesan.idChat)) return;

    addMessageToStitcher(dataPesan);

  } catch (err) {
    console.error('[Processor] Error tidak tertangani:', err);
  }
}
