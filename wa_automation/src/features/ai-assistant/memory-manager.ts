// src/features/ai-assistant/memory-manager.ts
//
// Mengelola riwayat percakapan per chat (short-term memory bot).
// Setiap idChat punya array ChatMessage-nya sendiri.
// Jika history melebihi batas maxHistory, pesan terlama dihapus otomatis.
//
// CATATAN: Ini adalah in-memory storage — data hilang saat tab di-refresh.
// Untuk persistensi, nanti bisa diganti dengan database.

import type { ChatMessage } from '../../shared/types'; // ✅
import { appConfig }        from '../../config';        // ✅

// Penyimpanan percakapan: key = idChat, value = array pesan
const chatMemory: Record<string, ChatMessage[]> = {};

// Set untuk melacak msgId yang sudah diproses (mencegah pesan diproses dua kali)
const processedMessageIds = new Set<string>();

export const memoryManager = {

  // Ambil riwayat percakapan untuk satu chat (buat array kosong jika belum ada)
  getHistory(chatId: string): ChatMessage[] {
    if (!chatMemory[chatId]) {
      chatMemory[chatId] = [];
    }
    return chatMemory[chatId];
  },

  // Tambahkan pesan baru ke riwayat — potong jika melewati batas maxHistory
  addMessage(chatId: string, message: ChatMessage): void {
    const history = this.getHistory(chatId);
    history.push(message);

    if (history.length > appConfig.maxHistory) {
      // Potong dari depan, pertahankan pesan terbaru saja
      chatMemory[chatId] = history.slice(-appConfig.maxHistory);
    }
  },

  // Hapus pesan terakhir — dipakai saat AI error agar history tidak kotor
  removeLastMessage(chatId: string): void {
    chatMemory[chatId]?.pop();
  },

  // Cek apakah msgId sudah pernah diproses sebelumnya (idempoten)
  isMessageProcessed(msgId: string): boolean {
    if (processedMessageIds.has(msgId)) return true;
    processedMessageIds.add(msgId);
    return false;
  },
};