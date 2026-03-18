// File: src/core/groq.ts
import { GM_xmlhttpRequest } from 'vite-plugin-monkey/dist/client';
import { appConfig } from '../config';

export async function fetchGroqAPI(payload: any): Promise<any> {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: 'POST',
      url: `${appConfig.groqBaseUrl}/chat/completions`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${appConfig.groqApiKey}`,
      },
      data: JSON.stringify(payload),
      timeout: 30000,
      onload: (res) => {
        if (res.status !== 200) {
          // 👇 KITA BONGKAR ALASAN ERROR DARI GROQ DI SINI
          let errorDetail = res.responseText;
          try {
            const errObj = JSON.parse(res.responseText);
            if (errObj.error && errObj.error.message) {
              errorDetail = errObj.error.message;
            }
          } catch {}

          console.error(`❌ [GROQ 400 ERROR]: ${errorDetail}`);
          reject(`API Error ${res.status}: ${errorDetail}`);
          return;
        }

        try {
          resolve(JSON.parse(res.responseText));
        } catch (e) {
          reject('Gagal parse response dari Groq');
        }
      },
      onerror: () => reject('Koneksi ke server Groq terputus'),
      ontimeout: () => reject('Request timeout'),
    });
  });
}
