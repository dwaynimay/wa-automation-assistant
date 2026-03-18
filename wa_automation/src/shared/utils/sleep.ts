/**
 * Menunda eksekusi selama `ms` milidetik.
 * Dipakai untuk rate limiting dan simulasi jeda manusiawi.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}