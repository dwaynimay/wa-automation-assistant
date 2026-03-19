// src/config/app-config.ts

// Tipe eksplisit untuk konfigurasi aplikasi.
// Ini "kontrak" yang menjamin semua properti selalu ada dan bertipe benar.
export interface AppConfig {
  readonly groqApiKey: string;
  readonly groqBaseUrl: string;
  readonly groqModel: string;
  readonly maxHistory: number;
}

export const appConfig: AppConfig = {
  groqApiKey: import.meta.env.VITE_GROQ_API_KEY ?? '',
  groqBaseUrl: 'https://api.groq.com/openai/v1',
  groqModel: 'meta-llama/llama-4-scout-17b-16e-instruct',
  maxHistory: 10,
} as const;
