// File: src/services/receiver/router.ts
import { getCommand } from '../command-registry';
import { askAI } from '../../features/ai-assistant';
import { sendHumanizedMessage } from '../../core/wpp/sender';

// 👇 Tambahkan 'senderName: string' di sini sebagai parameter ke-4
export async function routeMessage(text: string, chatId: string, msgId: string, senderName: string) {
  
  // 1. Cek apakah ini sebuah Command (dimulai dengan '!')
  if (text.startsWith('!')) {
    const args = text.slice(1).split(' ');
    const commandName = args.shift()?.toLowerCase();

    if (commandName) {
      const command = getCommand(commandName);
      if (command) {
        // (Opsional) Kamu bisa juga menambahkan senderName ke execute() 
        // kalau suatu saat command butuh nama user.
        await command.execute(chatId, msgId, args);
        return; // Selesai di sini
      }
    }
  }

  // 2. Jika bukan command, lempar ke AI
  // 👇 Jangan lupa oper 'senderName' ke askAI agar AI tahu nama yang ngechat!
  const balasanAI = await askAI(text, chatId, senderName);
  
  if (balasanAI) {
    await sendHumanizedMessage(chatId, balasanAI, msgId);
  }
}