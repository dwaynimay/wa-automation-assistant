// src/features/ai-assistant/ask-ai.ts
//
// Orkestrator utama AI assistant.
// Alur kerja:
//   1. Siapkan pesan user (format reply jika perlu)
//   2. Simpan ke memory
//   3. Kirim ke Groq (tembakan pertama)
//   4a. Jika AI minta tool → jalankan tool → kirim lagi (tembakan kedua)
//   4b. Jika AI langsung menjawab → kembalikan jawaban
//   5. Simpan jawaban ke memory

import { fetchGroqApi }       from '../../core/groq';          // ✅
import { searchInternet }     from '../web-search';             // ✅
import { memoryManager }      from './memory-manager';
import { buildSystemPrompt }  from './prompt-builder';
import { AI_TOOLS }           from './ai-tools';
import { appConfig }          from '../../config';              // ✅
import { MAX_USER_MESSAGE_LENGTH } from '../../shared/constants'; // ✅

export async function askAI(
  teksUser: string,
  idChat: string,
  senderName: string,
  isReply: boolean = false,
  teksDibalas?: string,
): Promise<string | null> {

  // Guard: abaikan pesan kosong
  if (!teksUser.trim()) return null;

  // Format ulang teks jika ini adalah balasan atas pesan lain
  const teksAkhir = isReply && teksDibalas
    ? `[Me-reply pesan: "${teksDibalas}"]\nBalasan ${senderName}: "${teksUser}"`
    : teksUser;

  // Simpan pesan user ke memory (potong jika terlalu panjang)
  memoryManager.addMessage(idChat, {
    role: 'user',
    content: teksAkhir.substring(0, MAX_USER_MESSAGE_LENGTH),
  });

  const systemPrompt = buildSystemPrompt(senderName);

  try {
    // ── Tembakan Pertama ──────────────────────────────────────────────────
    const response1 = await fetchGroqApi({
      model:        appConfig.groqModel,
      messages:     [systemPrompt, ...memoryManager.getHistory(idChat)],
      tools:        AI_TOOLS,
      tool_choice:  'auto',
      temperature:  0.6,
      max_tokens:   1024,
    });

    const messageAI = response1.choices[0].message;

    // ── Cabang: AI Meminta Tool (Web Search) ─────────────────────────────
    if (messageAI.tool_calls && messageAI.tool_calls.length > 0) {
      const toolCall = messageAI.tool_calls[0];
      const args     = JSON.parse(toolCall.function.arguments) as { query: string };

      console.log(`[AskAI] AI meminta web search: "${args.query}"`);
      const hasilSearch = await searchInternet(args.query);

      // Simpan hasil tool ke memory agar AI tahu konteksnya
      memoryManager.addMessage(idChat, messageAI);
      memoryManager.addMessage(idChat, {
        role:        'tool',
        tool_call_id: toolCall.id,
        name:        'searchInternet',
        content:     hasilSearch,
      });

      // ── Tembakan Kedua (dengan hasil search) ─────────────────────────
      const response2 = await fetchGroqApi({
        model:       appConfig.groqModel,
        messages:    [systemPrompt, ...memoryManager.getHistory(idChat)],
        temperature: 0.6,
        max_tokens:  1024,
      });

      const finalReply = response2.choices[0].message.content?.trim() ?? 'Hmm...';
      memoryManager.addMessage(idChat, { role: 'assistant', content: finalReply });
      return finalReply;
    }

    // ── Cabang: AI Menjawab Langsung (Chat Biasa) ────────────────────────
    const reply = messageAI.content?.trim() ?? 'Hmm...';
    memoryManager.addMessage(idChat, { role: 'assistant', content: reply });
    return reply;

  } catch (error: unknown) {
    console.error('[AskAI] Error:', error);

    // Hapus pesan user yang baru ditambahkan agar history tidak kotor
    memoryManager.removeLastMessage(idChat);

    const pesanError = error instanceof Error
      ? error.message
      : 'Tidak diketahui';

    return `Maaf ya, sistemku lagi ada gangguan sebentar 🙏\n\nDetail: ${pesanError}`;
  }
}