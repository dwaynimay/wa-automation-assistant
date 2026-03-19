// Tipe data untuk pesan yang diproses oleh receiver.
// Ini adalah "bentuk" data yang mengalir dari listener → processor → router.
export interface MessageData {
  // 1. Metadata
  idPesan: string;
  waktu: number;
  fromMe: boolean;

  // 2. Routing & Sender
  idChat: string;
  isGroup: boolean;
  pengirimAsli: string;

  // 3. Contact Info
  namaProfil: string;
  namaKontak: string;
  namaPanggilan: string;

  // 4. Content
  tipePesan: string;
  teks: string;

  // 5. Context (pesan yang dikutip/dibalas)
  isReply: boolean;
  idPesanDibalas?: string;
  teksDibalas?: string;

  // 6. Media (siap untuk fitur gambar/dokumen di masa depan)
  hasMedia: boolean;
  mimeType?: string;
}
