export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));


export const randomInt = (min: number, max: number) => 
  Math.floor(Math.random() * (max - min + 1)) + min;


export const formatWaktuSekarang = () => {
  return new Date().toLocaleString('id-ID', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};