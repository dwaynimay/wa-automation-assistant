/*
 * 
 * menyuntikkan library WPPConnect ke website
 * 
 */

import { getWPP } from './instance';

export function injectWajs(): Promise<void> {
  return new Promise((resolve) => {

    // cek ketersediaan wpp
    if (getWPP()) {
      console.log('[WPP] loaded');
      return resolve();
    }

    // inject library wpp
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@wppconnect/wa-js@latest/dist/wppconnect-wa.js";
    script.async = true;

    script.onload = () => {
      console.log('[WPP] loaded');
      resolve();
    };

    script.onerror = () => {
      console.error('[WPP] failed to load');
      resolve();
    };

    document.documentElement.appendChild(script);
  });
}