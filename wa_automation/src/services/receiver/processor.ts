import { STATE } from '../../config';
import { memoryManager } from '../../core/memory';
import { extractMessageData } from './extractor';
import { passesFilter } from './filter';
import { addMessageToStitcher } from './stitcher'; // <-- Import Stitcher

export async function processIncomingMessage(msg: any) {
  try {
    if (!STATE.botAktif) return;

    const dataPesan = extractMessageData(msg);

    if (!passesFilter(msg, dataPesan.idChat)) return;
    if (memoryManager.isMessageProcessed(dataPesan.idPesan)) return;

    if (dataPesan.tipePesan !== 'chat' || !dataPesan.teks) {
      return; 
    }

    // ==========================================
    // BUKAN LAGI KE ROUTER, TAPI KE STITCHER
    // ==========================================
    // Biarkan si Penjahit menahan pesannya 3 detik barangkali orangnya nge-chat lagi
    addMessageToStitcher(dataPesan);

  } catch (err) {
    console.error("❌ Error di Processor:", err);
  }
}