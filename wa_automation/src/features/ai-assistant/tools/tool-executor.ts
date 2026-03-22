// tool-executor.ts
// Menerima perintah dari AI ("jalankan tool X dengan args Y")
// lalu meneruskan ke fungsi yang tepat.
// Analoginya: ini adalah "resepsionis" yang menerima tamu (tool call)
// dan mengantar ke ruangan yang benar.

import { searchInternet } from '../../web-search';
import { dbManager } from '../../../core';
import {
  searchContactByName,
  checkNumberExists,
  getContactProfile,
  getLastSeen,
  saveContact
} from './contact-tools';
import { getUnseenStatuses, downloadStatusMedia, sendTextStatus } from './status-tools';
import {
  sendMessageToNumber,
  bulkSendMessage,
  getLastMessagesFromChat,
  reactToMessage, 
  removeReaction,
  createPoll,
  sendLocation,
  sendContactCard,
  convertUrlToSticker,
  sendMediaFromUrl,
  archiveChat,
  pinChat,
  clearChat,
  deleteMessage,
  markChatAsReadOrUnread
} from './chat-tools';
import {
  createGroup,
  addParticipants,
  removeParticipants,
  updateGroupAdmin,
  updateGroupInfo,
  setGroupAnnounce,
  getGroupInviteLink
} from './group-tools';
import {
  updateProfileStatus,
  updateProfileName,
  getBusinessCatalog
} from './profile-tools';
import { getMySelfInfo } from './conn-tools';

// Tipe untuk satu tool call dari Groq
interface ToolCallRequest {
  id: string;
  name: string;
  arguments: string; // JSON string dari Groq
}

// Tipe untuk hasil eksekusi tool
interface ToolCallResult {
  tool_call_id: string;
  name: string;
  content: string;
}

/**
 * Eksekusi satu tool call dan kembalikan hasilnya.
 * Dipanggil dari ask-ai.ts ketika AI minta tool.
 */
