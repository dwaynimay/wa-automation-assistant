// File: src/services/receiver/filter.ts
import { BOT_RULES } from '../../config';

export function passesFilter(msg: any, chatId: string): boolean {
  // 1. Filter Status/Story WA
  if (msg.isStatusV3 && !BOT_RULES.respondToStatus) return false;

  // 2. Filter Pesan Sendiri
  if (msg.id?.fromMe && !BOT_RULES.respondToSelf) return false;

  // 3. Filter Pesan Grup
  if (msg.isGroup && !BOT_RULES.respondToGroups) return false;

  // 4. Filter Whitelist Nomor Pribadi
  if (!msg.isGroup && BOT_RULES.whitelistNumbers.length > 0) {
    if (!BOT_RULES.whitelistNumbers.includes(chatId)) return false;
  }

  // 5. Filter Whitelist Grup
  if (msg.isGroup && BOT_RULES.whitelistGroups.length > 0) {
    if (!BOT_RULES.whitelistGroups.includes(chatId)) return false;
  }

  // Jika lolos semua hadangan di atas, berarti pesan aman diproses
  return true;
}