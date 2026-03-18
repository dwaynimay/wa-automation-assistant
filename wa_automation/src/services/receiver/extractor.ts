// src/services/receiver/extractor.ts
//
// Bertugas mengurai objek pesan mentah dari WPP (yang bentuknya tidak tentu)
// menjadi struktur MessageData yang rapi dan bisa diandalkan.
// Setiap "cekpoint" dibungkus try/catch agar satu field yang gagal
// tidak merusak keseluruhan proses.

import { getWPP } from '../../core/wpp'; // ✅ via barrel
import type { MessageData } from '../../shared/types'; // ✅ dari shared

export async function extractMessageData(msg: unknown): Promise<MessageData> {
  // Kita cast sekali di sini agar kode ekstraksi lebih bersih.
  // Penggunaan optional chaining (?.) di bawah sudah melindungi dari undefined.
  const m = msg as Record<string, any>;

  console.log('[Extractor] Memulai ekstraksi data...');

  // Nilai default yang aman — digunakan jika satu cekpoint gagal
  let idPesan = 'unknown',
    waktu = 0,
    fromMe = false;
  let idChat = 'unknown',
    isGroup = false,
    pengirimAsli = 'unknown';
  let namaProfil = 'Orang',
    namaKontak = '',
    namaPanggilan = 'Orang';
  let tipePesan = 'unknown',
    teks = '';
  let isReply = false,
    idPesanDibalas: string | undefined;
  let teksDibalas: string | undefined;
  let hasMedia = false,
    mimeType: string | undefined;

  // Cekpoint 1: Metadata dasar
  try {
    idPesan = m?.id?._serialized || String(m?.id ?? 'unknown');
    waktu = m?.t ?? Math.floor(Date.now() / 1000);
    fromMe = m?.id?.fromMe ?? m?.fromMe ?? false;
  } catch (e) {
    console.error('[Extractor] Gagal di Cekpoint 1 (Metadata):', e);
  }

  // Cekpoint 2: Routing & ID chat
  try {
    idChat =
      typeof m?.from === 'string'
        ? m.from
        : (m?.from?._serialized ?? 'unknown');
    isGroup = m?.isGroup ?? false;
    pengirimAsli = isGroup && m?.author ? m.author : idChat;
  } catch (e) {
    console.error('[Extractor] Gagal di Cekpoint 2 (Routing):', e);
  }

  // Cekpoint 3: Info profil pengirim
  try {
    namaProfil = m?.notifyName ?? m?.sender?.pushname ?? 'Orang';
    namaKontak = m?.sender?.name ?? m?.sender?.formattedName ?? '';
    namaPanggilan = namaKontak || namaProfil;
  } catch (e) {
    console.error('[Extractor] Gagal di Cekpoint 3 (Profil):', e);
  }

  // Cekpoint 4: Isi teks pesan
  try {
    tipePesan = m?.type ?? 'unknown';
    const mentah = m?.body ?? m?.caption ?? m?.content ?? '';
    teks = String(mentah).trim();
  } catch (e) {
    console.error('[Extractor] Gagal di Cekpoint 4 (Teks):', e);
  }

  // Cekpoint 5: Konteks reply (pesan yang dikutip)
  try {
    isReply = m?.hasQuotedMsg ?? !!m?.quotedMsgId;
    idPesanDibalas = m?.quotedMsgId ?? undefined;

    if (isReply && idPesanDibalas) {
      const WPP = getWPP();
      if (WPP) {
        const pesanAsli = await WPP.chat.getMessageById(idPesanDibalas);
        const tMentah =
          pesanAsli?.body ?? pesanAsli?.caption ?? m?.quotedMsgObj?.body ?? '';
        teksDibalas = String(tMentah).trim() || undefined;
      }
    }
  } catch (e) {
    console.error('[Extractor] Gagal di Cekpoint 5 (Reply):', e);
  }

  // Cekpoint 6: Media
  try {
    const TIPE_MEDIA = [
      'image',
      'video',
      'document',
      'audio',
      'ptt',
      'sticker',
    ];
    hasMedia = m?.hasMedia ?? TIPE_MEDIA.includes(tipePesan);
    mimeType = m?.mimetype ?? undefined;
  } catch (e) {
    console.error('[Extractor] Gagal di Cekpoint 6 (Media):', e);
  }

  console.log('[Extractor] Ekstraksi selesai.');

  return {
    idPesan,
    waktu,
    fromMe,
    idChat,
    isGroup,
    pengirimAsli,
    namaProfil,
    namaKontak,
    namaPanggilan,
    tipePesan,
    teks,
    isReply,
    idPesanDibalas,
    teksDibalas,
    hasMedia,
    mimeType,
  };
}
