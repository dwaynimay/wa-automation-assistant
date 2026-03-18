/*
 * Sidebar UI Injector
 *
 * untuk menyisipkan tombol custom ke dalam sidebar whatsapp
 * sebagai toggle untk on/off bot auto reply
 *
 *  * Fitur:
 * - ✅ Inject tombol
 * - 🔁 Toggle state global (STATE.botAktif)
 * - 🔔 Toast notifikasi ringan
 *
 */
// File: src/ui/sidebar.ts
import { createToggleButton } from './button';

export function injectSidebarUI() {
  const cekInterval = setInterval(() => {
    // 1. Cari elemen patokan
    const metaAiBtn = document.querySelector(
      'button[aria-label="Meta AI"], button[aria-label="Komunitas"]',
    );

    if (metaAiBtn) {
      clearInterval(cekInterval);

      // 2. Cek apakah sudah terpasang
      if (document.getElementById('btn-groq-bot')) return;

      const spanTerluar = metaAiBtn.closest('span');
      if (!spanTerluar || !spanTerluar.parentElement) return;

      // 3. Ambil container induknya
      const btnContainerAsli = spanTerluar.parentElement;

      // 4. Minta file button.ts untuk membuatkan elemen baru
      const toggleButtonElement = createToggleButton(btnContainerAsli);

      // 5. Suntikkan ke layar WhatsApp
      if (toggleButtonElement) {
        btnContainerAsli.after(toggleButtonElement);
      }
    }
  }, 2000);
}
