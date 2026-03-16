import { fetchGroqAPI } from '../core/groq';
import { memoryManager } from '../core/memory';
import { formatWaktuSekarang } from '../utils/helpers';
import { CONFIG } from '../config';

// 👇 Tambahkan senderName sebagai parameter ketiga
export async function askAI(teksUser: string, idChat: string, senderName: string): Promise<string | null> {
  try {
    if (!teksUser || teksUser.trim().length === 0) return null;

    // Masukkan chat user ke memori
    memoryManager.addMessage(idChat, { 
      role: "user", 
      content: teksUser.substring(0, 500) 
    });

    // ==========================================
    // 🧠 SYSTEM PROMPT (OTAK KEPRIBADIAN AI)
    // ==========================================
    const systemMessage = {
      role: "system",
      content: `Kamu adalah asisten pribadi Farrel (mahasiswa Teknik Telekomunikasi Telkom University). 
Saat ini kamu sedang membalas pesan WhatsApp dari seseorang bernama: ${senderName}.

Waktu saat ini: ${formatWaktuSekarang()} WIB.

ATURAN BALASAN:
1. Gunakan bahasa Indonesia yang santai, asik, dan natural seperti sedang chat di WhatsApp.
2. Sapa lawan bicaramu dengan namanya ("${senderName}") agar terasa lebih akrab dan personal.
3. Jika ${senderName} mencari Farrel, sampaikan dengan sopan bahwa Farrel sedang sibuk/kuliah dan kamu membantu membalas pesannya.
4. Balas dengan singkat dan padat (maksimal 2-3 kalimat).
5. JANGAN PERNAH mengaku bahwa kamu adalah AI, bot, atau program komputer.`
    }; 
    
    const payload = {
      model: CONFIG.GROQ_MODEL,
      messages: [systemMessage, ...memoryManager.getHistory(idChat)],
      temperature: 0.7, // 0.7 bagus agar balasannya luwes tapi tetap masuk akal
      max_tokens: 256,
    }; 
    
    // Tembak ke API Groq
    const response = await fetchGroqAPI(payload);
    const finalReply = response.choices[0].message.content.trim(); 
    
    // Simpan balasan AI ke memori
    memoryManager.addMessage(idChat, { role: "assistant", content: finalReply }); 
    return finalReply;
    
  } catch (error) {
    console.error("❌ [askAI Error]:", error);
    // Jika gagal (misal API error), hapus pesan user terakhir dari memori agar urutannya tidak rusak
    memoryManager.removeLastMessage(idChat);
    return "Maaf ya, sistemku lagi ada gangguan sebentar 🙏";
  }
}