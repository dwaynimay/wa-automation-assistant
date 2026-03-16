// Di dalam src/services/receiver/router.ts
import { getCommand } from '../command-registry';
import { askAI } from '../../features/ai-assistant';
import { sendHumanizedMessage } from '../../core/wpp/sender';

// 👇 Tambahkan isReply dan teksDibalas di parameter
export async function routeMessage(
  text: string, 
  chatId: string, 
  msgId: string, 
  senderName: string,
  isReply: boolean = false,
  teksDibalas: string | undefined = undefined
) {
  
  if (text.startsWith('!')) {
    // ... (Logika command tetap sama tidak usah diubah)
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

  // 👇 Oper parameter barunya ke askAI
  const balasanAI = await askAI(text, chatId, senderName, isReply, teksDibalas);
  
  if (balasanAI) {
    await sendHumanizedMessage(chatId, balasanAI, msgId);
  }
}