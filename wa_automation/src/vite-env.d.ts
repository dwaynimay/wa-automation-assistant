/// <reference types="vite/client" />
/// <reference types="vite-plugin-monkey/client" />
//// <reference types="vite-plugin-monkey/global" />
/// <reference types="vite-plugin-monkey/style" />

interface ImportMetaEnv {
  readonly VITE_GROQ_API_KEY: string;
  // Kalau nanti ada env lain, tambahin di sini
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}