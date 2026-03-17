/*
 * 
 * Type Definitions
 * 
 * berisi struktur data dari aplikasi yang digunakan 
 * Memusatkan tipe data di sini mencegah terjadinya error "undefined" di kemudian hari.
 * ============================================================================
 */

// objek global bawaan dari library WPPConnect
export type WPPType = any;

// struktur pesan yang dikirim ke api llm
export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool"; 
  
  content?: string | null; 
  // atribut untuk tool web search
  tool_calls?: any[]; 
  tool_call_id?: string;
  name?: string;
}
// untuk receiver
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

  // 5. Context (Quoted / Pesan yang dibalas)
  isReply: boolean;
  idPesanDibalas?: string;
  teksDibalas?: string;

  // 6. Media (Persiapan jika nanti bot mendukung gambar/dokumen)
  hasMedia: boolean;
  mimeType?: string;
}

// struktur command bot
export interface BotCommand {
  // nama command tanpa (!)
  name: string;
  // penjelasan singkat command
  description: string;
  
  /** * Fungsi inti yang dijalankan saat command dipanggil.
   * @param chatId ID obrolan tempat command diketik
   * @param msgId ID pesan untuk membalas spesifik (quoted reply)
   * @param args Argumen tambahan yang diketik setelah command (misal: !echo halo dunia)
   */
  execute: (chatId: string, msgId: string, args: string[]) => Promise<void> | void;
}