/*
 * 
 * menangkap pesan baru dan mengirim ke processor
 * 
 */

import { getWPP } from '../../core/wpp/instance';
import { processIncomingMessage } from './processor';

export function setupMessageListener() {
  const WPP = getWPP();

  // ambil pesan baru
  WPP.on('chat.new_message', async (msg: any) => {
    await processIncomingMessage(msg);
  });
}