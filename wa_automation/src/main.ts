// import wpp
import { getWPP } from './core/wpp/instance';
import { injectWajs } from './core/wpp/injector';

import { setupMessageListener } from './services/receiver/listener';
import { injectSidebarUI } from './ui/sidebar';


async function start() {
  console.log("[START] WA AUTOMATION")

  await injectWajs();
  
  const wppCheckInterval = setInterval(() => {
    const WPP = getWPP();
    if (WPP && WPP.isReady) {
      clearInterval(wppCheckInterval);
      console.log('✅ WPP Ready! Menjalankan services...');
      
      // Nyalain UI & Router Pesan
      injectSidebarUI();
      setupMessageListener();
    }
  }, 1000);
}

start();