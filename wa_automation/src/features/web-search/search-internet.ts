// src/features/web-search/search-internet.ts
//
// Melakukan pencarian ke DuckDuckGo Lite dan mengembalikan hasil sebagai string.
// Dipanggil oleh ai-assistant saat AI membutuhkan informasi terkini.
// Menggunakan GM_xmlhttpRequest untuk bypass CORS (fitur userscript).

import { GM_xmlhttpRequest } from 'vite-plugin-monkey/dist/client';

export function searchInternet(query: string): Promise<string> {
  return new Promise((resolve) => {
    console.log(`[WebSearch] Mencari: "${query}"...`);

    GM_xmlhttpRequest({
      method: 'POST',
      url: 'https://lite.duckduckgo.com/lite/',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      data: `q=${encodeURIComponent(query)}`,

      onload(response) {
        try {
          const parser = new DOMParser();
          const doc = parser.parseFromString(
            response.responseText,
            'text/html',
          );

          const links = doc.querySelectorAll('.result-link');
          const snippets = doc.querySelectorAll('.result-snippet');
          const results: string[] = [];

          if (links.length > 0) {
            const batas = Math.min(3, links.length);
            for (let i = 0; i < batas; i++) {
              const title = links[i].textContent?.trim() ?? 'Tanpa Judul';
              const snippet =
                snippets[i]?.textContent?.trim() ?? 'Tidak ada detail.';

              // Dekode URL tracking DuckDuckGo ke URL asli
              let url = links[i].getAttribute('href') ?? 'Link tidak diketahui';
              if (url.includes('uddg=')) {
                try {
                  url = decodeURIComponent(url.split('uddg=')[1].split('&')[0]);
                } catch {
                  /* biarkan url apa adanya */
                }
              }

              results.push(`Judul: ${title}\nInfo: ${snippet}\nLink: ${url}`);
            }
          } else {
            // Fallback: ambil teks mentah halaman jika tidak ada hasil terstruktur
            const teksHalaman = doc.body.innerText.replace(/\s+/g, ' ').trim();
            results.push(
              `Info Mentah: ${teksHalaman.substring(0, 1000)}\nLink: https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
            );
          }

          const finalResult = results.join('\n\n');
          console.log('[WebSearch] Hasil ditemukan.');
          resolve(finalResult);
        } catch (e) {
          console.error('[WebSearch] Gagal parsing hasil:', e);
          resolve('Gagal membaca hasil pencarian web.');
        }
      },

      onerror: () => resolve('Koneksi ke internet terputus saat mencari.'),
    });
  });
}
