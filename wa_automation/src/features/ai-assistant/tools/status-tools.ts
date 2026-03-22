// Bertugas: baca status/story WhatsApp orang lain
// TANPA membuka/menandai sebagai sudah dilihat (kecuali diminta)
// AI bisa minta: "lihat status terbaru si X", "ambil semua status hari ini"

import { getWPP } from '../../../core/wpp';

/**
 * Ambil semua status/story yang belum dilihat
 * Secara default TIDAK menandai sebagai sudah dilihat (ghosting mode 👻)
 */
export async function getUnseenStatuses(markAsSeen: boolean = false): Promise<string> {
  const WPP = getWPP();
  if (!WPP) return 'Error: WPP belum siap.';

  try {
    // WPP.status.getMyStatus dan getAllStatuses
    const statuses = await (WPP as any).status.getStatusV3Messages();

    if (!statuses || statuses.length === 0) {
      return 'Tidak ada status/story yang bisa dilihat saat ini.';
    }

    const hasil: string[] = [];

    for (const statusGroup of statuses) {
      const nama = statusGroup.contact?.pushname || 
                   statusGroup.contact?.name || 
                   statusGroup.id?.user || 'Seseorang';
      
      const msgs = statusGroup.msgs || [];
      const jumlah = msgs.length;
      
      // Ambil teks dari status (kalau ada)
      const teksStatus = msgs
        .filter((m: any) => m.body || m.caption)
        .map((m: any) => m.body || m.caption)
        .join(' | ');

      hasil.push(`📸 ${nama}: ${jumlah} status${teksStatus ? ` — "${teksStatus}"` : ''}`);

      // Tandai sudah dilihat HANYA jika diminta
      if (markAsSeen) {
        for (const msg of msgs) {
          try {
            await (WPP as any).status.sendReadStatus(msg.id);
          } catch { /* skip jika gagal */ }
        }
      }
    }

    const modeLabel = markAsSeen ? '(sudah ditandai dilihat)' : '(mode ghost — belum ditandai dilihat)';
    return `📊 Status terbaru ${modeLabel}:\n\n${hasil.join('\n')}`;
  } catch (err) {
    return `Gagal ambil status: ${String(err)}`;
  }
}

/**
 * Download media dari status seseorang (foto/video status)
 * Tanpa menandai sebagai sudah dilihat
 */
export async function downloadStatusMedia(
  contactJid: string,
): Promise<string> {
  const WPP = getWPP();
  if (!WPP) return 'Error: WPP belum siap.';

  try {
    const statuses = await (WPP as any).status.getStatusV3Messages();
    
    // Cari status milik kontak yang diminta
    const targetStatus = statuses?.find(
      (s: any) => s.id?.user === contactJid.replace('@c.us', '')
    );

    if (!targetStatus) {
      return `Tidak ada status dari ${contactJid}.`;
    }

    const mediaMessages = (targetStatus.msgs || []).filter((m: any) => m.hasMedia);
    
    if (mediaMessages.length === 0) {
      return `Status dari ${contactJid} tidak mengandung media (hanya teks).`;
    }

    // Download media pertama yang ditemukan
    const firstMedia = mediaMessages[0];
    const blob = await WPP.chat.downloadMedia(firstMedia.id);
    const base64 = await WPP.util.blobToBase64(blob);
    
    return `✅ Media status dari ${contactJid} berhasil diunduh.\nUkuran: ${blob.size} bytes\nTipe: ${blob.type}\nData: ${base64.substring(0, 50)}... (base64)`;
  } catch (err) {
    return `Gagal download media status: ${String(err)}`;
  }
}

/**
 * Membuat status (Story) teks baru untuk akun bot
 */
export async function sendTextStatus(text: string, backgroundColor: string = '#FF5733'): Promise<string> {
  const WPP = getWPP();
  if (!WPP) return 'Error: WPP belum siap.';

  try {
    await (WPP as any).status.sendTextStatus(text, { backgroundColor });
    return `✅ Status WhatsApp (Story) berhasil diperbarui dengan teks: "${text}".`;
  } catch (err) {
    return `❌ Gagal mengirim status WA: ${String(err)}`;
  }
}