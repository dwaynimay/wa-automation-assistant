// src/config/bot-rules.ts

// Sekarang import dari shared/ — bukan dari ../utils secara langsung
import { parseEnvArray } from '../shared/utils';

// Tipe eksplisit untuk aturan-aturan bot
export interface BotRules {
  readonly respondToSelf: boolean;
  readonly respondToGroups: boolean;
  readonly respondToStatus: boolean;
  readonly onlyReplyToContacts: boolean;
  readonly whitelistNumbers: readonly string[];
  readonly whitelistGroups: readonly string[];
  readonly blacklistNumbers: readonly string[];
  readonly blacklistGroups: readonly string[];
}

export const botRules: BotRules = {
  // Bot tidak akan membalas pesannya sendiri
  respondToSelf: false,
  // Bot tidak akan membalas pesan di grup
  respondToGroups: false,
  // Bot tidak aktif di status WhatsApp
  respondToStatus: false,
  // Bot hanya balas kontak yang tersimpan
  onlyReplyToContacts: false,

  // Daftar nomor/grup yang BOLEH dibalas (isi via .env)
  whitelistNumbers: parseEnvArray(import.meta.env.VITE_WHITELIST_NUMBERS),
  whitelistGroups: parseEnvArray(import.meta.env.VITE_WHITELIST_GROUPS),

  // Daftar nomor/grup yang TIDAK BOLEH dibalas (isi via .env)
  blacklistNumbers: parseEnvArray(import.meta.env.VITE_BLACKLIST_NUMBERS),
  blacklistGroups: parseEnvArray(import.meta.env.VITE_BLACKLIST_GROUPS),
} as const;
