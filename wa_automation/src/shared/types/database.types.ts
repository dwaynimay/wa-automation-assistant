// src/shared/types/database.types.ts
//
// Definisi TypeScript interface untuk semua entitas database.
// File ini murni tipe — tidak ada logika, tidak ada import runtime.
// Dipakai oleh db-client.ts dan layer lain yang butuh representasi data.

// ─── Contact ──────────────────────────────────────────────────────────────────

/**
 * Representasi satu baris dari tabel `contacts`.
 * Menyimpan profil kontak WhatsApp (japri maupun anggota grup).
 */
export interface IContact {
  /** JID WhatsApp unik, contoh: '628123456789@c.us' */
  jid: string;

  /** Nama profil yang ditampilkan di WhatsApp */
  pushname: string | null;

  /**
   * Status whitelist:
   * 1 = AI aktif membalas kontak ini
   * 0 = Bot hanya merekam diam-diam, tidak membalas
   */
  is_whitelist: 0 | 1;

  /** Waktu pertama kontak disimpan (Unix Epoch dalam detik) */
  created_at: number;
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

/**
 * Representasi satu baris dari tabel `chats`.
 * Menyimpan metadata ruang obrolan (room) — bisa japri atau grup.
 */
export interface IChat {
  /** JID room unik, contoh: '628123@c.us' atau '120363@g.us' */
  chat_jid: string;

  /** Nama grup atau nama kontak (nullable untuk chat yang belum punya nama) */
  chat_name: string | null;

  /**
   * Jenis room:
   * 1 = Grup
   * 0 = Personal (japri)
   */
  is_group: 0 | 1;

  /**
   * Status bot per ruangan:
   * 1 = Bot aktif di room ini
   * 0 = Bot dimatikan di room ini (via toggle)
   */
  is_bot_active: 0 | 1;
}

// ─── Message ──────────────────────────────────────────────────────────────────

/**
 * Tipe konten pesan yang dikenali sistem.
 */
export type MessageType =
  | 'chat'
  | 'image'
  | 'video'
  | 'audio'
  | 'ptt'
  | 'document'
  | 'sticker'
  | 'reply';

/**
 * Role pengirim dalam konteks percakapan AI.
 * Mengikuti konvensi OpenAI Chat Completions.
 */
export type MessageRole = 'user' | 'assistant';

/**
 * Representasi satu baris dari tabel `messages`.
 * Ini adalah tabel utama untuk sistem RAG dan forensik media.
 */
export interface IMessage {
  /** ID unik pesan dari WPP.js */
  message_id: string;

  /** JID room tempat pesan dikirim (FK → chats.chat_jid) */
  chat_jid: string;

  /** JID pengirim pesan (FK → contacts.jid) */
  sender_jid: string;

  /**
   * Asal pesan:
   * 1 = Dikirim oleh bot/assistant
   * 0 = Dikirim oleh user/manusia
   */
  is_from_me: 0 | 1;

  /** Role dalam konteks AI conversation */
  role: MessageRole;

  /** Jenis konten pesan */
  message_type: MessageType;

  /** Teks isi pesan atau caption media (null jika media tanpa caption) */
  content: string | null;

  /** ID pesan yang dikutip/dibalas (null jika bukan reply) */
  quoted_message_id: string | null;

  /** Path absolut file media yang disimpan lokal (null jika bukan media) */
  media_file_path: string | null;

  /** MIME type asli dari WhatsApp (null jika bukan media) */
  media_mime_type: string | null;

  /** Ukuran file media dalam bytes (null jika bukan media) */
  media_size: number | null;

  /** Waktu pesan dikirim (Unix Epoch dalam detik) */
  timestamp: number;
}

// ─── Payload Types ────────────────────────────────────────────────────────────
// Tipe khusus untuk data yang dikirim dari browser ke Python backend.
// Dipakai oleh db-client.ts saat membangun request body.

/** Payload untuk endpoint /upsert_contact */
export type UpsertContactPayload = Pick<IContact, 'jid' | 'pushname'>;

/** Payload untuk endpoint /upsert_chat */
export type UpsertChatPayload = Pick<
  IChat,
  'chat_jid' | 'chat_name' | 'is_group'
>;

/** Payload untuk endpoint /save_message */
export type SaveMessagePayload = Omit<
  IMessage,
  'quoted_message_id' | 'media_file_path' | 'media_mime_type' | 'media_size'
> & {
  quoted_message_id?: string;
  media_file_path?: string;
  media_mime_type?: string;
  media_size?: number;
};
