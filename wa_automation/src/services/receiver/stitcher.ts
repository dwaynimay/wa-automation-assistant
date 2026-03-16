// File: src/services/receiver/stitcher.ts
import { MessageData } from '../../types';
import { enqueueMessage } from './queue'; // Kita akan buat file queue.ts setelah ini

// Menyimpan penampungan pesan (buffer) dan timer untuk setiap orang
const stitchBuffers = new Map<string, { data: MessageData, timer: ReturnType<typeof setTimeout> }>();

export function addMessageToStitcher(data: MessageData) {
  const { idChat } = data;

  if (stitchBuffers.has(idChat)) {
    // 1. JIKA OBROLAN MASIH GANTUNG (Orangnya nge-chat lagi sebelum 3 detik)
    const existing = stitchBuffers.get(idChat)!;
    
    // Gabungkan teks lama dengan teks baru (ditambah enter/baris baru)
    existing.data.teks += '\n' + data.teks; 
    
    // Batalkan timer lama, dan buat timer 3 detik baru dari awal
    clearTimeout(existing.timer);
    existing.timer = setTimeout(() => {
      finishStitching(idChat);
    }, 3000); 

    console.log(`🧵 [Stitcher] Menjahit pesan dari ${data.namaPanggilan}...`);
  } else {
    // 2. JIKA PESAN BARU
    const timer = setTimeout(() => {
      finishStitching(idChat);
    }, 3000); // Tunggu 3 detik

    stitchBuffers.set(idChat, { data, timer });
  }
}

// Fungsi ini dipanggil kalau sudah 3 detik orangnya tidak nge-chat lagi
function finishStitching(idChat: string) {
  const buffer = stitchBuffers.get(idChat);
  if (buffer) {
    stitchBuffers.delete(idChat); // Hapus dari memori penjahitan
    enqueueMessage(buffer.data);  // Lempar pesan yang sudah utuh ke Antrean
  }
}