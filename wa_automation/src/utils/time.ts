/**
 * Format current time in Indonesian locale
 */
export const formatCurrentTime = () => {
  return new Date().toLocaleString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
