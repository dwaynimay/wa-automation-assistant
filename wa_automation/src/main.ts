// File: src/main.ts
import { CONFIG } from './config';
import { getWPP, injectWajs } from './core/wpp';
import { injectSidebarUI } from './ui';
import { setupMessageListener } from './services/receiver';
import { setupShortcuts } from './features/cek-jid'; // Import fitur baru

async function start() {
  console.log('🚀 ========================================');
  console.log('🚀 Memulai Groq WhatsApp Bot Modular');
  console.log('🚀 ========================================');

  if (CONFIG.GROQ_API_KEY.includes('YOUR_API_KEY')) {
    console.error('❌ FATAL: Ganti GROQ_API_KEY di src/config.ts');
    return;
  }

  await injectWajs();

  const wppCheckInterval = setInterval(() => {
    const WPP = getWPP();
    if (WPP && WPP.isReady) {
      clearInterval(wppCheckInterval);
      console.log('✅ WPP Ready! Menjalankan services...');

      // Jalankan semua layanan
      injectSidebarUI();
      setupMessageListener();
      setupShortcuts(); // ⌨️ Aktifkan Shortcut Alt + C
    }
  }, 1000);
}

start();
