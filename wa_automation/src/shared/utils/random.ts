/**
 * Menghasilkan bilangan bulat acak antara min dan max (inklusif).
 * Dipakai untuk simulasi jeda mengetik yang terasa natural.
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}