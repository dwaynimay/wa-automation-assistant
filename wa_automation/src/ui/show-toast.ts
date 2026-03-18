// src/ui/show-toast.ts
//
// Menampilkan notifikasi toast singkat di pojok kanan atas halaman.
// Toast otomatis menghilang setelah 2 detik.
//
// Tersedia dalam dua nama:
// - showToast()            → dipakai internal oleh UI layer
// - tampilkanNotifikasi()  → alias untuk features layer (nama konsisten)

export type ToastVariant = 'success' | 'error';

export function showToast(message: string, variant: ToastVariant): void {
  const TOAST_ID     = 'bot-toast-notif';
  const WARNA_BG     = variant === 'success' ? '#1DAA61' : '#f44336';
  const DURASI_MS    = 2_000;
  const FADE_MS      = 500;

  // Hapus toast yang mungkin masih tampil sebelum membuat yang baru
  document.getElementById(TOAST_ID)?.remove();

  const toast = document.createElement('div');
  toast.id       = TOAST_ID;
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${WARNA_BG};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    z-index: 10000;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    font-family: inherit;
    font-size: 14px;
    transition: opacity ${FADE_MS}ms ease;
  `;

  document.body.appendChild(toast);

  // Mulai animasi menghilang setelah DURASI_MS
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), FADE_MS);
  }, DURASI_MS);
}

// Alias dengan nama Indonesia — dipakai oleh features/cek-jid
// agar tidak perlu import showToast secara langsung dari luar layer ui/
export const tampilkanNotifikasi = showToast;