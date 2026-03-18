// src/core/wpp/instance.ts
//
// Satu-satunya tempat yang boleh mengakses objek WPP dari window browser.
// Semua file lain yang butuh WPP harus memanggil getWPP() dari sini,
// bukan mengakses (window as any).WPP langsung.

// Tipe minimal untuk WPP — hanya properti yang kita pakai di project ini.
// Kita tidak mendefinisikan semua API WPPConnect (terlalu banyak),
// cukup yang kita butuhkan agar TypeScript bisa membantu kita.
export interface WPPInstance {
  isReady: boolean;
  on: (event: string, callback: (msg: any) => void) => void;
  chat: {
    markIsRead: (chatId: string) => Promise<void>;
    markIsComposing: (chatId: string, duration: number) => Promise<void>;
    sendTextMessage: (to: string, text: string, options?: object) => Promise<void>;
    getMessageById: (msgId: string) => Promise<any>;
    getActiveChat: () => Promise<any>;
  };
}

// Deklarasi ke TypeScript bahwa window punya properti WPP.
// Ini cara yang benar — lebih baik dari (window as any).WPP.
declare global {
  interface Window {
    WPP?: WPPInstance;
  }
}

export function getWPP(): WPPInstance | undefined {
  return window.WPP;
}