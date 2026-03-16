import { STATE } from '../../config';
import { memoryManager } from '../../core/memory';
import { extractMessageData } from './extractor';
import { passesFilter } from './filter';
import { addMessageToStitcher } from './stitcher';

export async function processIncomingMessage(msg: any) {
  try {
    console.log("🔄 [Processor] Mulai memproses pesan...");

    // 1. CEK SAKLAR UTAMA
    if (!STATE.botAktif) {
      console.log("🛑 [Processor] Berhenti: Bot sedang dimatikan (botAktif = false)");
      return;
    }

    // 2. EKSTRAKSI DATA
    const dataPesan = await extractMessageData(msg);
    console.log(`🧩 [Processor] Ekstraksi berhasil. Pengirim: ${dataPesan.namaPanggilan}, Tipe: ${dataPesan.tipePesan}`);

    // 3. FILTERING KEAMANAN
    if (!passesFilter(msg, dataPesan.idChat)) {
      console.log("🛑 [Processor] Berhenti: Ditolak oleh Filter (Cek config.ts BOT_RULES)");
      return;
    }
    
    // 4. CEK SPAM/MEMORI
    if (memoryManager.isMessageProcessed(dataPesan.idPesan)) {
      console.log("🛑 [Processor] Berhenti: Pesan ini sudah pernah diproses sebelumnya (Duplikat)");
      return;
    }

    // 5. FILTER JENIS PESAN
    if (dataPesan.tipePesan !== 'chat' || !dataPesan.teks) {
      console.log(`🛑 [Processor] Berhenti: Bukan teks biasa atau teks kosong. (Tipe: ${dataPesan.tipePesan})`);
      return; 
    }

    console.log(`✅ [Processor] LOLOS SEMUA FILTER! Menyerahkan pesan dari ${dataPesan.namaPanggilan} ke Stitcher...`);

    // 6. LEMPAR KE STITCHER
    addMessageToStitcher(dataPesan);

  } catch (err) {
    console.error("❌ Error di Processor:", err);
  }
}