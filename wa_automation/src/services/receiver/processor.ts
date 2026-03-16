import { STATE } from '../../config';
import { memoryManager } from '../../core/memory';
import { extractMessageData } from './extractor';
import { passesFilter } from './filter';
import { routeMessage } from './router';

export async function processIncomingMessage(msg: any) {
  try {
    // 1. CEK SAKLAR UTAMA
    // Jika bot dimatikan dari UI Sidebar, hentikan semua proses
    if (!STATE.botAktif) return;

    // 2. EKSTRAKSI DATA
    // Ubah data 'msg' yang rumit dari WhatsApp menjadi format 'MessageData' yang rapi
    const dataPesan = extractMessageData(msg);

    // 3. FILTERING & MEMORI
    // Cek apakah pesan ini boleh dibalas (bukan dari grup yang dilarang, dll)
    if (!passesFilter(msg, dataPesan.idChat)) return;
    
    // Cek apakah pesan ini sudah pernah diproses sebelumnya (mencegah spam/balas 2x)
    if (memoryManager.isMessageProcessed(dataPesan.idPesan)) return;

    // 4. FILTER JENIS PESAN
    // Bot kita saat ini hanya difokuskan untuk membalas pesan teks ('chat').
    // Abaikan jika isinya kosong atau berupa audio/video.
    if (dataPesan.tipePesan !== 'chat' || !dataPesan.teks) {
      return; 
    }

    // (Opsional) Tampilkan log di console agar kita tahu ada pesan masuk yang valid
    console.log(`📩 [Pesan Bersih] dari ${dataPesan.namaPanggilan}: "${dataPesan.teks}"`);

    // ==========================================
    // 💾 TEMPAT SIMPAN KE DATABASE (NANTINYA)
    // await saveToDatabase(dataPesan);
    // ==========================================

    // 5. LEMPAR KE ROUTER
    // Kirim data yang sudah bersih ke router untuk diputuskan: 
    // Apakah ini Command (!ping) atau ngobrol biasa dengan AI?
    await routeMessage(
      dataPesan.teks, 
      dataPesan.idChat, 
      dataPesan.idPesan, 
      dataPesan.namaPanggilan
    );

  } catch (err) {
    console.error("❌ Error di Processor:", err);
  }
}