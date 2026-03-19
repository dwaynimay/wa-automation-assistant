// src/services/receiver/filter.ts
//
// Penjaga gerbang: memutuskan apakah sebuah pesan layak diproses bot.
// Urutan pengecekan: Status → fromMe → Grup → Blacklist → Kontak → Whitelist.

import { botRules } from '../../config'; // ✅ via barrel

export function passesFilter(
  msg: Record<string, any>,
  chatId: string,
): boolean {
  // Tolak pesan status WhatsApp
  if (msg.isStatusV3 && !botRules.respondToStatus) return false;

  // Tolak pesan dari diri sendiri
  if (msg.id?.fromMe && !botRules.respondToSelf) return false;

  // Tolak pesan dari grup
  if (msg.isGroup && !botRules.respondToGroups) return false;

  // Cek blacklist (prioritas tertinggi — langsung tolak)
  if (!msg.isGroup && botRules.blacklistNumbers.includes(chatId)) {
    console.log(`[Filter] Diabaikan — nomor di blacklist: ${chatId}`);
    return false;
  }
  if (msg.isGroup && botRules.blacklistGroups.includes(chatId)) {
    console.log(`[Filter] Diabaikan — grup di blacklist: ${chatId}`);
    return false;
  }

  // Cek mode "hanya balas kontak" — orang asing yang tidak di whitelist ditolak
  if (botRules.onlyReplyToContacts && !msg.isGroup) {
    const isKontak = msg.sender?.isMyContact ?? false;
    const adaDiWhitelist = botRules.whitelistNumbers.includes(chatId);
    if (!isKontak && !adaDiWhitelist) {
      console.log(
        `[Filter] Diabaikan — bukan kontak & tidak di whitelist: ${chatId}`,
      );
      return false;
    }
  }

  // Cek whitelist nomor (jika whitelist aktif/tidak kosong)
  if (botRules.whitelistNumbers.length > 0 && !msg.isGroup) {
    if (!botRules.whitelistNumbers.includes(chatId)) {
      console.log(
        `[Filter] Diabaikan — tidak ada di whitelist nomor: ${chatId}`,
      );
      return false;
    }
  }

  // Cek whitelist grup
  if (botRules.whitelistGroups.length > 0 && msg.isGroup) {
    if (!botRules.whitelistGroups.includes(chatId)) return false;
  }

  return true;
}
