// src/features/ai-assistant/ai-tools.ts
//
// Definisi "alat" yang bisa digunakan oleh AI saat menjawab.
// Format ini mengikuti spesifikasi OpenAI Function Calling.
// Groq API kompatibel dengan format yang sama.

// Tipe untuk definisi satu tool/function
interface AiToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, { type: string; description?: string }>;
      required: string[];
    };
  };
}

export const AI_TOOLS: AiToolDefinition[] = [
  {
    type: 'function',
    function: {
      name: 'searchInternet',
      description:
        'Cari informasi terbaru di internet. Gunakan pertanyaan alami yang jelas seperti manusia mencari di Google.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Kata kunci atau pertanyaan yang akan dicari',
          },
        },
        required: ['query'],
      },
    },
  },
];
