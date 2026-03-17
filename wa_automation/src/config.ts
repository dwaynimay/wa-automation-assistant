// Fungsi pembantu untuk mengubah teks "nomor1, nomor2" menjadi array ["nomor1", "nomor2"]
function parseEnvArray(envString: string | undefined): string[] {
  if (!envString) return [];
  return envString
    .split(',')
    .map(item => item.trim()) // Hapus spasi yang tidak sengaja terketik
    .filter(item => item.length > 0); // Buang yang kosong
}

export const CONFIG = {
  GROQ_API_KEY: import.meta.env.VITE_GROQ_API_KEY || "",
  GROQ_BASE_URL: "https://api.groq.com/openai/v1",
  GROQ_MODEL: "meta-llama/llama-4-scout-17b-16e-instruct", 
  MAX_HISTORY: 10,
};

export const STATE = {
  botAktif: false,
  lastBotText:'',
};

export const BOT_RULES = {
  respondToSelf: false,       
  respondToGroups: false,     
  respondToStatus: false,     
  onlyReplyToContacts: false,
  
  // Membaca langsung dari file .env
  whitelistNumbers: parseEnvArray(import.meta.env.VITE_WHITELIST_NUMBERS),
  whitelistGroups: parseEnvArray(import.meta.env.VITE_WHITELIST_GROUPS),  
  blacklistNumbers: parseEnvArray(import.meta.env.VITE_BLACKLIST_NUMBERS), 
  blacklistGroups: parseEnvArray(import.meta.env.VITE_BLACKLIST_GROUPS),  
};