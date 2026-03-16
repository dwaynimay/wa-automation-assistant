/**
 * GLOBAL CONFIGURATION
 *
 * Semua konfigurasi project berada di sini.
 *
 * Contoh:
 * - API Key
 * - Feature toggle
 * - Delay automation
 * - Prompt AI
 * - Mode debug
 *
 * Tujuan:
 * Memudahkan developer mengubah perilaku bot tanpa mengubah banyak file.
 */

export const CONFIG = {
  GROQ_API_KEY: import.meta.env.VITE_GROQ_API_KEY || "",
  GROQ_BASE_URL: "https://api.groq.com/openai/v1",
  GROQ_MODEL: "llama-3.3-70b-versatile",
  MAX_HISTORY: 10,
};

// Global State
export const STATE = {
  botAktif: true,
};