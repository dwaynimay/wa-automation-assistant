// src/features/ai-assistant/tools/profile-tools.ts
// Mengontrol properti identitas diri (Profil Web) dan Katalog.

import { getWPP } from '../../../core/wpp';

export async function updateProfileStatus(text: string): Promise<string> {
  const WPP = getWPP();
  if (!WPP) return 'Error: WPP belum siap.';

  try {
    await (WPP as any).profile.setMyStatus(text);
    return `✅ Bio/Status WA Anda berhasil diubah menjadi: "${text}"`;
  } catch (err) {
    return `❌ Gagal mengubah bio status: ${String(err)}`;
  }
}

export async function updateProfileName(name: string): Promise<string> {
  const WPP = getWPP();
  if (!WPP) return 'Error: WPP belum siap.';

  try {
    await (WPP as any).profile.setMyProfileName(name);
    return `✅ Nama profil tampilan WA berhasil diubah menjadi: "${name}"`;
  } catch (err) {
    return `❌ Gagal mengubah nama profil: ${String(err)}`;
  }
}

export async function getBusinessCatalog(contactJid: string): Promise<string> {
  const WPP = getWPP();
  if (!WPP) return 'Error: WPP belum siap.';

  try {
    const products = await (WPP as any).catalog.getProducts(contactJid);
    if (!products || products.length === 0) {
      return `❌ Tidak ada katalog produk yang ditemukan pada kontak ${contactJid}.`;
    }

    const output = products.map((p: any, i: number) => {
      const price = p.priceAmount1000 ? `Rp${p.priceAmount1000 / 1000}` : 'Harga tidak tertera';
      return `${i + 1}. **${p.name}**\n   - Harga: ${price}\n   - Deskripsi: ${p.description || '-'}\n   - Link: ${p.url || '-'}`;
    });

    return `🛍️ Katalog Produk (${products.length} item):\n\n${output.join('\n\n')}`;
  } catch (err) {
    return `❌ Gagal mengambil katalog: ${String(err)}`;
  }
}
