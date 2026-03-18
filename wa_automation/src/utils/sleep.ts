/**
 * Delay execution (used for rate limiting / retry)
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}