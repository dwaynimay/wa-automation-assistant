/**
 * Mengubah string env yang dipisah koma menjadi array string bersih.
 * Contoh: "628111,628222, 628333" → ["628111", "628222", "628333"]
 */
export function parseEnvArray(value?: string): string[] {
  if (!value) return [];

  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}