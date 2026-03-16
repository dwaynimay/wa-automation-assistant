/**
 * MAIN ENTRY POINT
 *
 * File ini adalah titik masuk utama dari userscript.
 * Bertugas untuk:
 *
 * - Inisialisasi sistem
 * - Load konfigurasi
 * - Menghubungkan semua module
 * - Menjalankan automation
 *
 */

import { CONFIG } from './config';
import { injectWajs, getWPP } from './core/wpp';
import { setupMessageHandler } from './services/message-handler';
import { injectSidebarUI } from './ui/sidebar';

async function start() {
  console.log("🚀 ========================================");
  console.log("🚀 Memulai Groq WhatsApp Bot Modular");
  console.log("🚀 ========================================");
  
  if (CONFIG.GROQ_API_KEY.includes("YOUR_API_KEY")) {
    console.error('❌ FATAL: Ganti GROQ_API_KEY di src/config.ts');
    return;
  }

  await injectWajs();
  
  const wppCheckInterval = setInterval(() => {
    const WPP = getWPP();
    if (WPP && WPP.isReady) {
      clearInterval(wppCheckInterval);
      console.log('✅ WPP Ready! Menjalankan services...');
      
      // Nyalain UI & Router Pesan
      injectSidebarUI();
      setupMessageHandler();
    }
  }, 1000);
}

// Eksekusi jalanin bot
start();