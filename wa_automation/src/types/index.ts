export type WPPType = any;

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}




export interface MessageData {
  // 1. Metadata
  idPesan: string;
  waktu: number;
  fromMe: boolean;

  // 2. Routing & Sender
  idChat: string;
  isGroup: boolean;
  pengirimAsli: string; // Nomor WA asli (berguna saat di grup)

  // 3. Contact Info
  namaProfil: string;
  namaKontak: string;
  namaPanggilan: string;

  // 4. Content
  tipePesan: string;
  teks: string;

  // 5. Context (Quoted)
  isReply: boolean;
  idPesanDibalas?: string;
  teksDibalas?: string;

  // 6. Media (Opsional/Masa Depan)
  hasMedia: boolean;
  mimeType?: string;
}




export interface WAMessage {
  id: {
    fromMe: boolean;
    _serialized?: string;
  };
  from: string | any;
  body: string;
  isGroup: boolean;
}

export interface BotCommand {
  name: string;
  description: string;
  execute: (chatId: string, msgId: string, args: string[]) => Promise<void> | void;
}