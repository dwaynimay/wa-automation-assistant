// src/core/database/db-client.ts
//
// Klien untuk berkomunikasi dengan Python backend (server.py).
// Semua operasi database dari sisi browser dilakukan di sini.
// Menggunakan GM_xmlhttpRequest untuk bypass CORS — wajib untuk userscript.
//
// CATATAN ARSITEKTUR:
// Browser tidak bisa mengakses SQLite secara langsung.
// Solusinya: browser mengirim data via HTTP ke server Python lokal,
// lalu Python yang menyimpan ke file SQLite di laptop.

import { GM_xmlhttpRequest } from 'vite-plugin-monkey/dist/client';

const DB_API_URL = 'http://127.0.0.1:5000';

// Tipe untuk role pengirim pesan
export type MessageRole = 'user' | 'bot' | 'owner';

// Tipe data yang dikirim ke endpoint /save_user
interface SaveUserPayload {
  jid: string;
  nama: string;
}

// Tipe data yang dikirim ke endpoint /save_message
interface SaveMessagePayload {
  id: string;
  jid: string;
  role: MessageRole;
  content: string;
}

// Helper internal: bungkus GM_xmlhttpRequest menjadi Promise
// agar bisa di-await dengan bersih dari processor
function postToBackend(endpoint: string, data: object): Promise<void> {
  return new Promise((resolve) => {
    GM_xmlhttpRequest({
      method: 'POST',
      url: `${DB_API_URL}${endpoint}`,
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify(data),
      timeout: 5_000,

      onload: (res) => {
        if (res.status === 200) {
          resolve();
        } else {
          console.warn(`[DB Client] Respons tidak OK dari ${endpoint}: ${res.status}`);
          resolve(); // tetap resolve agar tidak memblokir alur utama
        }
      },

      onerror: () => {
        console.error(
          `[DB Client] Gagal terhubung ke Python server di ${DB_API_URL}.\n` +
          `Pastikan backend/server.py sudah berjalan dengan: python backend/server.py`
        );
        resolve(); // tetap resolve — kegagalan DB tidak boleh menghentikan bot
      },

      ontimeout: () => {
        console.warn(`[DB Client] Timeout menghubungi ${endpoint}. Server mungkin lambat.`);
        resolve();
      },
    });
  });
}

export const dbManager = {

  // Simpan atau perbarui profil pengguna
  async saveUser(jid: string, nama: string): Promise<void> {
    const payload: SaveUserPayload = { jid, nama };
    await postToBackend('/save_user', payload);
    console.log(`[DB Client] Profil tersimpan: ${nama} (${jid})`);
  },

  // Simpan pesan ke riwayat percakapan
  async saveMessage(
    msgId: string,
    jid: string,
    role: MessageRole,
    content: string,
  ): Promise<void> {
    const payload: SaveMessagePayload = { id: msgId, jid, role, content };
    await postToBackend('/save_message', payload);
    console.log(`[DB Client] Pesan tersimpan: [${role}] ${content.substring(0, 30)}...`);
  },
};