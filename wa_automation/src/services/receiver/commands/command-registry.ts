// src/services/receiver/commands/command-registry.ts
//
// Registry terpusat untuk semua command bot.
// Menggunakan Map<string, BotCommand> agar pencarian O(1) — sangat cepat.
// Untuk menambah command baru, cukup import dan panggil registerCommand() di bawah.

import type { BotCommand } from '../../../shared/types'; // ✅
import { pingCommand } from '../../../features/commands'; // ✅ (akan kita buat di sesi features)

const registry = new Map<string, BotCommand>();

export function registerCommand(command: BotCommand): void {
  registry.set(command.name, command);
  console.log(`[CommandRegistry] Command terdaftar: !${command.name}`);
}

export function getCommand(name: string): BotCommand | undefined {
  return registry.get(name);
}

export function getAllCommands(): BotCommand[] {
  return Array.from(registry.values());
}

// ─── Daftarkan semua command di sini ───────────────────────────────────────
registerCommand(pingCommand);
