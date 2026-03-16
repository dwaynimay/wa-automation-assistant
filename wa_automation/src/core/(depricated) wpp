import { sleep, randomInt } from '../utils/helpers';


export function getWPP(): any {
  return (window as any).WPP;
}

export function injectWajs(): Promise<void> {
  return new Promise((resolve) => {
    
    if (getWPP()) {
      console.log('[WPP] Loaded');
      return resolve();
    }

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@wppconnect/wa-js@latest/dist/wppconnect-wa.js";
    script.async = true;
    script.onload = () => {
      console.log('[WPP] Loaded]');
      resolve();
    };
    script.onerror = () => {
      console.error('❌ Gagal load WPP library');
      resolve();
    };
    document.documentElement.appendChild(script);
  });
}

export async function sendHumanizedMessage(
  to: string,
  text: string,
  quotedMsgId?: string
): Promise<void> {
  try {
    const WPP = getWPP();
    
    // Validasi nomor (Fix error to.trim is not a function)
    if (!to || typeof to !== 'string' || to.trim() === "") {
      console.error('❌ Nomor chat tidak valid:', to);
      return;
    }

    await sleep(randomInt(1000, 2500));

    try { await WPP.chat.markIsRead(to); } catch (e) {}

    const durasiNgetik = Math.min(Math.max(800, text.length * 30), 4000);
    try { await WPP.chat.markIsComposing(to, durasiNgetik); } catch (e) {}

    await sleep(durasiNgetik);

    const options: any = { linkPreview: false, mentions: [] };
    if (quotedMsgId) options.quotedMsg = quotedMsgId;

    await WPP.chat.sendTextMessage(to, text, options);
    console.log('✅ [Pesan Terkirim] ke', to);
  } catch (error) {
    console.error('❌ Gagal mengirim pesan:', error);
  }
}