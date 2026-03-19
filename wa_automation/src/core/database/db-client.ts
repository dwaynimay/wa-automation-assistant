// src/core/database/db-client.ts
//
// Klien untuk berkomunikasi dengan Python backend (server.py).
// Semua operasi database dari sisi browser dilakukan di sini.
// Menggunakan GM_xmlhttpRequest karena app ini berjalan sebagai
// userscript yang membutuhkan bypass CORS.
//
// ARSITEKTUR:
// Browser tidak bisa mengakses SQLite langsung.
// Solusinya: browser kirim data via HTTP ke Python server lokal,
// lalu Python yang menulis ke file bot_memory.db di laptop.

import { GM_xmlhttpRequest } from 'vite-plugin-monkey/dist/client';
import type {
  IContact,
  IChat,
  IMessage,
  UpsertContactPayload,
  UpsertChatPayload,
  SaveMessagePayload,
} from '../../shared/types/database.types';

const DB_API_URL = 'http://127.0.0.1:5000';

// ─── Helper Internal ──────────────────────────────────────────────────────────

/**
 * Bungkus GM_xmlhttpRequest menjadi Promise yang bisa di-await.
 * Selalu resolve (tidak pernah reject) agar kegagalan DB
 * tidak menghentikan alur utama bot.
 */
function postToBackend<T = void>(
  endpoint: string,
  data: object,
): Promise<T | null> {
  return new Promise((resolve) => {
    GM_xmlhttpRequest({
      method: 'POST',
      url: `${DB_API_URL}${endpoint}`,
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify(data),
      timeout: 5_000,

      onload: (res) => {
        if (res.status === 200) {
          try {
            resolve(JSON.parse(res.responseText) as T);
          } catch {
            resolve(null);
          }
        } else {
          console.warn(
            `[DB Client] Respons tidak OK dari ${endpoint}: ${res.status}`,
          );
          resolve(null);
        }
      },

      onerror: () => {
        console.error(
          `[DB Client] Gagal terhubung ke Python server di ${DB_API_URL}.\n` +
            `Pastikan backend/server.py sudah berjalan: npm run dev:python`,
        );
        resolve(null);
      },

      ontimeout: () => {
        console.warn(
          `[DB Client] Timeout menghubungi ${endpoint}. Server mungkin lambat.`,
        );
        resolve(null);
      },
    });
  });
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const dbManager = {
  // ── Contacts ───────────────────────────────────────────────────────────────

  /**
   * Simpan atau perbarui profil kontak.
   * Jika JID sudah ada → hanya update pushname.
   */
  async upsertContact(payload: UpsertContactPayload): Promise<void> {
    await postToBackend('/upsert_contact', payload);
    console.log(
      `[DB Client] Kontak tersimpan: ${payload.pushname} (${payload.jid})`,
    );
  },

  /**
   * Ambil data kontak berdasarkan JID.
   * Mengembalikan null jika kontak tidak ditemukan.
   */
  async getContact(jid: string): Promise<IContact | null> {
    return postToBackend<IContact>('/get_contact', { jid });
  },

  /**
   * Set status whitelist untuk satu kontak.
   * 1 = AI aktif membalas, 0 = bot hanya merekam diam-diam.
   */
  async setWhitelist(jid: string, is_whitelist: 0 | 1): Promise<void> {
    await postToBackend('/set_whitelist', { jid, is_whitelist });
    console.log(
      `[DB Client] Whitelist kontak ${jid} diset ke: ${is_whitelist}`,
    );
  },

  // ── Chats ──────────────────────────────────────────────────────────────────

  /**
   * Simpan atau perbarui metadata ruang obrolan.
   */
  async upsertChat(payload: UpsertChatPayload): Promise<void> {
    await postToBackend('/upsert_chat', payload);
  },

  /**
   * Toggle status bot per room (aktif/nonaktif).
   */
  async setBotActive(chat_jid: string, is_bot_active: 0 | 1): Promise<void> {
    await postToBackend('/set_bot_active', { chat_jid, is_bot_active });
    console.log(
      `[DB Client] Status bot di ${chat_jid} diset ke: ${is_bot_active}`,
    );
  },

  /**
   * Cek apakah bot aktif di room tertentu.
   * Default true jika room belum terdaftar di database.
   */
  async isBotActive(chat_jid: string): Promise<boolean> {
    const result = await postToBackend<{ is_bot_active: number }>(
      '/get_bot_active',
      { chat_jid },
    );
    return result?.is_bot_active !== 0; // default true
  },

  // ── Messages ───────────────────────────────────────────────────────────────

  /**
   * Simpan satu pesan ke riwayat percakapan.
   * Menggunakan INSERT OR IGNORE agar tidak ada duplikat.
   */
  async saveMessage(payload: SaveMessagePayload): Promise<void> {
    await postToBackend('/save_message', payload);
    console.log(
      `[DB Client] Pesan tersimpan: [${payload.role}] ${String(payload.content ?? '').substring(0, 30)}...`,
    );
  },

  /**
   * Ambil N pesan terakhir dari satu chat.
   * Dipakai oleh sistem RAG untuk membangun konteks percakapan.
   */
  async getRecentMessages(chat_jid: string, limit = 20): Promise<IMessage[]> {
    const result = await postToBackend<{ messages: IMessage[] }>(
      '/get_messages',
      { chat_jid, limit },
    );
    return result?.messages ?? [];
  },

  // ── Chat ──────────────────────────────────────────────────────────────────

  async getChat(chat_jid: string): Promise<IChat | null> {
    return postToBackend<IChat>('/get_chat', { chat_jid });
  },
};
