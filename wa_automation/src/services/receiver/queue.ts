// src/services/receiver/queue.ts
//
// Antrean pesan dengan sistem anti-spam bawaan.
// Memastikan pesan diproses satu per satu (tidak paralel)
// dan satu orang tidak bisa membanjiri bot dalam waktu singkat.

import type { MessageData } from '../../shared/types'; // ✅
import { ANTI_SPAM_COOLDOWN_MS } from '../../shared/constants'; // ✅
import { routeMessage } from './router';

const messageQueue: MessageData[] = [];
const lastProcessedTime = new Map<string, number>();
let isProcessing = false;

export async function enqueueMessage(data: MessageData): Promise<void> {
  const now = Date.now();
  const lastTime = lastProcessedTime.get(data.idChat) ?? 0;

  // Sistem anti-spam: abaikan jika orang ini baru saja diproses
  if (now - lastTime < ANTI_SPAM_COOLDOWN_MS) {
    console.log(
      `[Queue] Anti-spam aktif — mengabaikan pesan dari: ${data.namaPanggilan}`,
    );
    return;
  }

  messageQueue.push(data);
  console.log(`[Queue] Pesan masuk antrean. Total: ${messageQueue.length}`);

  // Mulai memproses antrean (jika belum berjalan)
  await drainQueue();
}

async function drainQueue(): Promise<void> {
  // Jika mesin sudah berjalan atau antrean kosong, tidak perlu melakukan apa-apa
  if (isProcessing || messageQueue.length === 0) return;

  isProcessing = true;

  while (messageQueue.length > 0) {
    const data = messageQueue.shift();
    if (!data) continue;

    // Catat waktu proses untuk mekanisme anti-spam
    lastProcessedTime.set(data.idChat, Date.now());

    try {
      console.log(`[Queue] Memproses pesan dari: ${data.namaPanggilan}`);
      await routeMessage(
        data.teks,
        data.idChat,
        data.idPesan,
        data.namaPanggilan,
        data.isReply,
        data.teksDibalas,
      );
    } catch (e) {
      console.error('[Queue] Error saat memproses pesan:', e);
    }
  }

  isProcessing = false;
}
