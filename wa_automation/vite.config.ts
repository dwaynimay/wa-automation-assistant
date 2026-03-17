import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

export default defineConfig({
  plugins: [
    monkey({
      entry: 'src/main.ts',
      userscript: {
        name: 'WA Automation',
        namespace: 'npm/vite-plugin-monkey',
        match: ['https://web.whatsapp.com/*'],
        grant: ['unsafeWindow', 'GM_xmlhttpRequest'], // Pastikan GM_xmlhttpRequest ada di sini
        connect: [
          'api.groq.com',
          'lite.duckduckgo.com',
          'localhost',
          '127.0.0.1'
        ]
      },
    }),
  ],
});