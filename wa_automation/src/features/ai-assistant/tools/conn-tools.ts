// src/features/ai-assistant/tools/conn-tools.ts
// Modul khusus untuk membaca properti device (Baterai, ID Sender) dan Koneksi

import { getWPP } from '../../../core/wpp';

/**
 * Mencari tahu ID JID Asli milik Bot (Dirinya Sendiri)
 */
export async function getMySelfInfo(): Promise<string> {
  const WPP = getWPP();
  if (!WPP) return 'Error: WPP belum siap.';

  try {
    const myJid = (WPP as any).conn.getMyUserId();
    const battery = await (WPP as any).conn.getBatteryLevel();
    const isMultiDevice = (WPP as any).conn.isMultiDevice();

    return `🛡️ Info Bot/Koneksi Saat Ini:\n- Identitas Saya (JID): ${myJid._serialized || myJid}\n- Baterai Host HP: ${battery}%\n- MultiDevice: ${isMultiDevice ? 'Ya' : 'Tidak'}`;
  } catch (err) {
    return `❌ Gagal memuat info koneksi: ${String(err)}`;
  }
}
