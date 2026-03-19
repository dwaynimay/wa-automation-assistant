// src/services/receiver/filter.ts
//
// Penjaga gerbang: memutuskan apakah sebuah pesan layak diproses bot.
// Urutan pengecekan: Blacklist → Whitelist → onlyReplyToContacts → respondTo flags

import { botRules } from '../../config';

export function passesFilter(
  msg: Record<string, any>,
  chatId: string,
): boolean {
  const isGroup = msg.isGroup ?? false;

  // ① BLACKLIST — prioritas tertinggi, selalu diperiksa pertama
  if (!isGroup && botRules.blacklistNumbers.includes(chatId)) {
    console.log(`[Filter] Ditolak — nomor di blacklist: ${chatId}`);
    return false;
  }
  if (isGroup && botRules.blacklistGroups.includes(chatId)) {
    console.log(`[Filter] Ditolak — grup di blacklist: ${chatId}`);
    return false;
  }

  // ② WHITELIST — jika aktif, nomor WAJIB ada di sini
  // Kalau lolos whitelist → langsung skip ke ④, onlyReplyToContacts diabaikan
  const whitelistNomorAktif = botRules.whitelistNumbers.length > 0;
  const whitelistGrupAktif = botRules.whitelistGroups.length > 0;

  if (!isGroup && whitelistNomorAktif) {
    if (!botRules.whitelistNumbers.includes(chatId)) {
      console.log(`[Filter] Ditolak — tidak ada di whitelist nomor: ${chatId}`);
      return false;
    }
    // Lolos whitelist → skip ③, langsung cek flags
    return passesFlagChecks(msg);
  }

  if (isGroup && whitelistGrupAktif) {
    if (!botRules.whitelistGroups.includes(chatId)) {
      console.log(`[Filter] Ditolak — tidak ada di whitelist grup: ${chatId}`);
      return false;
    }
    // Lolos whitelist → skip ③, langsung cek flags
    return passesFlagChecks(msg);
  }

  // ③ ONLY REPLY TO CONTACTS
  // Hanya jalan kalau whitelist tidak aktif
  if (botRules.onlyReplyToContacts && !isGroup) {
    const isKontak = msg.sender?.isMyContact ?? false;
    if (!isKontak) {
      console.log(`[Filter] Ditolak — bukan kontak tersimpan: ${chatId}`);
      return false;
    }
  }

  // ④ RESPOND-TO FLAGS — prioritas terendah
  return passesFlagChecks(msg);
}

// Helper untuk Cek ④ — dipisah karena dipanggil dari dua jalur:
// 1. Setelah lolos whitelist (skip ③)
// 2. Dari alur normal setelah ③
function passesFlagChecks(msg: Record<string, any>): boolean {
  if (msg.isStatusV3 && !botRules.respondToStatus) return false;
  if (msg.id?.fromMe && !botRules.respondToSelf) return false;
  if (msg.isGroup && !botRules.respondToGroups) return false;
  return true;
}
