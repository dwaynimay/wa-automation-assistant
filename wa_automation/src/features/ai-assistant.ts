import { fetchGroqAPI } from '../core/groq';
import { memoryManager } from '../core/memory';
import { formatWaktuSekarang } from '../utils/helpers';
import { CONFIG } from '../config';
import { searchInternet } from './web-search';

// 🛠️ DAFTAR ALAT PERSIS SEPERTI DI SCRIPT LAMA
const aiTools = [
  {
    type: 'function',
    function: {
      name: 'searchInternet',
      description:
        'Cari informasi terbaru di internet. Gunakan pertanyaan alami yang jelas seperti manusia mencari di Google.',
      parameters: {
        type: 'object',
        properties: { query: { type: 'string' } },
        required: ['query'],
      },
    },
  },
];

export async function askAI(
  teksUser: string,
  idChat: string,
  senderName: string,
  isReply: boolean = false,
  teksDibalas: string | undefined = undefined,
): Promise<string | null> {
  try {
    if (!teksUser || teksUser.trim().length === 0) return null;

    let teksAkhir = teksUser;
    if (isReply && teksDibalas) {
      teksAkhir = `[Me-reply pesan: "${teksDibalas}"]\nBalasan ${senderName}: "${teksUser}"`;
    }

    // 1. Simpan pesan user ke memori
    memoryManager.addMessage(idChat, {
      role: 'user',
      content: teksAkhir.substring(0, 800),
    });

    // 🧠 PROMPT PERSIS SEPERTI SCRIPT LAMA (Ditambah variabel nama pengirim)
    const systemMessage = {
      role: 'system',
      content: `Kamu adalah asisten pribadi Farrel yang membantu membalas pesan WhatsApp ketika Farrel sedang sibuk.
Lawan bicaramu saat ini adalah: ${senderName}.
informasi Waktu saat ini: ${formatWaktuSekarang()} WIB.

Gaya jawaban:
- Gunakan bahasa Indonesia yang ramah
- Jawaban singkat, jelas, dan natural seperti chat WhatsApp
- Jangan terlalu kaku, formal seperti email

Aturan:
1. Jika pertanyaan membutuhkan informasi terbaru, gunakan tool searchInternet.
2. Jika menggunakan data dari tool searchInternet, WAJIB menyalin link yang muncul pada hasil tool.
3. Jangan mengarang link. Hanya gunakan link yang ada pada hasil tool.
4. Format penulisan link di akhir jawaban seperti ini:

Sumber:
https://...

5. Jika user bertanya sesuatu yang perlu konfirmasi tanggal gunakanlah informasi waktu yang telah diberikan.
6. Jika user menanyakan Farrel secara langsung, jelaskan dengan sopan bahwa Farrel sedang cukup sibuk dan kamu membantu membalas pesan.
7. Jangan pernah mengatakan bahwa kamu adalah AI atau bot.

Balasan harus terasa seperti asisten pribadi yang ramah dan profesional.`,
    };

    // 2. TEMBAKAN PERTAMA
    const payload1: any = {
      model: CONFIG.GROQ_MODEL,
      messages: [systemMessage, ...memoryManager.getHistory(idChat)],
      tools: aiTools,
      tool_choice: 'auto', // Kita kembalikan ke auto sesuai script lama
      temperature: 0.6,
      max_tokens: 1024,
    };

    const response1 = await fetchGroqAPI(payload1);
    const messageAI = response1.choices[0].message;

    // ==========================================
    // 🌐 JIKA AI BUTUH BROWSING (TOOL DIPANGGIL)
    // ==========================================
    if (messageAI.tool_calls && messageAI.tool_calls.length > 0) {
      const toolCall = messageAI.tool_calls[0];
      const args = JSON.parse(toolCall.function.arguments);

      const searchResult = await searchInternet(args.query);

      memoryManager.addMessage(idChat, messageAI);
      memoryManager.addMessage(idChat, {
        role: 'tool',
        tool_call_id: toolCall.id,
        name: 'searchInternet',
        content: searchResult,
      });

      // 3. TEMBAKAN KEDUA (Bawa Hasil Browsing)
      const payload2 = {
        model: CONFIG.GROQ_MODEL,
        messages: [systemMessage, ...memoryManager.getHistory(idChat)],
        temperature: 0.6,
        max_tokens: 1024,
      };

      const response2 = await fetchGroqAPI(payload2);
      const finalReply = response2.choices[0].message.content.trim();

      memoryManager.addMessage(idChat, {
        role: 'assistant',
        content: finalReply,
      });
      return finalReply;
    }

    // ==========================================
    // 💬 JIKA AI HANYA NGOBROL BIASA
    // ==========================================
    const reply = messageAI.content ? messageAI.content.trim() : 'Hmm...';
    memoryManager.addMessage(idChat, { role: 'assistant', content: reply });
    return reply;
  } catch (error: any) {
    console.error('❌ [askAI Error]:', error);
    memoryManager.removeLastMessage(idChat);
    const errMsg =
      typeof error === 'string' ? error : error?.message || 'Tidak diketahui';
    return `Maaf ya, sistemku lagi ada gangguan sebentar 🙏\n\nDetail: ${errMsg}`;
  }
}
