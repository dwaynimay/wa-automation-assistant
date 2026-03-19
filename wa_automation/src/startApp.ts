// src/startApp.ts
//
// Orkestrator utama aplikasi.
// Bertanggung jawab menjalankan semua tahap inisialisasi secara berurutan:
//   1. Validasi konfigurasi (paling awal — gagal cepat jika config salah)
//   2. Inject library WPPConnect ke halaman WhatsApp Web
//   3. Tunggu hingga WPP benar-benar siap
//   4. Jalankan semua services dan UI

import { validateAppConfig } from './config'; // ✅
import { getWPP, injectWajs } from './core/wpp'; // ✅
import { setupMessageListener } from './services/receiver'; // ✅
import { setupShortcuts } from './features/cek-jid'; // ✅ aktif kembali
import { injectSidebarUi } from './ui'; // ✅
import { WPP_READY_POLL_INTERVAL_MS } from './shared/constants'; // ✅ dari shared

export async function startApp(): Promise<void> {
  try {
    logStartupBanner();

    // Tahap 1: Validasi config — gagal cepat (fail fast)
    // Jika API key salah, langsung lempar error. Tidak ada gunanya lanjut.
    validateAppConfig();

    // Tahap 2: Suntikkan library WPPConnect ke halaman WhatsApp Web
    await injectWajs();

    // Tahap 3: Tunggu hingga WPP selesai menginisialisasi dirinya
    await waitForWppReady();

    // Tahap 4: Semua siap — jalankan services dan UI
    startServices();
  } catch (error: unknown) {
    // Tampilkan pesan error yang informatif berdasarkan jenisnya
    if (error instanceof Error) {
      console.error(
        `❌ [startApp] Gagal menjalankan aplikasi: ${error.message}`,
      );
    } else {
      console.error('❌ [startApp] Terjadi error tidak dikenal:', error);
    }
  }
}

// ─── Fungsi-fungsi pembantu (private — hanya dipakai di file ini) ────────────

function logStartupBanner(): void {
  console.log('╔════════════════════════════════════════╗');
  console.log('║    WhatsApp Automation Assistant       ║');
  console.log('║    Status: Starting up...              ║');
  console.log('╚════════════════════════════════════════╝');
}

function waitForWppReady(): Promise<void> {
  return new Promise((resolve) => {
    // Polling setiap WPP_READY_POLL_INTERVAL_MS milidetik
    // sampai WPP melaporkan dirinya sudah siap (isReady = true)
    const intervalId = window.setInterval(() => {
      const WPP = getWPP();

      if (WPP?.isReady) {
        window.clearInterval(intervalId);
        console.log('✅ [startApp] WPP siap! Melanjutkan ke startServices...');
        resolve();
      }
    }, WPP_READY_POLL_INTERVAL_MS);
  });
}

function startServices(): void {
  // Urutan pemanggilan di sini penting:
  // 1. UI dulu — agar tombol toggle sudah ada sebelum user berinteraksi
  // 2. Listener pesan — bot mulai mendengarkan
  // 3. Shortcut keyboard — fitur developer
  injectSidebarUi();
  setupMessageListener();
  setupShortcuts();

  console.log('🚀 [startApp] Semua services aktif. Bot siap digunakan!');
}
