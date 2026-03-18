// src/config/runtime-state.ts
//
// ⚠️  PERHATIAN: File ini berbeda dari file config lainnya.
//
// appConfig dan botRules adalah STATIS (tidak berubah setelah app start).
// runtimeState adalah DINAMIS — nilainya berubah selama bot berjalan.
//
// Aturan penggunaan:
// - Hanya boleh DIBACA dari luar config/
// - Hanya boleh DIUBAH oleh layer Services (receiver/router)

// Tipe eksplisit untuk state runtime bot
export interface RuntimeState {
  isBotActive: boolean;
  lastBotText: string;
}

// State awal saat aplikasi baru dimulai
export const runtimeState: RuntimeState = {
  isBotActive: false,
  lastBotText: '',
};