// File: src/features/web-search.ts
import { GM_xmlhttpRequest } from 'vite-plugin-monkey/dist/client';

export function searchInternet(query: string): Promise<string> {
  return new Promise((resolve) => {
    console.log(`🔎 [Web Search] DuckDuckGo mencari: "${query}"...`);

    GM_xmlhttpRequest({
      method: 'POST',
      url: 'https://lite.duckduckgo.com/lite/',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      data: 'q=' + encodeURIComponent(query),
      onload: function (response) {
        try {
          const parser = new DOMParser();
          const doc = parser.parseFromString(
            response.responseText,
            'text/html',
          );

          const hasilScrape: string[] = [];
          const results = doc.querySelectorAll('.result-link');
          const snippets = doc.querySelectorAll('.result-snippet');

          if (results.length > 0) {
            for (let i = 0; i < Math.min(3, results.length); i++) {
              let url =
                results[i].getAttribute('href') || 'Link tidak diketahui';
              const title = results[i].textContent?.trim() || 'Tanpa Judul';
              const snippet = snippets[i]
                ? snippets[i].textContent?.trim()
                : 'Tidak ada detail.';

              if (url && url.includes('uddg=')) {
                try {
                  url = decodeURIComponent(url.split('uddg=')[1].split('&')[0]);
                } catch (e) {}
              }

              hasilScrape.push(
                `Judul: ${title}\nInfo: ${snippet}\nLink: ${url}`,
              );
            }
          } else {
            const bodyText = doc.body.innerText.replace(/\s+/g, ' ').trim();
            const textPotong = bodyText.substring(0, 1000);
            hasilScrape.push(
              `Info Mentah: ${textPotong}\nLink: https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
            );
          }

          const finalResult = hasilScrape.join('\n\n');
          console.log('✅ [Data Internet Didapat]:\n', finalResult);
          resolve(finalResult);
        } catch (e) {
          console.error('❌ Gagal parsing DuckDuckGo:', e);
          resolve('Gagal membaca hasil pencarian web.');
        }
      },
      onerror: () => resolve('Koneksi ke internet terputus.'),
    });
  });
}
