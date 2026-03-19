// src/core/wpp/index.ts
// Public API dari modul wpp.
// Ekspor tipe WPPInstance juga agar layer lain bisa pakai tanpa import silang.

export type { WPPInstance } from './instance';
export { getWPP } from './instance';
export { injectWajs } from './injector';
export { sendHumanizedMessage } from './sender';
