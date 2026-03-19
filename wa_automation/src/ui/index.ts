// src/ui/index.ts
// Public API dari UI layer.
// Semua layer lain yang butuh UI harus import dari sini.

// Fungsi utama — menyuntikkan UI ke sidebar WhatsApp
export { injectSidebarUi } from './inject-sidebar-ui';

// Notifikasi toast — tersedia dalam dua nama
export { showToast } from './show-toast';
export { tampilkanNotifikasi } from './show-toast'; // alias untuk features layer

// Tipe yang mungkin berguna di layer lain
export type { ToastVariant } from './show-toast';
export type { ToggleButtonOptions } from './create-toggle-button';
