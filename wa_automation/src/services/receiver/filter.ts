import { BOT_RULES } from '../../config';

export function passesFilter(msg: any, chatId: string): boolean {
  if (msg.isStatusV3 && !BOT_RULES.respondToStatus) return false;
  if (msg.id?.fromMe && !BOT_RULES.respondToSelf) return false;
  if (msg.isGroup && !BOT_RULES.respondToGroups) return false;

  // 1. CEK BLACKLIST (Prioritas Utama: Tolak!)
  if (!msg.isGroup && BOT_RULES.blacklistNumbers.includes(chatId)) {
    console.log(`🛑 [Filter] Pesan dari ${chatId} diabaikan (Masuk Blacklist)`);
    return false;
  }
  if (msg.isGroup && BOT_RULES.blacklistGroups.includes(chatId)) {
    console.log(`🛑 [Filter] Pesan dari grup ${chatId} diabaikan (Masuk Blacklist)`);
    return false;
  }

  // 2. CEK KONTAK (Orang Asing / Sudah Kenal)
  if (BOT_RULES.onlyReplyToContacts && !msg.isGroup && !msg.id?.fromMe) {
    const isKontak = msg.sender?.isMyContact || false;
    const adaDiWhitelist = BOT_RULES.whitelistNumbers.includes(chatId);

    if (!isKontak && !adaDiWhitelist) {
      console.log(`🛑 [Filter] Pesan dari ${chatId} diabaikan (Bukan Kontak / Orang Asing)`);
      return false;
    }
  }

  // 3. CEK WHITELIST
  if (!msg.isGroup && BOT_RULES.whitelistNumbers.length > 0) {
    if (!BOT_RULES.whitelistNumbers.includes(chatId)) {
      console.log(`🛑 [Filter] Pesan dari ${chatId} diabaikan (Tidak ada di Whitelist)`);
      return false;
    }
  }
  if (msg.isGroup && BOT_RULES.whitelistGroups.length > 0) {
    if (!BOT_RULES.whitelistGroups.includes(chatId)) return false;
  }

  return true;
}