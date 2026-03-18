// Tipe data untuk percakapan yang dikirim ke Groq/LLM API.
// Mengikuti format standar OpenAI Chat Completions.
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content?: string | null;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
  name?: string;
}

// Tipe untuk tool call yang dikembalikan AI (misal: searchInternet)
export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}