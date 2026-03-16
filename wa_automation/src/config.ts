export const CONFIG = {
  GROQ_API_KEY: import.meta.env.VITE_GROQ_API_KEY || "",
  GROQ_BASE_URL: "https://api.groq.com/openai/v1",
  GROQ_MODEL: "meta-llama/llama-4-scout-17b-16e-instruct",
  MAX_HISTORY: 10,
};

// Global State
export const STATE = {
  botAktif: false,
};

// 🆕 ATURAN RESPON BOT (FILTERING)
export const BOT_RULES = {
  respondToSelf: false,       // Ubah ke true jika ingin bot membalas pesan yang kamu ketik sendiri
  respondToGroups: false,     // Ubah ke true jika ingin bot aktif di grup
  respondToStatus: false,     // Ubah ke true jika ingin bot bisa membalas status/story WA
  
  // Whitelist: Jika diisi, bot HANYA akan membalas ID yang ada di dalam array ini.
  // Kosongkan array [] jika ingin bot membalas semua orang/grup.
  // Contoh ID Pribadi: '628123456789@c.us'
  // Contoh ID Grup: '1234567890-1234@g.us'
  whitelistNumbers: [] as string[], 
  whitelistGroups: [] as string[],  
};