// src/ui/ui-constants.ts
//
// Semua konstanta yang berkaitan dengan elemen DOM UI sidebar WhatsApp.
// Dikumpulkan di satu tempat agar mudah disesuaikan jika WhatsApp
// mengubah struktur HTML mereka.

// ID unik untuk tombol toggle bot — dipakai untuk cek apakah sudah terinject
export const TOGGLE_BUTTON_ID = 'botToggleButton';

// Label aksesibilitas tombol
export const TOGGLE_BUTTON_ARIA_LABEL = 'Toggle Auto Reply Bot';

// Tooltip yang muncul saat hover
export const TOGGLE_BUTTON_TITLE = 'Nyalakan atau matikan bot balas otomatis';

// CSS selector untuk mencari tombol anchor di sidebar WhatsApp
// Kita cari dua kandidat karena WhatsApp sering mengubah label tombolnya
export const SIDEBAR_ANCHOR_SELECTOR =
  'button[aria-label="Meta AI"], button[aria-label="Komunitas"]';

// Interval polling untuk menyuntikkan UI (milidetik)
// Kita polling karena sidebar WhatsApp bisa hilang/muncul secara dinamis
export const UI_INJECT_INTERVAL_MS = 2_000;
