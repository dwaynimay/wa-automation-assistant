// src/features/ai-assistant/tools/chat-tools.ts
// Modul sentral untuk WPP.chat.* (Pesan, Media, Reaksi, Polling, Manajemen Chat Ui)

import { getWPP, sendHumanizedMessage } from '../../../core/wpp';
import { sleep, randomInt } from '../../../shared/utils';

// ==========================================
// 1. PENGIRIMAN PESAN DASAR & BULK
// ==========================================

export async function sendMessageToNumber(phoneNumber: string, message: string): Promise<string> {
  try {
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    const jid = cleanNumber.includes('@') ? cleanNumber : `${cleanNumber}@c.us`;
    await sendHumanizedMessage(jid, message);
    return `✅ Pesan berhasil dikirim ke ${phoneNumber}.`;
  } catch (err) {
    return `❌ Gagal kirim pesan ke ${phoneNumber}: ${String(err)}`;
  }
}

export async function bulkSendMessage(phoneNumbers: string[], message: string): Promise<string> {
  if (phoneNumbers.length === 0) return 'Tidak ada nomor tujuan.';
  if (phoneNumbers.length > 50) return '❌ Maksimal 50 nomor sekaligus untuk mencegah banned.';

  const results: string[] = [];
  let successCount = 0;
  let failCount = 0;

  for (const phone of phoneNumbers) {
    try {
      const cleanNumber = phone.trim().replace(/\D/g, '');
      const jid = `${cleanNumber}@c.us`;
      await sendHumanizedMessage(jid, message);
      successCount++;
      results.push(`✅ ${phone}`);
      const delay = randomInt(3000, 8000);
      await sleep(delay);
    } catch (err) {
      failCount++;
      results.push(`❌ ${phone} (gagal)`);
    }
  }

  return `📊 Hasil Bulk Send:\n- Berhasil: ${successCount}\n- Gagal: ${failCount}\n\nDetail:\n${results.join('\n')}`;
}

export async function getLastMessagesFromChat(jid: string, limit: number = 10): Promise<string> {
  const WPP = getWPP();
  if (!WPP) return 'Error: WPP belum siap.';

  try {
    const messages = await (WPP as any).chat.getMessages(jid, { count: limit });
    if (!messages || messages.length === 0) return `Tidak ada pesan di chat ${jid}.`;

    const formatted = messages.map((m: any) => {
      const sender = m.id?.fromMe ? 'Saya' : (m.notifyName || 'Mereka');
      const teks = m.body || m.caption || '[Media/Stiker]';
      return `[${sender}]: ${teks}`;
    }).join('\n');

    return `💬 ${limit} pesan terakhir dari ${jid}:\n\n${formatted}`;
  } catch (err) {
    return `Gagal ambil pesan: ${String(err)}`;
  }
}

// ==========================================
// 2. ADVANCED MESSAGING (Polling, VCard, Stiker, Media)
// ==========================================

export async function createPoll(chatId: string, title: string, optionsString: string, selectableChoices: number = 1): Promise<string> {
  const WPP = getWPP();
  if (!WPP) return 'Error: WPP belum siap.';

  const options = optionsString.split(',').map(o => o.trim()).filter(o => o.length > 0);
  if (options.length < 2) return '❌ Polling butuh minimal 2 opsi (pisahkan dengan koma).';

  try {
    await (WPP as any).chat.sendCreatePollMessage(chatId, title, options, { selectableCount: selectableChoices });
    return `✅ Polling "${title}" berhasil dikirim ke ${chatId}.`;
  } catch (err) {
    return `❌ Gagal buat polling: ${String(err)}`;
  }
}

export async function sendLocation(chatId: string, latitude: string, longitude: string, title: string): Promise<string> {
  const WPP = getWPP();
  if (!WPP) return 'Error: WPP belum siap.';
  
  try {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lng)) return '❌ Koordinat lat/long harus berupa angka.';

    await (WPP as any).chat.sendLocationMessage(chatId, { lat, lng, name: title });
    return `✅ Lokasi Peta "${title}" berhasil dikirim.`;
  } catch (err) {
    return `❌ Gagal kirim lokasi: ${String(err)}`;
  }
}

export async function sendContactCard(chatId: string, targetPhoneNumber: string, targetName: string): Promise<string> {
  const WPP = getWPP();
  if (!WPP) return 'Error: WPP belum siap.';

  try {
    const cleanNumber = targetPhoneNumber.replace(/\D/g, '');
    const contactJid = `${cleanNumber}@c.us`;
    await (WPP as any).chat.sendVCardContactMessage(chatId, contactJid, targetName);
    return `✅ Kontak kartu (VCard) atas nama ${targetName} berhasil dikirim.`;
  } catch (err) {
    return `❌ Gagal membagikan kontak: ${String(err)}`;
  }
}

