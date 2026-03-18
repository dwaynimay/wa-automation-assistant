import { botRules } from '../../config';

export function passesFilter(msg: any, chatId: string): boolean {
  if (msg.isStatusV3 && !botRules.respondToStatus) return false;
  if (msg.id?.fromMe && !botRules.respondToSelf) return false;
  if (msg.isGroup && !botRules.respondToGroups) return false;

  // 1. CEK BLACKLIST (Prioritas Utama: Tolak!)
  if (!msg.isGroup && botRules.blacklistNumbers.includes(chatId)) {
    console.log(`🛑 [Filter] Pesan dari ${chatId} diabaikan (Masuk Blacklist)`);
    return false;
  }
  if (msg.isGroup && botRules.blacklistGroups.includes(chatId)) {
    console.log(
      `🛑 [Filter] Pesan dari grup ${chatId} diabaikan (Masuk Blacklist)`,
    );
    return false;
  }

  // 2. CEK KONTAK (Orang Asing / Sudah Kenal)
  if (botRules.onlyReplyToContacts && !msg.isGroup && !msg.id?.fromMe) {
    const isKontak = msg.sender?.isMyContact || false;
    const adaDiWhitelist = botRules.whitelistNumbers.includes(chatId);

    if (!isKontak && !adaDiWhitelist) {
      console.log(
        `🛑 [Filter] Pesan dari ${chatId} diabaikan (Bukan Kontak / Orang Asing)`,
      );
      return false;
    }
  }

  // 3. CEK WHITELIST
  if (!msg.isGroup && botRules.whitelistNumbers.length > 0) {
    if (!botRules.whitelistNumbers.includes(chatId)) {
      console.log(
        `🛑 [Filter] Pesan dari ${chatId} diabaikan (Tidak ada di Whitelist)`,
      );
      return false;
    }
  }
  if (msg.isGroup && botRules.whitelistGroups.length > 0) {
    if (!botRules.whitelistGroups.includes(chatId)) return false;
  }

  return true;
}
