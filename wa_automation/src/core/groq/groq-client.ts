// src/core/groq/groq-client.ts
//
// Satu-satunya tempat yang boleh berkomunikasi dengan Groq API.
// Menggunakan GM_xmlhttpRequest karena app ini berjalan sebagai
// userscript yang membutuhkan bypass CORS.

import { GM_xmlhttpRequest } from 'vite-plugin-monkey/dist/client';
import { appConfig } from '../../config';

// Tipe untuk payload yang dikirim ke Groq API
export interface GroqPayload {
  model: string;
  messages: object[];
  tools?: object[];
  tool_choice?: string | object;
  temperature?: number;
  max_tokens?: number;
}

// Tipe untuk response yang dikembalikan Groq API
// src/core/groq/groq-client.ts

export interface GroqResponse {
  choices: Array<{
    message: {
      // ← Ubah 'string' menjadi union type yang sama dengan ChatMessage
      role: 'system' | 'user' | 'assistant' | 'tool';
      content: string | null;
      tool_calls?: Array<{
        id: string;
        type: 'function';
        function: { name: string; arguments: string };
      }>;
    };
  }>;
}

export async function fetchGroqApi(payload: GroqPayload): Promise<GroqResponse> {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: 'POST',
      url: `${appConfig.groqBaseUrl}/chat/completions`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${appConfig.groqApiKey}`,
      },
      data: JSON.stringify(payload),
      timeout: 30_000,

      onload: (res) => {
        if (res.status !== 200) {
          // Coba ekstrak pesan error dari body response Groq
          let errorDetail = res.responseText;
          try {
            const errObj = JSON.parse(res.responseText);
            if (errObj?.error?.message) {
              errorDetail = errObj.error.message;
            }
          } catch { /* body bukan JSON, pakai responseText apa adanya */ }

          console.error(`[Groq Client] API Error ${res.status}: ${errorDetail}`);
          reject(new Error(`API Error ${res.status}: ${errorDetail}`));
          return;
        }

        try {
          resolve(JSON.parse(res.responseText) as GroqResponse);
        } catch {
          reject(new Error('[Groq Client] Gagal mem-parse response dari Groq.'));
        }
      },

      onerror: () => reject(new Error('[Groq Client] Koneksi ke server Groq terputus.')),
      ontimeout: () => reject(new Error('[Groq Client] Request timeout setelah 30 detik.')),
    });
  });
}