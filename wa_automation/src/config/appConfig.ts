export const appConfig = {
  groqApiKey: import.meta.env.VITE_GROQ_API_KEY || '',
  groqBaseUrl: 'https://api.groq.com/openai/v1',
  groqModel: 'meta-llama/llama-4-scout-17b-16e-instruct',
  maxHistory: 10,
} as const;