// src/config/validate-app-config.ts
//
// Bertugas memvalidasi semua konfigurasi SEBELUM aplikasi dijalankan.
// Jika ada yang salah, lempar error supaya app tidak jalan setengah-setengah.

import { appConfig } from './app-config';

export function validateAppConfig(): void {
  const errors: string[] = [];

  // Cek apakah API key sudah diisi dan bukan placeholder
  if (!appConfig.groqApiKey) {
    errors.push('VITE_GROQ_API_KEY belum diisi di file .env');
  }

  if (appConfig.groqApiKey.includes('YOUR_API_KEY')) {
    errors.push(
      'VITE_GROQ_API_KEY masih berisi nilai placeholder. Ganti dengan API key asli.',
    );
  }

  // Jika ada error, tampilkan semua sekaligus (bukan satu per satu)
  if (errors.length > 0) {
    throw new Error(
      `❌ Konfigurasi tidak valid:\n${errors.map((e) => `  - ${e}`).join('\n')}`,
    );
  }

  console.log('✅ Konfigurasi valid.');
}
