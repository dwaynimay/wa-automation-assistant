import { CONFIG } from './config';
import { getWPP } from './core/wpp/instance';
import { injectWajs } from './core/wpp/injector';
import { injectSidebarUI } from './ui/sidebar';
import { setupMessageListener } from './services/receiver/listener';

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
      
      injectSidebarUI();
      setupMessageListener(); 

      // ==========================================
      // 🔍 FITUR SHORTCUT CEK JID (ALT + C)
      // ==========================================
      window.addEventListener('keydown', async (e) => {
        // Jika user menekan kombinasi Alt + C di keyboard
        if (e.altKey && e.key.toLowerCase() === 'c') {
          try {
            const activeChat = await WPP.chat.getActiveChat();
            
            if (activeChat) {
              // Ambil ID-nya
              const jid = activeChat.id._serialized || activeChat.id;
              const nama = activeChat.name || "Tidak diketahui";
              
              // Tampilkan pop-up prompt bawaan browser supaya teksnya bisa langsung di-copy
              window.prompt(`🔑 ID milik [${nama}]:\nSilakan copy teks di bawah ini:`, jid);
            } else {
              alert("Buka dulu obrolan orang atau grupnya di layar, baru tekan Alt + C!");
            }
          } catch (err) {
            console.error("Gagal mengambil JID:", err);
          }
        }
      });
      // ==========================================

    }
  }, 1000);
}

start();