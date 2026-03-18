/**
 * Delay execution (used for rate limiting / retry)
 */
export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));