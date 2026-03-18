export function parseEnvArray(value?: string): string[] {
  if (!value) return [];

  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}