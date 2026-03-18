// src/ui/create-toggle-button.ts
//
// Factory function yang membuat elemen tombol toggle bot.
// Mengkloning container tombol WhatsApp yang sudah ada (agar style-nya sama),
// lalu menggantinya dengan ikon dan behavior milik kita.

import { TOGGLE_BUTTON_ID, TOGGLE_BUTTON_ARIA_LABEL, TOGGLE_BUTTON_TITLE } from './ui-constants';
import { replaceButtonIcon }       from './replace-button-icon';
import { showToast }               from './show-toast';
import { updateToggleButtonState } from './update-toggle-button-state';

// Tipe opsi untuk pembuatan tombol — diekspor agar bisa dipakai
// jika nanti ada tombol lain yang perlu dibuat dengan pola serupa
export interface ToggleButtonOptions {
  isActive: boolean;
  onToggle: () => boolean; // dipanggil saat klik, mengembalikan state baru
}

export function createToggleButton(
  originalContainer: HTMLElement,
  options: ToggleButtonOptions,
): HTMLElement | null {

  // Klon container asli agar mewarisi semua class dan style WhatsApp
  const cloneContainer = originalContainer.cloneNode(true) as HTMLElement;
  const button         = cloneContainer.querySelector('button');

  // Guard: pastikan ada elemen button di dalam container
  if (!(button instanceof HTMLButtonElement)) {
    console.warn('[UI] Tidak menemukan elemen <button> di dalam container.');
    return null;
  }

  // Set identitas tombol
  button.id = TOGGLE_BUTTON_ID;
  button.setAttribute('aria-label', TOGGLE_BUTTON_ARIA_LABEL);
  button.setAttribute('title', TOGGLE_BUTTON_TITLE);

  // Terapkan tampilan awal
  replaceButtonIcon(button);
  updateToggleButtonState(button, options.isActive);

  // Handler klik — toggle state dan perbarui tampilan
  button.onclick = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const nextIsActive = options.onToggle();
    updateToggleButtonState(button, nextIsActive);
    showToast(
      nextIsActive ? 'Bot Aktif ✓' : 'Bot Nonaktif',
      nextIsActive ? 'success' : 'error',
    );
  };

  return cloneContainer;
}