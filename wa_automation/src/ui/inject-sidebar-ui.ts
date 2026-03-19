// src/ui/inject-sidebar-ui.ts
//
// Menyuntikkan tombol toggle bot ke sidebar WhatsApp.
// Menggunakan polling (setInterval) karena sidebar WhatsApp bersifat dinamis —
// elemen bisa belum ada saat pertama kali halaman dimuat.

import { runtimeState } from '../config'; // ✅
import { createToggleButton } from './create-toggle-button';
import { findSidebarAnchor } from './find-sidebar-anchor';
import { TOGGLE_BUTTON_ID, UI_INJECT_INTERVAL_MS } from './ui-constants';

export function injectSidebarUi(): void {
  const intervalId = window.setInterval(() => {
    // Langkah 1: Cari tombol anchor WhatsApp sebagai titik acuan
    const anchorButton = findSidebarAnchor();
    if (!anchorButton) return; // Belum ditemukan — coba lagi di interval berikutnya

    // Langkah 2: Jika tombol bot sudah ada, hentikan polling (tidak perlu inject ulang)
    if (document.getElementById(TOGGLE_BUTTON_ID)) {
      window.clearInterval(intervalId);
      return;
    }

    // Langkah 3: Cari container parent yang akan dijadikan template kloning
    const outerSpan = anchorButton.closest('span');
    const originalContainer = outerSpan?.parentElement;

    if (!(originalContainer instanceof HTMLElement)) return;

    // Langkah 4: Buat tombol toggle dan sisipkan setelah container asli
    const toggleButtonElement = createToggleButton(originalContainer, {
      isActive: runtimeState.isBotActive,
      onToggle: () => {
        runtimeState.isBotActive = !runtimeState.isBotActive;
        return runtimeState.isBotActive;
      },
    });

    if (!toggleButtonElement) return;

    originalContainer.after(toggleButtonElement);
    window.clearInterval(intervalId);

    console.log('[UI] Tombol toggle bot berhasil disuntikkan ke sidebar.');
  }, UI_INJECT_INTERVAL_MS);
}
