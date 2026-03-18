/**
 * Format current time in Indonesian locale
 */
export function formatIndonesianDate(date: Date = new Date()): string {
  return date.toLocaleString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
