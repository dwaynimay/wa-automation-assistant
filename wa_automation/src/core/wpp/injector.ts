// src/core/wpp/injector.ts
//
// Bertugas menyuntikkan library WPPConnect ke halaman WhatsApp Web.
// Dipanggil SATU KALI saat aplikasi pertama kali start.

import { getWPP } from './instance';

const WPP_CDN_URL =
  'https://cdn.jsdelivr.net/npm/@wppconnect/wa-js@latest/dist/wppconnect-wa.js';

export function injectWajs(): Promise<void> {
  return new Promise((resolve) => {
    // Jika WPP sudah tersedia (misal karena di-reload), langsung lanjut
    if (getWPP()) {
      console.log('[WPP Injector] Library sudah tersedia, skip injeksi.');
      return resolve();
    }

    console.log('[WPP Injector] Menyuntikkan library WPPConnect...');

    const script = document.createElement('script');
    script.src = WPP_CDN_URL;
    script.async = true;

    script.onload = () => {
      console.log('[WPP Injector] Library berhasil dimuat.');
      resolve();
    };

    script.onerror = () => {
      // Kita resolve (bukan reject) agar app tetap lanjut,
      // tapi kita log error agar mudah di-debug.
      console.error('[WPP Injector] Gagal memuat library dari CDN. Cek koneksi internet.');
      resolve();
    };

    document.documentElement.appendChild(script);
  });
}