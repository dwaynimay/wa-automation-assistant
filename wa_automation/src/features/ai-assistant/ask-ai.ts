// src/features/ai-assistant/ask-ai.ts
//
// Orkestrator utama AI assistant.
// Alur kerja:
//   1. Siapkan pesan user (format reply jika perlu)
//   2. Simpan ke memory
//   3. [RAG] Cari memori jangka panjang dari ChromaDB via backend
//   4. Kirim ke Groq (tembakan pertama)
//   5a. Jika AI minta tool → jalankan tool → kirim lagi (tembakan kedua)
//   5b. Jika AI langsung menjawab → kembalikan jawaban
//   6. Simpan jawaban ke memory
// src/features/ai-assistant/ask-ai.ts

import { fetchGroqApi } from '../../core/groq';
import { searchInternet } from '../web-search';
import { memoryManager } from './memory-manager';
import { buildSystemPrompt } from './prompt-builder';
import { AI_TOOLS } from './ai-tools';
import { appConfig } from '../../config';
import { MAX_USER_MESSAGE_LENGTH } from '../../shared/constants';
import { dbManager } from '../../core';

// ─── RAG Debug Logger ─────────────────────────────────────────────────────────
function logRag(step: string, data?: unknown): void {
  const ts = new Date().toLocaleTimeString('id-ID');
  if (data !== undefined) {
    console.group(`%c[RAG] ${step} — ${ts}`, 'color: #00bcd4; font-weight: bold;');
    console.log(data);
    console.groupEnd();
  } else {
    console.log(`%c[RAG] ${step} — ${ts}`, 'color: #00bcd4; font-weight: bold;');
  }
}

// ─── Tool Handler ─────────────────────────────────────────────────────────────
async function executeTool(
  toolName: string,
  toolArgs: string,
  senderJid: string,
  senderName: string,
): Promise<string> {
  if (toolName === 'searchInternet') {
    const { query } = JSON.parse(toolArgs) as { query: string };
    console.log(`[AskAI] 🔍 Web search: "${query}"`);
    return await searchInternet(query);
  }

  if (toolName === 'saveUserMemory') {
    const { fact } = JSON.parse(toolArgs) as { fact: string };
    logRag(`💾 AI menyimpan memori baru untuk ${senderName}:`, { fakta: fact, jid: senderJid });
    await dbManager.addMemory({ jid: senderJid, fact });
    logRag(`✅ Memori tersimpan! Akan muncul di percakapan berikutnya.`, { fakta: fact });
    return `[SISTEM] Fakta berhasil disimpan: "${fact}". Lanjutkan percakapan secara natural.`;
  }

  return `[ERROR] Tool "${toolName}" tidak dikenali.`;
}

// ─────────────────────────────────────────────────────────────────────────────

export async function askAI(
  teksUser: string,
  idChat: string,
  senderName: string,
  senderJid: string,
  isReply: boolean = false,
  teksDibalas?: string,
): Promise<string | null> {
  if (!teksUser.trim()) return null;

  const teksAkhir =
    isReply && teksDibalas
      ? `[Me-reply pesan: "${teksDibalas}"]\nBalasan ${senderName}: "${teksUser}"`
      : teksUser;

  memoryManager.addMessage(idChat, {
    role: 'user',
    content: teksAkhir.substring(0, MAX_USER_MESSAGE_LENGTH),
  });

  // ── [RAG] Cari memori jangka panjang ──────────────────────────────────────
  logRag(`Mulai pencarian memori untuk: ${senderName} (${senderJid})`);

  let memoriesText = '';
  try {
    const memories = await dbManager.searchMemories({
      jid: senderJid,
      query: teksAkhir,
      limit: 3,
    });

    if (memories && memories.length > 0) {
      logRag(`✅ ${memories.length} memori ditemukan:`, memories.map((m, i) => ({
        nomor: i + 1,
        fakta: m.fact,
        distance: m.distance?.toFixed(4) ?? 'N/A',
        relevansi: !m.distance ? 'N/A'
          : m.distance < 0.5 ? '🟢 Sangat Relevan'
          : m.distance < 0.8 ? '🟡 Cukup Relevan'
          : '🔴 Kurang Relevan',
      })));
      memoriesText = memories.map((m, i) => `${i + 1}. ${m.fact}`).join('\n');
    } else {
      logRag('⚠️ Tidak ada memori ditemukan untuk pengguna ini.');
    }
  } catch (error) {
    logRag('❌ Gagal mengambil memori ChromaDB:', error);
  }

  const systemPrompt = buildSystemPrompt(senderName, memoriesText);

  logRag('📊 Konteks yang dikirim ke AI:', {
    pengirim: senderName,
    riwayat_chat_pendek: `${memoryManager.getHistory(idChat).length} pesan`,
    memori_jangka_panjang: memoriesText ? `${memoriesText.split('\n').length} fakta` : 'Tidak ada',
  });

  try {
    // ── Tembakan Pertama ───────────────────────────────────────────────────
    const response1 = await fetchGroqApi({
      model: appConfig.groqModel,
      messages: [systemPrompt, ...memoryManager.getHistory(idChat)],
      tools: AI_TOOLS,
      tool_choice: 'auto',
      temperature: 0.6,
      max_tokens: 1024,
    });

    const messageAI = response1.choices[0].message;

    // ── Cabang: AI Meminta Tool ────────────────────────────────────────────
    if (messageAI.tool_calls && messageAI.tool_calls.length > 0) {
      // PENTING: Simpan respons AI (beserta tool_calls-nya) ke history dulu.
      // Tanpa ini, tembakan kedua akan error karena history tidak konsisten.
      memoryManager.addMessage(idChat, messageAI);

      // Jalankan semua tool yang diminta (bisa lebih dari 1 sekaligus)
      for (const toolCall of messageAI.tool_calls) {
        const hasilTool = await executeTool(
          toolCall.function.name,
          toolCall.function.arguments,
          senderJid,
          senderName,
        );

        memoryManager.addMessage(idChat, {
          role: 'tool',
          tool_call_id: toolCall.id,
          name: toolCall.function.name,
          content: hasilTool,
        });
      }

      // ── Tembakan Kedua: AI merangkum semua hasil tool ─────────────────
      const response2 = await fetchGroqApi({
        model: appConfig.groqModel,
        messages: [systemPrompt, ...memoryManager.getHistory(idChat)],
        temperature: 0.6,
        max_tokens: 1024,
      });

      const finalReply = response2.choices[0].message.content?.trim() ?? 'Hmm...';
      memoryManager.addMessage(idChat, { role: 'assistant', content: finalReply });
      return finalReply;
    }

    // ── Cabang: AI Menjawab Langsung ───────────────────────────────────────
    const reply = messageAI.content?.trim() ?? 'Hmm...';
    memoryManager.addMessage(idChat, { role: 'assistant', content: reply });
    return reply;

  } catch (error: unknown) {
    console.error('[AskAI] Error:', error);
    memoryManager.removeLastMessage(idChat);
    const pesanError = error instanceof Error ? error.message : 'Tidak diketahui';
    return `Maaf ya, sistemku lagi ada gangguan sebentar 🙏\n\nDetail: ${pesanError}`;
  }
}