export async function convertUrlToSticker(chatId: string, imageUrl: string): Promise<string> {
  const WPP = getWPP();
  if (!WPP) return 'Error: WPP belum siap.';

  try {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error('Gagal mendownload gambar dari URL.');
    
    const blob = await response.blob();
    const base64 = await (WPP as any).util.blobToBase64(blob);

    await (WPP as any).chat.sendImageAsSticker(chatId, base64);
    return `✅ Stiker berhasil dicetak dan dikirim!`;
  } catch (err) {
    return `❌ Gagal mengirim stiker: ${String(err)}`;
  }
}

export async function sendMediaFromUrl(chatId: string, url: string, filename: string, caption: string): Promise<string> {
  const WPP = getWPP();
  if (!WPP) return 'Error: WPP belum siap.';

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Gagal mendownload media dari URL.');
    
    const blob = await response.blob();
    const base64 = await (WPP as any).util.blobToBase64(blob);

    await (WPP as any).chat.sendFileMessage(chatId, base64, {
      type: 'auto-detect',
      filename: filename,
      caption: caption
    });
    return `✅ File media (${filename}) berhasil dikirim ke ${chatId}.`;
  } catch (err) {
    return `❌ Gagal mengirim file: ${String(err)}`;
  }
}

// ==========================================
// 3. REACTION TOOLS
// ==========================================

export const VALID_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🔥', '🎉', '👏', '💯'];

export async function reactToMessage(_chatId: string, msgId: string, emoji: string): Promise<string> {
  const WPP = getWPP();
  if (!WPP) return 'Error: WPP belum siap.';

  if (!VALID_REACTIONS.includes(emoji)) {
    return `❌ Emoji "${emoji}" tidak valid untuk reaksi WhatsApp.\nEmoji yang tersedia: ${VALID_REACTIONS.join(' ')}`;
  }

  try {
    await (WPP as any).chat.sendReactionToMessage(msgId, emoji);
    return `✅ Reaksi ${emoji} berhasil diberikan ke pesan.`;
  } catch (err) {
    return `❌ Gagal memberikan reaksi: ${String(err)}`;
  }
}

export async function removeReaction(msgId: string): Promise<string> {
  const WPP = getWPP();
  if (!WPP) return 'Error: WPP belum siap.';

  try {
    await (WPP as any).chat.sendReactionToMessage(msgId, '');
    return `✅ Reaksi berhasil dihapus.`;
  } catch (err) {
    return `❌ Gagal hapus reaksi: ${String(err)}`;
  }
}

// ==========================================
// 4. CHAT UI MANAGER (Arsip, Pin, Clear, Delete, Mark Read)
// ==========================================

export async function archiveChat(chatId: string, archive: boolean = true): Promise<string> {
  const WPP = getWPP();
  if (!WPP) return 'Error: WPP belum siap.';

  try {
    await (WPP as any).chat.archive(chatId, archive);
    return `✅ Chat ${chatId} berhasil ${archive ? 'diarsipkan' : 'dikeluarkan dari arsip'}.`;
  } catch (err) {
    return `❌ Gagal memanipulasi arsip chat: ${String(err)}`;
  }
}

export async function pinChat(chatId: string, pin: boolean = true): Promise<string> {
  const WPP = getWPP();
  if (!WPP) return 'Error: WPP belum siap.';

  try {
    await (WPP as any).chat.pin(chatId, pin);
    return `✅ Chat ${chatId} berhasil ${pin ? 'disematkan (pin)' : 'dilepas sematannya'}.`;
  } catch (err) {
    return `❌ Gagal mem-pin chat: ${String(err)}`;
  }
}

export async function clearChat(chatId: string): Promise<string> {
  const WPP = getWPP();
  if (!WPP) return 'Error: WPP belum siap.';

  try {
    await (WPP as any).chat.clear(chatId);
    return `✅ Seluruh riwayat chat di ${chatId} berhasil dibersihkan.`;
  } catch (err) {
    return `❌ Gagal membersihkan chat: ${String(err)}`;
  }
}

export async function deleteMessage(chatId: string, msgId: string, revoke: boolean = true): Promise<string> {
  const WPP = getWPP();
  if (!WPP) return 'Error: WPP belum siap.';

  try {
    await (WPP as any).chat.deleteMessage(chatId, msgId, false, revoke);
    return `✅ Pesan berhasil ${revoke ? 'ditarik (tarik untuk semua)' : 'dihapus (untuk saya)'}.`;
  } catch (err) {
    return `❌ Gagal menghapus pesan: ${String(err)}`;
  }
}

export async function markChatAsReadOrUnread(chatId: string, read: boolean = true): Promise<string> {
  const WPP = getWPP();
  if (!WPP) return 'Error: WPP belum siap.';

  try {
    if (read) {
      await (WPP as any).chat.markIsRead(chatId);
    } else {
      await (WPP as any).chat.markIsUnread(chatId);
    }
    return `✅ Chat berhasil ditandai sebagai ${read ? 'sudah dibaca' : 'belum dibaca'}.`;
  } catch (err) {
    return `❌ Gagal manipulasi mark as read: ${String(err)}`;
  }
}