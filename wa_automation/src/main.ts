// src/main.ts
//
// Entry point aplikasi wa_automation.
// File ini adalah titik masuk yang dipanggil oleh Vite saat build.
// Tugasnya SATU: memulai aplikasi. Tidak ada logika di sini.
//
// Catatan: `void` digunakan untuk secara eksplisit mengabaikan Promise
// yang dikembalikan oleh startApp(). Ini adalah pola standar untuk
// top-level async call di lingkungan browser/userscript.

import { startApp } from './startApp';

void startApp();