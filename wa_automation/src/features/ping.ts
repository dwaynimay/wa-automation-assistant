export function handlePing(): string {
  const pingTime = Math.floor(Math.random() * 50) + 10; // Cuma simulasi angka ping
  return `🏓 Pong! Bot aktif bro.\nLatency: ${pingTime}ms`;
}