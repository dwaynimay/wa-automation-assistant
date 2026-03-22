// src/features/ai-assistant/tools/group-tools.ts
// Fitur: Pembuatan Grup, Tambah/Kick Anggota, Ganti Admin, Ubah Nama/Deskripsi

import { getWPP } from '../../../core/wpp';

/**
 * Membuat grup baru dan langsung menambahkan anggota
 */
export async function createGroup(groupName: string, participantsString: string): Promise<string> {
  const WPP = getWPP();
  if (!WPP) return 'Error: WPP belum siap.';

  try {
    const participants = participantsString.split(',').map(p => {
      const clean = p.replace(/\D/g, '');
      return `${clean}@c.us`;
    });
    
    await (WPP as any).group.create(groupName, participants);
    return `✅ Grup "${groupName}" berhasil dibuat secara otomatis dengan ${participants.length} anggota awal.`;
  } catch (err) {
    return `❌ Gagal membuat grup: ${String(err)}`;
  }
}

/**
 * Menambahkan (invite) orang ke dalam grup yang sudah ada
 */
export async function addParticipants(groupId: string, participantsString: string): Promise<string> {
  const WPP = getWPP();
  if (!WPP) return 'Error: WPP belum siap.';

  try {
    const participants = participantsString.split(',').map(p => {
      const clean = p.replace(/\D/g, '');
      return `${clean}@c.us`;
    });

    await (WPP as any).group.addParticipants(groupId, participants);
    return `✅ ${participants.length} anggota berhasil ditambahkan ke dalam grup ${groupId}.`;
  } catch (err) {
    return `❌ Gagal menambah anggota (Pastikan Anda adalah admin grup): ${String(err)}`;
  }
}

/**
 * Mendepak/Kick orang dari grup
 */
export async function removeParticipants(groupId: string, participantsString: string): Promise<string> {
  const WPP = getWPP();
  if (!WPP) return 'Error: WPP belum siap.';

  try {
    const participants = participantsString.split(',').map(p => {
      const clean = p.replace(/\D/g, '');
      return `${clean}@c.us`;
    });

    await (WPP as any).group.removeParticipants(groupId, participants);
    return `✅ ${participants.length} anggota berhasil dikeluarkan (di-kick) dari grup.`;
  } catch (err) {
    return `❌ Gagal mengeluarkan anggota (Pastikan Anda adalah admin grup): ${String(err)}`;
  }
}

/**
 * Menaikkan pangkat jadi admin, atau menurunkan dari admin
 */
export async function updateGroupAdmin(groupId: string, participantsString: string, promote: boolean = true): Promise<string> {
  const WPP = getWPP();
  if (!WPP) return 'Error: WPP belum siap.';

  try {
    const participants = participantsString.split(',').map(p => {
      const clean = p.replace(/\D/g, '');
      return `${clean}@c.us`;
    });

    if (promote) {
      await (WPP as any).group.promoteParticipants(groupId, participants);
    } else {
      await (WPP as any).group.demoteParticipants(groupId, participants);
    }
    return `✅ ${participants.length} anggota berhasil ${promote ? 'diangkat jadi admin' : 'dicopot gelar adminnya'}.`;
  } catch (err) {
    return `❌ Gagal mengubah status admin: ${String(err)}`;
  }
}

/**
 * Mengubah subject/judul grup atau merubah deskripsinya
 */
export async function updateGroupInfo(groupId: string, type: 'subject' | 'description', text: string): Promise<string> {
  const WPP = getWPP();
  if (!WPP) return 'Error: WPP belum siap.';

  try {
    if (type === 'subject') {
      await (WPP as any).group.setSubject(groupId, text);
    } else {
      await (WPP as any).group.setDescription(groupId, text);
    }
    return `✅ ${type === 'subject' ? 'Nama grup' : 'Deskripsi grup'} berhasil diubah menjadi "${text}".`;
  } catch (err) {
    return `❌ Gagal mengubah info grup: ${String(err)}`;
  }
}

/**
 * Mengatur apakah grup ditutup (Only Admin can talk) atau dibuka
 */
export async function setGroupAnnounce(groupId: string, announceOnly: boolean): Promise<string> {
  const WPP = getWPP();
  if (!WPP) return 'Error: WPP belum siap.';
  try {
    await (WPP as any).group.setProperty(groupId, 'announce', announceOnly);
    return `✅ Grup berhasil diatur: ${announceOnly ? 'HANYA ADMIN yang bisa mengirim pesan' : 'SEMUA ANGGOTA bisa mengirim pesan'}.`;
  } catch(err) {
    return `❌ Gagal mengatur retriksi admin: ${String(err)}`;
  }
}

/**
 * Mengambil tautan link undangan grup
 */
export async function getGroupInviteLink(groupId: string): Promise<string> {
  const WPP = getWPP();
  if (!WPP) return 'Error: WPP belum siap.';
  try {
    const code = await (WPP as any).group.getInviteCode(groupId);
    return `🔗 Link Undangan Grup:\nhttps://chat.whatsapp.com/${code}`;
  } catch(err) {
    return `❌ Gagal memuat link invite: ${String(err)}`;
  }
}
