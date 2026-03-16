import { GM_xmlhttpRequest } from 'vite-plugin-monkey/dist/client';
import { CONFIG } from '../config';

export async function fetchGroqAPI(payload: any): Promise<any> {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: "POST",
      url: `${CONFIG.GROQ_BASE_URL}/chat/completions`,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${CONFIG.GROQ_API_KEY}`
      },
      data: JSON.stringify(payload),
      timeout: 30000,
      onload: (res) => {
        if (res.status !== 200) {
          reject(`API Error: ${res.status}`);
          return;
        }
        try {
          resolve(JSON.parse(res.responseText));
        } catch (e) {
          reject("Gagal parse response dari Groq");
        }
      },
      onerror: () => reject("Koneksi ke server Groq terputus"),
      ontimeout: () => reject("Request timeout"),
    });
  });
}