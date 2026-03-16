import { MessageData } from '../../types';

export function extractMessageData(msg: any): MessageData {
  // ==========================================
  // 1. METADATA DASAR
  // ==========================================
  const idPesan = msg.id?._serialized || String(msg.id);
  const waktu = msg.t || Math.floor(Date.now() / 1000); // WPPConnect pakai format detik (Unix Timestamp)
  const fromMe = msg.id?.fromMe || false;

  // ==========================================
  // 2. ROUTING & SENDER
  // ==========================================
  const idChat = typeof msg.from === 'string' ? msg.from : (msg.from?._serialized || String(msg.from));
  const isGroup = msg.isGroup || false;
  
  // Jika di grup, WPPConnect menyimpan ID orang yang nge-chat di 'msg.author'.
  // Jika japri, orang yang nge-chat ya sama dengan 'idChat'.
  const pengirimAsli = isGroup && msg.author ? msg.author : idChat;

  // ==========================================
  // 3. INFORMASI KONTAK
  // ==========================================
  // Pushname = Nama profil WA orang tersebut
  const namaProfil = msg.notifyName || msg.sender?.pushname || "Orang";
  
  // Nama kontak di HP kita (kadang ada di .name atau .formattedName)
  const namaKontak = msg.sender?.name || msg.sender?.formattedName || "";
  
  // Prioritaskan nama kontak HP. Kalau kita tidak save nomornya, pakai nama WA-nya.
  const namaPanggilan = namaKontak ? namaKontak : namaProfil;

  // ==========================================
  // 4. ISI PESAN
  // ==========================================
  const tipePesan = msg.type || 'unknown';
  
  // Kadang pesan teks ada di body. Kalau dia kirim gambar + teks, teksnya ada di caption.
  const teks = (msg.body || msg.caption || msg.content || "").trim();

  // ==========================================
  // 5. KONTEKS BALASAN (REPLY)
  // ==========================================
  const isReply = msg.hasQuotedMsg || !!msg.quotedMsgId || false;
  const idPesanDibalas = msg.quotedMsgId || undefined;
  
  // WPPConnect biasanya melampirkan objek pesan yang dibalas di quotedMsgObj
  let teksDibalas = undefined;
  if (isReply && msg.quotedMsgObj) {
    teksDibalas = (msg.quotedMsgObj.body || msg.quotedMsgObj.caption || "").trim();
  }

  // ==========================================
  // 6. INFORMASI MEDIA
  // ==========================================
  const tipeMedia = ['image', 'video', 'document', 'audio', 'ptt', 'sticker'];
  const hasMedia = msg.hasMedia || tipeMedia.includes(tipePesan);
  const mimeType = msg.mimetype || undefined;

  // ==========================================
  // KEMBALIKAN DATA BERSIH
  // ==========================================
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
    mimeType
  };
}