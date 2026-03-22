// src/features/ai-assistant/tools/contact-tools.ts
// Bertugas: semua operasi yang berhubungan dengan KONTAK
// AI bisa minta: "carikan nomor si Budi", "cek apakah nomor ini ada di WA"

import { getWPP } from '../../../core/wpp';

export interface ContactInfo {
  jid: string;
  name: string | null;
  pushname: string | null;
  isMyContact: boolean;
  isBusiness: boolean;
  profilePicUrl: string | null;
}

/**
 * Cari kontak berdasarkan nama (Algoritma Detektif / Score-based Fuzzy Search)
 */
export async function searchContactByName(name: string): Promise<string> {
  const WPP = getWPP();
  if (!WPP) return 'Error: WPP belum siap.';

  try {
    const contacts = await (WPP as any).contact.list();

    // Pecah nama menjadi array kata demi kata
    const keywords = name
      .toLowerCase()
      .split(/\s+/)
      .filter((k) => k.trim() !== '');

    // Evaluasi skor kemiripan (Fuzzy Scoring)
    const scoredContacts = contacts.map((c: any) => {
      const displayName = (c.name || c.pushname || '').toLowerCase();
      let score = 0;

      if (!displayName) return { contact: c, score: 0 };

      // Jika namanya sama persis bulat-bulat
      if (displayName === name.toLowerCase()) {
        score += 100;
      }

      keywords.forEach((kw) => {
        // Kecocokan parsial
        if (displayName.includes(kw)) {
          score += 10;
          
          // Bonus jika berdiri sebagai kata utuh
          const words = displayName.split(/\s+/);
          if (words.some((w: string) => w === kw)) {
            score += 5;
          }
        }
      });

      return { contact: c, score };
    });

    const found = scoredContacts
      .filter((sc: any) => sc.score > 0)
      .sort((a: any, b: any) => b.score - a.score)
      .map((sc: any) => sc.contact)
      .slice(0, 10);

    if (found.length === 0) {
      return `Tidak ada kontak dengan kemiripan nama "${name}" di daftar kontak.`;
    }

    const hasil = found
      .map((c: any, i: number) => {
        const nama = c.name || c.pushname || 'Tanpa Nama';
        const nomor = c.id?._serialized || 'Nomor tidak diketahui';
        return `${i + 1}. ${nama} → ${nomor}`;
      })
      .join('\n');

    return `Ditemukan kontak dengan kemiripan nama "${name}":\n${hasil}`;
  } catch (err) {
    return `Gagal mencari kontak: ${String(err)}`;
  }
}

/**
 * Cek apakah sebuah nomor telepon terdaftar di WhatsApp
 */
export async function checkNumberExists(phoneNumber: string): Promise<string> {
  const WPP = getWPP();
  if (!WPP) return 'Error: WPP belum siap.';

  try {
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    const jid = `${cleanNumber}@c.us`;

    const result = await (WPP as any).contact.queryExists(jid);

    if (result?.wid) {
      const contactDetail = await (WPP as any).contact.get(result.wid._serialized);
      const nama = contactDetail?.name || contactDetail?.pushname || 'Tanpa Nama (Belum disave/Anonim)';
      return `✅ Nomor ${phoneNumber} TERDAFTAR di WhatsApp.\n- JID: ${result.wid._serialized}\n- Nama/Pushname: ${nama}`;
    } else {
      return `❌ Nomor ${phoneNumber} TIDAK terdaftar di WhatsApp.`;
    }
  } catch (err) {
    return `Gagal cek nomor: ${String(err)}`;
  }
}

/**
 * Ambil info profil seseorang (nama, foto profil, tentang)
 */
export async function getContactProfile(jid: string): Promise<string> {
  const WPP = getWPP();
  if (!WPP) return 'Error: WPP belum siap.';

  let bio = 'Tidak ada status / Disembunyikan setelan privasi';
  let picUrl = 'Tidak ada foto profil publik';
  let nama = 'Tanpa nama / Nomor Asing';

  try {
    const about = await (WPP as any).contact.getAbout(jid);
    bio = typeof about === 'string' ? about : (about?.status || bio);
  } catch (err) { /* Abaikan jika diblokir privasi */ }

  try {
    const fetchedPic = await (WPP as any).contact.getProfilePictureUrl(jid);
    if (fetchedPic) picUrl = fetchedPic;
  } catch (err) { /* Abaikan jika diblokir privasi */ }

  try {
    const contact = await (WPP as any).contact.get(jid);
    nama = contact?.name || contact?.pushname || nama;
  } catch (err) { /* Abaikan */ }

  return `👤 Profil ${nama}:\n- Bio: ${bio}\n- Foto: ${picUrl}`;
}

/**
 * Cek Kapan Terakhir Online (Last Seen / Presence)
 */
export async function getLastSeen(jid: string): Promise<string> {
  const WPP = getWPP();
  if (!WPP) return 'Error: WPP belum siap.';

  try {
    await (WPP as any).contact.queryPresence(jid);
    const presence = await (WPP as any).contact.getPresence(jid);
    
    const status = presence?.chatstate || presence?.isOnline ? 'Online' : 'Offline/Tidak terlihat';
    const lastSeen = presence?.lastSeen ? new Date(presence.lastSeen * 1000).toLocaleString('id-ID') : 'Disembunyikan';

    return `👁️ Deteksi Kehadiran (${jid}):\n- Status Saat Ini: ${status}\n- Terakhir Dilihat: ${lastSeen}`;
  } catch (err) {
    return `❌ Gagal melacak last seen: ${String(err)}`;
  }
}

/**
 * Menyimpan nomor tak dikenal ke Buku Telepon WhatsApp (Jika didukung Web)
 */
export async function saveContact(phoneNumber: string, contactName: string): Promise<string> {
  const WPP = getWPP();
  if (!WPP) return 'Error: WPP belum siap.';

  try {
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    const jid = `${cleanNumber}@c.us`;

    if (typeof (WPP as any).contact.addContact === 'function') {
      await (WPP as any).contact.addContact(jid, contactName);
      return `✅ Kontak ${contactName} (${phoneNumber}) berhasil disimpan ke buku telepon.`;
    } else {
      return `❌ Gagal menyimpan kontak (Device Web WA biasanya tidak diizinkan manipulasi root Contacts tanpa otoritas HP). Coba gunakan alias internal bot saja.`;
    }
  } catch (err) {
    return `❌ Sistem Gagal menyimpan kontak: ${String(err)}`;
  }
}
