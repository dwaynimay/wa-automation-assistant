import { MessageData } from '../../types';
import { getWPP } from '../../core/wpp/instance';

export async function extractMessageData(msg: any): Promise<MessageData> {
  console.log('   [Extractor] Memulai ekstraksi data...');

  // Siapkan nilai bawaan (default) yang aman
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
    idPesanDibalas = undefined,
    teksDibalas = undefined;
  let hasMedia = false,
    mimeType = undefined;

  // CEKPOINT 1: Metadata
  try {
    idPesan = msg?.id?._serialized || String(msg?.id || 'unknown');
    waktu = msg?.t || Math.floor(Date.now() / 1000);
    fromMe = msg?.id?.fromMe || msg?.fromMe || false;
    console.log('   [Extractor] Cekpoint 1 (Metadata): AMAN');
  } catch (e) {
    console.error('   [Extractor] ERROR di Cekpoint 1:', e);
  }

  // CEKPOINT 2: Routing & ID
  try {
    idChat =
      typeof msg?.from === 'string'
        ? msg.from
        : msg?.from?._serialized || String(msg?.from || 'unknown');
    isGroup = msg?.isGroup || false;
    pengirimAsli = isGroup && msg?.author ? msg.author : idChat;
    console.log('   [Extractor] Cekpoint 2 (Routing): AMAN');
  } catch (e) {
    console.error('   [Extractor] ERROR di Cekpoint 2:', e);
  }

  // CEKPOINT 3: Profil
  try {
    namaProfil = msg?.notifyName || msg?.sender?.pushname || 'Orang';
    namaKontak = msg?.sender?.name || msg?.sender?.formattedName || '';
    namaPanggilan = namaKontak ? namaKontak : namaProfil;
    console.log('   [Extractor] Cekpoint 3 (Profil): AMAN');
  } catch (e) {
    console.error('   [Extractor] ERROR di Cekpoint 3:', e);
  }

  // CEKPOINT 4: Ekstraksi Teks
  try {
    tipePesan = msg?.type || 'unknown';
    const teksMentah = msg?.body || msg?.caption || msg?.content || '';
    teks =
      typeof teksMentah === 'string'
        ? teksMentah.trim()
        : String(teksMentah).trim();
    console.log('   [Extractor] Cekpoint 4 (Teks): AMAN');
  } catch (e) {
    console.error('   [Extractor] ERROR di Cekpoint 4:', e);
  }

  // CEKPOINT 5: Pesan Balasan (Reply)
  try {
    isReply = msg?.hasQuotedMsg || !!msg?.quotedMsgId || false;
    idPesanDibalas = msg?.quotedMsgId || undefined;
    if (isReply && idPesanDibalas) {
      const WPP = getWPP();
      // Paksa cari pesan aslinya secara manual!
      const pesanAsli = await WPP.chat.getMessageById(idPesanDibalas);

      const tMentah =
        pesanAsli?.body || pesanAsli?.caption || msg?.quotedMsgObj?.body || '';
      teksDibalas =
        typeof tMentah === 'string' ? tMentah.trim() : String(tMentah).trim();
    }
    console.log('   [Extractor] Cekpoint 5 (Reply): AMAN');
  } catch (e) {
    console.error('   [Extractor] ERROR di Cekpoint 5:', e);
  }

  // CEKPOINT 6: Media
  try {
    const arrMedia = ['image', 'video', 'document', 'audio', 'ptt', 'sticker'];
    hasMedia = msg?.hasMedia || arrMedia.includes(tipePesan);
    mimeType = msg?.mimetype || undefined;
    console.log('   [Extractor] Cekpoint 6 (Media): AMAN');
  } catch (e) {
    console.error('   [Extractor] ERROR di Cekpoint 6:', e);
  }

  console.log(
    '   [Extractor] SEMUA CEKPOINT SELESAI. Menyerahkan data kembali ke Processor.',
  );

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
