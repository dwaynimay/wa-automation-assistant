/**
 * Memformat tanggal ke format Indonesia yang ramah dibaca.
 * Contoh output: "Rabu, 18 Maret 2026"
 */
export function formatIndonesianDate(date: Date = new Date()): string {
  return date.toLocaleString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
