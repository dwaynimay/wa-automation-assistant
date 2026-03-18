import { BotCommand } from '../../types';
import { pingCommand } from '../../features/ping';

// Menggunakan Map agar performa pencarian command lebih cepat (O(1))
const registry = new Map<string, BotCommand>();

export function registerCommand(cmd: BotCommand) {
  registry.set(cmd.name, cmd);
}

export function getCommand(name: string): BotCommand | undefined {
  return registry.get(name);
}

// Fitur tambahan: bisa mengambil semua command (berguna untuk fitur !help nanti)
export function getAllCommands(): BotCommand[] {
  return Array.from(registry.values());
}

// 📌 DAFTARKAN SEMUA COMMAND KAMU DI SINI
registerCommand(pingCommand);