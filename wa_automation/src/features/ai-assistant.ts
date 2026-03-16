import { fetchGroqAPI } from '../core/groq';
import { memoryManager } from '../core/memory';
import { formatWaktuSekarang } from '../utils/helpers';
import { CONFIG } from '../config';

// 👇 Tambahkan parameter isReply dan teksDibalas
export async function askAI(
  teksUser: string, 
  idChat: string, 
  senderName: string,
  isReply: boolean = false,
  teksDibalas: string | undefined = undefined
): Promise<string | null> {
  try {
    if (!teksUser || teksUser.trim().length === 0) return null;

    // ==========================================
    // 🧠 LOGIKA PENGGABUNGAN TEKS REPLY
    // ==========================================
    let teksAkhir = teksUser;
    
    // Kalau dia nge-reply sesuatu, kita kasih konteks ke AI
    if (isReply && teksDibalas) {
      teksAkhir = `[Me-reply pesan: "${teksDibalas}"]\nBalasan ${senderName}: "${teksUser}"`;
    }

    // Masukkan chat (yang sudah dikasih konteks) ke memori
    memoryManager.addMessage(idChat, { 
      role: "user", 
      content: teksAkhir.substring(0, 800) // Sedikit dipanjangkan limitnya karena ada teks reply
    });

    const systemMessage = {
      role: "system",
      content: `Kamu adalah asisten pribadi Farrel (mahasiswa Teknik Telekomunikasi Telkom University). 
Saat ini kamu sedang membalas pesan WhatsApp dari seseorang bernama: ${senderName}.

Waktu saat ini: ${formatWaktuSekarang()} WIB.

ATURAN BALASAN:
1. Gunakan bahasa Indonesia yang santai, asik, dan natural seperti sedang chat di WhatsApp.
2. Sapa lawan bicaramu dengan namanya ("${senderName}") agar terasa lebih akrab dan personal.
3. Jika ${senderName} mencari Farrel, sampaikan bahwa Farrel sedang sibuk/kuliah.
4. Jika ada format [Me-reply pesan: "..."], itu berarti ${senderName} sedang membalas obrolan sebelumnya. Pahami konteksnya!
5. Balas dengan singkat dan padat (maksimal 2-3 kalimat).
6. JANGAN PERNAH mengaku bahwa kamu adalah AI, bot, atau program komputer.`
    }; 
    
    const payload = {
      model: CONFIG.GROQ_MODEL,
      messages: [systemMessage, ...memoryManager.getHistory(idChat)],
      temperature: 0.7,
      max_tokens: 256,
    }; 
    
    const response = await fetchGroqAPI(payload);
    const finalReply = response.choices[0].message.content.trim(); 
    
    memoryManager.addMessage(idChat, { role: "assistant", content: finalReply }); 
    return finalReply;
    
  } catch (error) {
    console.error("❌ [askAI Error]:", error);
    memoryManager.removeLastMessage(idChat);
    return "Maaf ya, sistemku lagi ada gangguan sebentar 🙏";
  }
}