// src/core/wpp/sender.ts
//
// Bertugas mengirim pesan dengan simulasi perilaku manusia:
// jeda membuka HP → baca pesan → ketik → kirim.
// Ini adalah satu-satunya pintu untuk mengirim pesan teks ke WhatsApp.

import { getWPP } from './instance';
import { sleep, randomInt } from '../../shared/utils';
import {
  TYPING_DURATION_MIN_MS,
  TYPING_DURATION_MAX_MS,
  OPEN_PHONE_DELAY_MIN_MS,
  OPEN_PHONE_DELAY_MAX_MS,
} from '../../shared/constants';

// Opsi pengiriman pesan WPP
interface SendOptions {
  linkPreview: boolean;
  mentions: string[];
  quotedMsg?: string;
}

export async function sendHumanizedMessage(
  to: string,
  text: string,
  quotedMsgId?: string,
): Promise<void> {
  const WPP = getWPP();

  // Guard: WPP harus sudah siap sebelum bisa kirim pesan
  if (!WPP) {
    console.error('[WPP Sender] WPP belum siap. Pesan dibatalkan.');
    return;
  }

  // Guard: nomor tujuan harus valid
  if (!to || to.trim() === '') {
    console.error('[WPP Sender] Nomor tujuan tidak valid:', to);
    return;
  }

  try {
    // Tahap 1: Simulasi jeda "membuka HP"
    await sleep(randomInt(OPEN_PHONE_DELAY_MIN_MS, OPEN_PHONE_DELAY_MAX_MS));

    // Tahap 2: Tandai pesan sebagai sudah dibaca (centang biru)
    try {
      await WPP.chat.markIsRead(to);
    } catch {
      // Tidak fatal jika gagal — lanjut saja
    }

    // Tahap 3: Hitung dan tampilkan status "sedang mengetik..."
    // Semakin panjang teks, semakin lama waktu mengetiknya (tapi ada batas maksimal)
    const typingDuration = Math.min(
      Math.max(TYPING_DURATION_MIN_MS, text.length * 30),
      TYPING_DURATION_MAX_MS,
    );

    try {
      await WPP.chat.markIsComposing(to, typingDuration);
    } catch {
      // Tidak fatal jika gagal — lanjut saja
    }

    // Tahap 4: Tunggu sesuai durasi mengetik
    await sleep(typingDuration);

    // Tahap 5: Kirim pesan
    const options: SendOptions = { linkPreview: false, mentions: [] };
    if (quotedMsgId) options.quotedMsg = quotedMsgId;

    await WPP.chat.sendTextMessage(to, text, options);
    console.log(`[WPP Sender] Pesan terkirim ke: ${to}`);

  } catch (error) {
    console.error('[WPP Sender] Gagal mengirim pesan:', error);
  }
}