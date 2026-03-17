// File: src/core/database.ts
import { GM_xmlhttpRequest } from 'vite-plugin-monkey/dist/client';

const API_URL = 'http://127.0.0.1:5000';

export const dbManager = {
  
  async saveUser(jid: string, nama: string) {
    GM_xmlhttpRequest({
      method: "POST",
      url: `${API_URL}/save_user`,
      headers: { "Content-Type": "application/json" },
      data: JSON.stringify({ jid, nama }),
      onload: () => console.log(`👤 [DB] Profil ${nama} tersimpan di SQLite laptop!`),
      onerror: (err) => console.error("❌ [DB] Python Server tidak merespon (Pastikan server.py menyala):", err)
    });
  },

async saveMessage(msgId: string, jid: string, role: 'user' | 'bot' | 'owner', content: string) {
    console.log(`📡 [DB] Mengirim ke Python: ${role} - ${content.substring(0, 20)}...`);
    GM_xmlhttpRequest({
      method: "POST",
      url: `${API_URL}/save_message`,
      headers: { "Content-Type": "application/json" },
      data: JSON.stringify({ id: msgId, jid, role, content }),
      onload: () => console.log(`💾 [DB] Pesan ${role} berhasil direkam ke SQLite!`),
      onerror: (err) => console.error("❌ [DB] Gagal mengirim pesan ke Python:", err)
    });
  }
  
};