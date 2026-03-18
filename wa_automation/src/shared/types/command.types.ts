// Kontrak (interface) yang WAJIB diikuti oleh setiap command bot.
// Ibarat "perjanjian tertulis": kalau kamu mau jadi command, harus punya execute().
export interface BotCommand {
  name: string;         // nama command tanpa tanda seru, misal: "ping"
  description: string;  // penjelasan singkat untuk keperluan dokumentasi

  execute: (
    chatId: string,
    msgId: string,
    args: string[],
  ) => Promise<void> | void;
}