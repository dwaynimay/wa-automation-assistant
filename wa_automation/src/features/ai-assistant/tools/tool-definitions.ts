// Definisi JSON schema semua tools untuk Groq AI
// Format ini mengikuti standar OpenAI Function Calling

interface AiToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, { type: string; description?: string; enum?: string[] }>;
      required: string[];
    };
  };
}

export const ALL_TOOL_DEFINITIONS: AiToolDefinition[] = [

  // ── Tools Lama (sudah ada) ──────────────────────────────────────────────────
  {
    type: 'function',
    function: {
      name: 'searchInternet',
      description: 'Cari informasi terbaru di internet menggunakan DuckDuckGo.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Kata kunci pencarian' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'saveUserMemory',
      description: 'Simpan fakta penting tentang pengguna ke memori jangka panjang.',
      parameters: {
        type: 'object',
        properties: {
          fact: { type: 'string', description: 'Fakta yang ingin disimpan' },
        },
        required: ['fact'],
      },
    },
  },

  // ── Tools Baru: Kontak ──────────────────────────────────────────────────────
  {
    type: 'function',
    function: {
      name: 'searchContactByName',
      description: 'WAJIB DIGUNAKAN LANGSUNG TANPA BERTANYA BALIK jika user meminta dicarikan nomor/kontak seseorang (contoh: "nomor si budi", "no farrel berapa", "cari kontak andi"). AI harus langsung memanggil tool ini menggunakan kata kunci/nama yang disebutkan oleh user.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Nama kontak yang dicari' },
        },
        required: ['name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'checkNumberExists',
      description: 'Pengecekan apakah nomor HP terdaftar di WA SEKALIGUS melacak/mencari tahu NAMA (Pushname) dari nomor tersebut. Sangat berguna bila user bertanya "Ini nomornya siapa?".',
      parameters: {
        type: 'object',
        properties: {
          phoneNumber: { type: 'string', description: 'Nomor telepon format internasional, misal: 628123456789' },
        },
        required: ['phoneNumber'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getContactProfile',
      description: 'Ambil info profil WhatsApp seseorang (nama, bio, foto).',
      parameters: {
        type: 'object',
        properties: {
          jid: { type: 'string', description: 'JID WhatsApp target, misal: 628xxx@c.us' },
        },
        required: ['jid'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'sendTextStatus',
      description: 'Membuat atau mengirim Status (Story) teks ke akun WhatsApp bot/sendiri. Orang lain akan bisa melihat update story AI.',
      parameters: {
        type: 'object',
        properties: {
          text: { type: 'string', description: 'Isi teks yang akan diupdate ke story' },
          backgroundColor: { type: 'string', description: 'Warna latar belakang berupa HEX, misal "#FF5733", "#000000"' }
        },
        required: ['text'],
      },
    },
  },

  // ── Tools Baru: Chat ────────────────────────────────────────────────────────
  {
    type: 'function',
    function: {
      name: 'sendMessageToNumber',
      description: 'Kirim pesan teks ke nomor WhatsApp tertentu atas permintaan user.',
      parameters: {
        type: 'object',
        properties: {
          phoneNumber: { type: 'string', description: 'Nomor tujuan, misal: 628123456789' },
          message: { type: 'string', description: 'Isi pesan yang akan dikirim' },
        },
        required: ['phoneNumber', 'message'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'bulkSendMessage',
      description: 'Kirim pesan yang sama ke banyak nomor sekaligus. Maksimal 50 nomor.',
      parameters: {
        type: 'object',
        properties: {
          phoneNumbers: {
            type: 'string',
            description: 'Daftar nomor dipisah koma, misal: "628111,628222,628333"',
          },
          message: { type: 'string', description: 'Isi pesan yang akan dikirim ke semua nomor' },
        },
        required: ['phoneNumbers', 'message'],
      },
    },
  },

  // ── Tools Baru: Status ──────────────────────────────────────────────────────
  {
    type: 'function',
    function: {
      name: 'getUnseenStatuses',
      description: 'Lihat status/story WhatsApp semua kontak tanpa menandai sudah dilihat (mode ghost).',
      parameters: {
        type: 'object',
        properties: {
          markAsSeen: {
            type: 'string',
            description: 'Tandai sebagai sudah dilihat? Isi "true" atau "false". Default: false (mode ghost)',
            enum: ['true', 'false'],
          },
        },
        required: [],
      },
    },
  },

  // ── Tools Baru: Reaksi ──────────────────────────────────────────────────────
  {
    type: 'function',
    function: {
      name: 'reactToMessage',
      description: 'Berikan reaksi emoji ke sebuah pesan WhatsApp.',
      parameters: {
        type: 'object',
        properties: {
          chatId: { type: 'string', description: 'JID chat tempat pesan berada' },
          msgId: { type: 'string', description: 'ID pesan yang ingin direaksi' },
          emoji: {
            type: 'string',
            description: 'Emoji reaksi',
            enum: ['👍', '❤️', '😂', '😮', '😢', '🙏', '🔥', '🎉', '👏', '💯'],
          },
        },
        required: ['chatId', 'msgId', 'emoji'],
      },
    },
  },

  // ── Tools Baru: Advanced Messages ──────────────────────────────────────────
  {
    type: 'function',
    function: {
      name: 'createPoll',
      description: 'Membuat pertanyaan polling/voting interaktif di obrolan.',
      parameters: {
        type: 'object',
        properties: {
          chatId: { type: 'string', description: 'JID chat (bisa grup/pribadi) tempat voting berlangsung' },
          title: { type: 'string', description: 'Pertanyaan atau judul polling' },
          optionsString: { type: 'string', description: 'Pilihan jawaban, gabungkan menjadi satu teks dengan separator koma, misal: "Bakso, Mie Ayam, Nasi Goreng"' },
          selectableChoices: { type: 'string', description: 'Berapa jumlah maksimal pilihan yang bisa dipilih user (isi angka saja misal "1")' }
        },
        required: ['chatId', 'title', 'optionsString'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'sendLocation',
      description: 'Kirim koordinat titik lokasi akurat ke peta pengguna.',
      parameters: {
        type: 'object',
        properties: {
          chatId: { type: 'string', description: 'JID chat tempat lokasi dikirim' },
          latitude: { type: 'string', description: 'Koordinat Garis Lintang (Latitude)' },
          longitude: { type: 'string', description: 'Koordinat Garis Bujur (Longitude)' },
          title: { type: 'string', description: 'Nama Lokasi Peta' }
        },
        required: ['chatId', 'latitude', 'longitude', 'title'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'sendContactCard',
      description: 'Membagikan nomor WA relasi dlm bentuk profil (kartu vCard) shg penerima dapat lgsg auto-save.',
      parameters: {
        type: 'object',
        properties: {
          chatId: { type: 'string', description: 'JID chat yang dikirimi kontak' },
          targetPhoneNumber: { type: 'string', description: 'No HP target yg mau dibagikan (format +62/62..)' },
          targetName: { type: 'string', description: 'Nama untuk melabeli kontak tsb' }
        },
        required: ['chatId', 'targetPhoneNumber', 'targetName'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'convertUrlToSticker',
      description: 'Otomatis membuat custom Stiker WhatsApp dari Link URL Gambar JPG/PNG dlm web internet.',
      parameters: {
        type: 'object',
        properties: {
          chatId: { type: 'string', description: 'JID chat tujuan pengiriman stiker' },
          imageUrl: { type: 'string', description: 'URL link image yang akan dicetak via bot jadi stiker' }
        },
        required: ['chatId', 'imageUrl'],
      },
    },
  },

  {
    type: 'function',
    function: {
      name: 'sendMediaFromUrl',
      description: 'Mendownload dokumen/gambar/video High-Resolution via Internet URL dan langsung membagikannya ke chat WA.',
      parameters: {
        type: 'object',
        properties: {
          chatId: { type: 'string', description: 'JID chat tujuan' },
          url: { type: 'string', description: 'URL Web Tautan Publik Unduhan File (Media Link)' },
          filename: { type: 'string', description: 'Judul file untuk hasil downloadnya (beserta ektensinya: misal laporan.pdf)' },
          caption: { type: 'string', description: 'Teks komentar / keterangan foto (Opsional)' }
        },
        required: ['chatId', 'url', 'filename'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'markChatAsReadOrUnread',
      description: 'Memanipulasi tanda biru pesan obrolan, ditandai dibaca atau ditarik jadi belum dibaca alias unread.',
      parameters: {
        type: 'object',
        properties: {
          chatId: { type: 'string', description: 'JID chat/kontak target' },
          read: { type: 'string', description: 'Isi "true" jika ingin di mark as read, "false" bila mark AS unread (titik hijau)', enum: ['true', 'false'] }
        },
        required: ['chatId', 'read'],
      },
    },
  },

  // ── Tools Baru: Chat Manager (Pemanipulasian Chat) ────────────────────────
  {
    type: 'function',
    function: {
      name: 'archiveChat',
      description: 'Mengarsipkan atau mengembalikan chat dari arsip (Archive).',
      parameters: {
        type: 'object',
        properties: {
          chatId: { type: 'string', description: 'JID chat target' },
          archive: { type: 'string', description: 'Isi "true" untuk arsip, "false" untuk dikeluarkan dari arsip', enum: ['true', 'false'] }
        },
        required: ['chatId', 'archive'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'pinChat',
      description: 'Menyematkan (pin) obrolan ke bagian atas riwayat pesan atau melepas sematan.',
      parameters: {
        type: 'object',
        properties: {
          chatId: { type: 'string', description: 'JID chat target' },
          pin: { type: 'string', description: 'Isi "true" pasang pin, "false" untuk lepas pin', enum: ['true', 'false'] }
        },
        required: ['chatId', 'pin'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'clearChat',
      description: 'Membersihkan (clear) secara permanen seluruh riwayat obrolan di chat tertentu.',
      parameters: {
        type: 'object',
        properties: {
          chatId: { type: 'string', description: 'JID chat target' }
        },
        required: ['chatId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'deleteMessage',
      description: 'Menarik kembali pesan WA yg sudah dikirim (Delete for everyone) atau yg ingin dihapus.',
      parameters: {
        type: 'object',
        properties: {
          chatId: { type: 'string', description: 'JID chat dari pesan tersebut' },
          msgId: { type: 'string', description: 'ID pesan WhatsApp yang ingin ditarik/dihapus' },
          revoke: { type: 'string', description: 'Isi "true" artinya Tarik semua orang, "false" Hapus untuk saya', enum: ['true', 'false'] }
        },
        required: ['chatId', 'msgId', 'revoke'],
      },
    },
  },

  // ── Tools Baru: Group Manager (Super Admin) ───────────────────────────────
  {
    type: 'function',
    function: {
      name: 'createGroup',
      description: 'Membuat grup WhatsApp baru secara otomatis dan mengundang anggotanya.',
      parameters: {
        type: 'object',
        properties: {
          groupName: { type: 'string', description: 'Nama untuk grup baru' },
          participantsString: { type: 'string', description: 'Daftar nomor HP partisipan awal, pisahkan dengan koma (contoh: 628111, 628222)' }
        },
        required: ['groupName', 'participantsString'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'addParticipants',
      description: 'Menambahkan (invite) satu atau lebih orang ke dalam sebuah grup (bot harus admin).',
      parameters: {
        type: 'object',
        properties: {
          groupId: { type: 'string', description: 'JID grup target (@g.us)' },
          participantsString: { type: 'string', description: 'Daftar nomor HP partisipan untuk ditambahkan, dipisah koma' }
        },
        required: ['groupId', 'participantsString'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'removeParticipants',
      description: 'Mengeluarkan atau menendang (kick) orang dari grup (bot harus admin).',
      parameters: {
        type: 'object',
        properties: {
          groupId: { type: 'string', description: 'JID grup target' },
          participantsString: { type: 'string', description: 'Daftar nomor HP orang yang ingin dikick, dipisah koma' }
        },
        required: ['groupId', 'participantsString'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'updateGroupAdmin',
      description: 'Mengangkat orang menjadi super admin grup atau mencopot jabatannya.',
      parameters: {
        type: 'object',
        properties: {
          groupId: { type: 'string', description: 'JID grup target' },
          participantsString: { type: 'string', description: 'Daftar nomor HP orang yang ingin diangkat/dicopot, dipisah koma' },
          promote: { type: 'string', description: 'Isi "true" jadikan admin, "false" turunkan pangkat dari admin', enum: ['true', 'false'] }
        },
        required: ['groupId', 'participantsString', 'promote'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'updateGroupInfo',
      description: 'Mengganti nama grup (subject) atau memodifikasi deskripsi (bio) grup.',
      parameters: {
        type: 'object',
        properties: {
          groupId: { type: 'string', description: 'JID grup target' },
          type: { type: 'string', description: 'Pilih tipe informasi yang dirubah', enum: ['subject', 'description'] },
          text: { type: 'string', description: 'Teks baru' }
        },
        required: ['groupId', 'type', 'text'],
      },
    },
  },

  // ── Tools Baru: Profile & Business Lanjutan ─────────────────────────────────
  {
    type: 'function',
    function: {
      name: 'updateProfileStatus',
      description: 'Mengubah teks bio/About pada profil WhatsApp bot ini sendiri.',
      parameters: {
        type: 'object',
        properties: {
          text: { type: 'string', description: 'Teks bio yang baru' }
        },
        required: ['text'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'updateProfileName',
      description: 'Mengubah nama tampilan Profil WhatsApp bot ini sendiri.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Nama profil yang baru' }
        },
        required: ['name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getBusinessCatalog',
      description: 'Melihat dan mengambil daftar produk (katalog) dari kontak Akun WhatsApp Bisnis orang lain.',
      parameters: {
        type: 'object',
        properties: {
          contactJid: { type: 'string', description: 'JID Kontak target (contoh: 628xxx@c.us)' }
        },
        required: ['contactJid'],
      },
    },
  }
];