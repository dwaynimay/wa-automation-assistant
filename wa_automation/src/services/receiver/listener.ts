/*
 * 
 * menangkap pesan baru dan mengirim ke processor
 * 
 */

import { getWPP } from '../../core/wpp/instance';
import { processIncomingMessage } from './processor';

export function setupMessageListener() {
  const WPP = getWPP();
  console.log("👂 [Receiver] Listener aktif mendengarkan...");

  WPP.on('chat.new_message', async (msg: any) => {
    // 👇 Tambahkan log ini agar kamu tahu ada sinyal masuk
    console.log("📡 [Sinyal WPP] Pesan ditangkap! Mengirim ke processor...");
    
    await processIncomingMessage(msg);
  });
}