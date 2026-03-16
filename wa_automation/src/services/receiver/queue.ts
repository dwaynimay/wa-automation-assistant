// File: src/services/receiver/queue.ts
import { MessageData } from '../../types';
import { routeMessage } from './router';

// Array untuk menyimpan antrean pesan
const messageQueue: MessageData[] = [];
let isProcessing = false;

// Memori untuk mencatat kapan terakhir kali seseorang diproses (Anti-Spam)
const lastProcessedTime = new Map<string, number>();
const COOLDOWN_MS = 5000; // Cooldown 5 detik per orang

export async function enqueueMessage(data: MessageData) {
  const now = Date.now();
  const lastTime = lastProcessedTime.get(data.idChat) || 0;

  // 🛡️ SISTEM ANTI-SPAM
  if (now - lastTime < COOLDOWN_MS) {
    console.log(`⏳ [Anti-Spam] Mengabaikan spam dari ${data.namaPanggilan}`);
    return; // Buang pesannya, jangan dimasukkan antrean!
  }

  // Jika lolos anti-spam, masukkan ke ujung antrean
  messageQueue.push(data);
  console.log(`📥 [Queue] Antrean bertambah. Sisa antrean: ${messageQueue.length}`);
  
  // Panggil pemroses antrean
  processQueue();
}

// Mesin Pemroses Antrean
async function processQueue() {
  // Kalau mesin sedang sibuk memproses pesan lain, atau antrean kosong, diam saja
  if (isProcessing || messageQueue.length === 0) return;
  
  isProcessing = true; // Kunci pintunya, mesin mulai bekerja

  while (messageQueue.length > 0) {
    const data = messageQueue.shift(); // Ambil antrean paling depan
    
    if (data) {
      // Catat waktu proses ini agar orangnya terkena cooldown
      lastProcessedTime.set(data.idChat, Date.now());

      try {
        console.log(`🚀 [Memproses] Teks dari ${data.namaPanggilan}: \n"${data.teks}"`);
        // Tunggu sampai AI atau Command selesai membalas
        await routeMessage(data.teks, data.idChat, data.idPesan, data.namaPanggilan);
      } catch (e) {
        console.error("❌ [Queue Error]:", e);
      }
    }
  }

  isProcessing = false; // Buka pintunya lagi kalau antrean sudah habis
}