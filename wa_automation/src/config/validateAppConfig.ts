import { appConfig } from './appConfig';

export function validateAppConfig(): void {
  if (!appConfig.groqApiKey || appConfig.groqApiKey.includes('YOUR_API_KEY')) {
    throw new Error('VITE_GROQ_API_KEY belum dikonfigurasi dengan benar.');
  }
}