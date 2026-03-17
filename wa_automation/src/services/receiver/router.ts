import { getCommand } from '../command-registry';
import { askAI } from '../../features/ai-assistant';
import { sendHumanizedMessage } from '../../core/wpp/sender';
import { STATE } from '../../config'

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
    STATE.lastBotText = balasanAI;
    await sendHumanizedMessage(chatId, balasanAI, msgId);
  }
}