/*
 *
 * mengatasi logika pengiriman pesan
 *
 */

import { getWPP } from './instance';
import { sleep, randomInt } from '../../utils';

export async function sendHumanizedMessage(
  to: string,
  text: string,
  quotedMsgId?: string, //boleh direply atau tidak
): Promise<void> {
  try {
    const WPP = getWPP();

    // cek data no tujuan
    if (!to || typeof to !== 'string' || to.trim() === '') {
      console.error('[WPP] Nomor Tidak Valid', to);
      return;
    }
    // waktu tunggu buka hp
    await sleep(randomInt(800, 2500));

    // status di baca (centang biru)
    try {
      await WPP.chat.markIsRead(to);
    } catch (e) {}

    // waktu mengetik
    const durasiNgetik = Math.min(Math.max(800, text.length * 30), 4000);
    // kirim status mengetik
    try {
      await WPP.chat.markIsComposing(to, durasiNgetik);
    } catch (e) {}

    // waktu tunggu sebelum kirim
    await sleep(durasiNgetik);

    // bungkus pesan sebelum dikirim
    const options: any = { linkPreview: false, mentions: [] };
    if (quotedMsgId) options.quotedMsg = quotedMsgId;

    await WPP.chat.sendTextMessage(to, text, options);
    console.log('[WPP] pesan terkirim ke ', to, text);
  } catch (error) {
    console.error('[WPP] gagal kirim pesan', error);
  }
}