export async function executeTool(
  toolCall: ToolCallRequest,
  senderJid: string, // dibutuhkan untuk saveUserMemory
  idChat: string,    // JID ruangan chat tempat diskusi saat ini berlangsung
): Promise<ToolCallResult> {
  const { id, name } = toolCall;

  // Parse argumen dengan aman
  let args: Record<string, any> = {};
  try {
    args = JSON.parse(toolCall.arguments);
  } catch {
    return { tool_call_id: id, name, content: 'Error: Argumen tidak valid.' };
  }

  console.log(`[ToolExecutor] Menjalankan: ${name}`, args);

  // ── SMART FALLBACK ─────────────────────────────────────────────────────────
  // LLM seringkali keliru dengan hanya memberikan "Nama Orang" alih-alih JID resmi WA (@c.us/@g.us).
  // Jika hal ini terjadi, asumsikan AI ingin mengeksekusinya di obrolan yang sedang aktif (idChat).
  if (args.chatId && !String(args.chatId).includes('@')) args.chatId = idChat;
  if (args.groupId && !String(args.groupId).includes('@')) args.groupId = idChat;
  if (args.jid && !String(args.jid).includes('@')) args.jid = idChat;

  let result = 'Tool tidak dikenali.';

  // ── Switch besar: satu nama tool → satu fungsi ─────────────────────────────
  switch (name) {

    // Tools lama
    case 'searchInternet':
      result = await searchInternet(args.query);
      break;

    case 'saveUserMemory':
      await dbManager.addMemory({ jid: senderJid, fact: args.fact });
      result = 'Fakta berhasil disimpan ke memori jangka panjang.';
      break;

    // Tools kontak
    case 'searchContactByName':
      result = await searchContactByName(args.name);
      break;

    case 'checkNumberExists':
      result = await checkNumberExists(args.phoneNumber);
      break;

    case 'getContactProfile':
      result = await getContactProfile(args.jid);
      break;

    case 'getLastSeen':
      result = await getLastSeen(args.jid);
      break;

    case 'saveContact':
      result = await saveContact(args.phoneNumber, args.contactName);
      break;

    // Tools chat
    case 'sendMessageToNumber':
      result = await sendMessageToNumber(args.phoneNumber, args.message);
      break;

    case 'bulkSendMessage': {
      // Parse nomor dari string "628111,628222" menjadi array
      const numbers = String(args.phoneNumbers).split(',').map((n: string) => n.trim());
      result = await bulkSendMessage(numbers, args.message);
      break;
    }

    case 'getLastMessagesFromChat':
      result = await getLastMessagesFromChat(args.jid, args.limit || 10);
      break;

    // Tools status
    case 'getUnseenStatuses':
      result = await getUnseenStatuses(args.markAsSeen === 'true');
      break;

    case 'downloadStatusMedia':
      result = await downloadStatusMedia(args.contactJid);
      break;

    case 'sendTextStatus':
      result = await sendTextStatus(args.text, args.backgroundColor);
      break;

    // Tools reaksi
    case 'reactToMessage':
      result = await reactToMessage(args.chatId, args.msgId, args.emoji);
      break;

    case 'removeReaction':
      result = await removeReaction(args.msgId);
      break;

    // Tools Advanced Messaging
    case 'createPoll': {
      const choices = args.selectableChoices ? parseInt(String(args.selectableChoices), 10) : 1;
      result = await createPoll(args.chatId, args.title, args.optionsString, isNaN(choices) ? 1 : choices);
      break;
    }

    case 'sendLocation':
      result = await sendLocation(args.chatId, args.latitude, args.longitude, args.title);
      break;

    case 'sendContactCard':
      result = await sendContactCard(args.chatId, args.targetPhoneNumber, args.targetName);
      break;

    case 'convertUrlToSticker':
      result = await convertUrlToSticker(args.chatId, args.imageUrl);
      break;

    // Tools Chat Manager (Pemanipulasian Chat)
    case 'archiveChat':
      result = await archiveChat(args.chatId, String(args.archive) === 'true');
      break;

    case 'pinChat':
      result = await pinChat(args.chatId, String(args.pin) === 'true');
      break;

    case 'clearChat':
      result = await clearChat(args.chatId);
      break;

    case 'deleteMessage':
      result = await deleteMessage(args.chatId, args.msgId, String(args.revoke) === 'true');
      break;

    case 'sendMediaFromUrl':
      result = await sendMediaFromUrl(args.chatId, args.url, args.filename, args.caption || '');
      break;

    case 'markChatAsReadOrUnread':
      result = await markChatAsReadOrUnread(args.chatId, String(args.read) === 'true');
      break;

    // Tools Manajemen Grup
    case 'createGroup':
      result = await createGroup(args.groupName, args.participantsString);
      break;

    case 'addParticipants':
      result = await addParticipants(args.groupId, args.participantsString);
      break;

    case 'removeParticipants':
      result = await removeParticipants(args.groupId, args.participantsString);
      break;

    case 'updateGroupAdmin':
      result = await updateGroupAdmin(args.groupId, args.participantsString, String(args.promote) === 'true');
      break;

    case 'updateGroupInfo':
      result = await updateGroupInfo(args.groupId, args.type, args.text);
      break;

    case 'setGroupAnnounce':
      result = await setGroupAnnounce(args.groupId, String(args.announceOnly) === 'true');
      break;

    case 'getGroupInviteLink':
      result = await getGroupInviteLink(args.groupId);
      break;

    // Tools Profil & Bisnis
    case 'updateProfileStatus':
      result = await updateProfileStatus(args.text);
      break;

    case 'updateProfileName':
      result = await updateProfileName(args.name);
      break;

    case 'getBusinessCatalog':
      result = await getBusinessCatalog(args.contactJid);
      break;

    case 'getMySelfInfo':
      result = await getMySelfInfo();
      break;

    default:
      result = `Tool "${name}" belum diimplementasikan.`;
  }

  return { tool_call_id: id, name, content: result };
}