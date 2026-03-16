import { fetchGroqAPI } from '../core/groq';
import { memoryManager } from '../core/memory';
import { formatWaktuSekarang } from '../utils/helpers';
import { CONFIG } from '../config';

export async function askAI(teksUser: string, idChat: string): Promise<string | null> {
  try {
    if (!teksUser || teksUser.trim().length === 0) return null;

    memoryManager.addMessage(idChat, { 
      role: "user", 
      content: teksUser.substring(0, 500) 
    });

    const systemMessage = {
      role: "system",
      content: `Kamu asisten WhatsApp. Waktu: ${formatWaktuSekarang()} WIB. Jawab singkat max 2 kalimat, gaya casual, jangan ngaku AI.`
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
    return "Maaf bro, sistem lagi gangguan 🙏";
  }
}