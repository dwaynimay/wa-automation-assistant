// File: src/services/receiver/processor.ts
import { STATE } from '../../config';
import { extractMessageData } from './extractor';
import { passesFilter } from './filter';
import { addMessageToStitcher } from './stitcher';
import { dbManager } from '../../core/database';

export async function processIncomingMessage(msg: any) {
  try {
    const dataPesan = await extractMessageData(msg);
    if (!dataPesan.teks || dataPesan.tipePesan !== 'chat') return;

    // 1. CEK SIAPA YANG NGOMONG
    const isFromMe = msg.id?.fromMe === true;
    let role: 'user' | 'bot' | 'owner' = 'user';
    let namaFix = dataPesan.namaPanggilan;

    if (isFromMe) {
      // Cek apakah teksnya sama persis dengan balasan AI terakhir
      if (dataPesan.teks === STATE.lastBotText) {
        role = 'bot';
        namaFix = 'BOT AI';
      } else {
        role = 'owner'; // <--- INI KAMU (Ngetik manual)
        namaFix = 'Dwaynimay (Owner)';
      }
    }

    // 2. SIMPAN KE DATABASE
    await dbManager.saveUser(dataPesan.idChat, namaFix);
    await dbManager.saveMessage(
      dataPesan.idPesan,
      dataPesan.idChat,
      role,
      dataPesan.teks,
    );

    // 3. JANGAN BALAS PESAN SENDIRI (Bot atau Owner)
    if (isFromMe) return;

    // 4. JANGAN BALAS KALAU BOT OFF ATAU GAK LOLOS FILTER
    if (!STATE.botAktif || !passesFilter(msg, dataPesan.idChat)) return;

    // 5. LANJUT KE AI
    addMessageToStitcher(dataPesan);
  } catch (err) {
    console.error('❌ Error di Processor:', err);
  }
}
