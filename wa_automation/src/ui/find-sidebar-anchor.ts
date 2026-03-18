// src/ui/find-sidebar-anchor.ts
//
// Mencari tombol anchor di sidebar WhatsApp yang akan dijadikan
// titik penyisipan tombol toggle bot kita.
// Mengembalikan null jika belum ditemukan (sidebar belum dimuat).

import { SIDEBAR_ANCHOR_SELECTOR } from './ui-constants';

export function findSidebarAnchor(): HTMLButtonElement | null {
  const anchor = document.querySelector(SIDEBAR_ANCHOR_SELECTOR);
  return anchor instanceof HTMLButtonElement ? anchor : null;
}