// src/services/receiver/stitcher.ts
//
// "Penjahit" pesan: menunggu beberapa detik setelah pesan masuk.
// Jika orang yang sama mengirim pesan lagi sebelum timer habis,
// kedua pesan digabung menjadi satu sebelum dikirim ke antrean.
// Ini membuat bot tidak membalas terburu-buru saat orang masih mengetik.

import type { MessageData } from '../../shared/types'; // ✅
import { STITCHER_WAIT_MS } from '../../shared/constants'; // ✅
import { enqueueMessage } from './queue';

interface StitchBuffer {
  data: MessageData;
  timer: ReturnType<typeof setTimeout>;
}

const stitchBuffers = new Map<string, StitchBuffer>();

export function addMessageToStitcher(data: MessageData): void {
  const { idChat } = data;

  if (stitchBuffers.has(idChat)) {
    // Orang yang sama kirim pesan lagi sebelum timer habis
    const existing = stitchBuffers.get(idChat)!;

    // Gabungkan teks — pisahkan dengan baris baru
    existing.data.teks += '\n' + data.teks;

    // Reset timer dari nol
    clearTimeout(existing.timer);
    existing.timer = setTimeout(
      () => finishStitching(idChat),
      STITCHER_WAIT_MS,
    );

    console.log(
      `[Stitcher] Pesan dari ${data.namaPanggilan} dijahit, timer di-reset.`,
    );
  } else {
    // Pesan pertama dari orang ini — mulai timer baru
    const timer = setTimeout(() => finishStitching(idChat), STITCHER_WAIT_MS);
    stitchBuffers.set(idChat, { data, timer });

    console.log(`[Stitcher] Buffer baru dibuat untuk: ${data.namaPanggilan}`);
  }
}

function finishStitching(idChat: string): void {
  const buffer = stitchBuffers.get(idChat);
  if (!buffer) return;

  stitchBuffers.delete(idChat);
  console.log(
    `[Stitcher] Timer habis, pesan dari ${buffer.data.namaPanggilan} dikirim ke queue.`,
  );
  enqueueMessage(buffer.data);
}
