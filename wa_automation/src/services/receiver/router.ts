import { getCommand } from '../command-registry';
import { askAI } from '../../features/ai-assistant';
import { sendHumanizedMessage } from '../../core/wpp/sender';
import { dbManager } from '../../core/database'; // <--- PASTIKAN INI DIIMPORT

export async function routeMessage(
  text: string, 
  chatId: string, 
  msgId: string, 
  senderName: string,
  isReply: boolean = false,
  teksDibalas: string | undefined = undefined
) {
  
  // 💾 1. CATAT KE SQLITE LAPTOP (PROFIL & PESAN)
  console.log("📝 [Router] Mencoba mencatat ke Database...");
  await dbManager.saveUser(chatId, senderName);
  await dbManager.saveMessage(msgId, chatId, 'user', text);

  // 2. CEK COMMAND MANUAL (!ping dll)
  if (text.startsWith('!')) {
    const args = text.slice(1).split(' ');
    const commandName = args.shift()?.toLowerCase();
    if (commandName) {
      const command = getCommand(commandName);
      if (command) {
        await command.execute(chatId, msgId, args);
        return; 
      }
    }
  }

  // 3. PROSES KE AI
  const balasanAI = await askAI(text, chatId, senderName, isReply, teksDibalas);
  
  if (balasanAI) {
    await sendHumanizedMessage(chatId, balasanAI, msgId);

    // 💾 4. CATAT BALASAN BOT KE SQLITE
    const botMsgId = `bot_${Date.now()}`; 
    await dbManager.saveMessage(botMsgId, chatId, 'bot', balasanAI);
  }
}