import { appConfig, validateAppConfig } from './config';
import { getWPP, injectWajs } from './core/wpp';
// import { setupShortcuts } from './features/cek-jid';
import { setupMessageListener } from './services/receiver';
import { injectSidebarUi } from './ui';

const WPP_READY_POLL_INTERVAL_MS = 1000;

export async function startApp(): Promise<void> {
  try {
    logStartupBanner();
    validateConfig();

    await injectWajs();
    await waitForWppReady();

    startServices();
  } catch (error) {
    console.error('❌ Gagal menjalankan aplikasi:', error);
  }
}

function logStartupBanner(): void {
  console.log('========================================');
  console.log('Memulai WhatsApp Automation Assistant');
  console.log('========================================');
}

function validateConfig(): void {
  if (appConfig.groqApiKey.includes('YOUR_API_KEY')) {
    throw new Error('Ganti GROQ_API_KEY di src/config.ts');
  }
}

function waitForWppReady(): Promise<void> {
  return new Promise((resolve) => {
    const intervalId = window.setInterval(() => {
      const WPP = getWPP();

      if (WPP?.isReady) {
        window.clearInterval(intervalId);
        console.log('✅ WPP Ready! Menjalankan services...');
        resolve();
      }
    }, WPP_READY_POLL_INTERVAL_MS);
  });
}

function startServices(): void {
  injectSidebarUi();
  validateAppConfig();
  setupMessageListener();
//   setupShortcuts();
}