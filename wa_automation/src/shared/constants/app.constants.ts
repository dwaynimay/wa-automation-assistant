// Konstanta untuk konfigurasi timing aplikasi (dalam milidetik)
export const WPP_READY_POLL_INTERVAL_MS = 1_000;

// Batas panjang pesan user sebelum dipotong (mencegah token LLM membengkak)
export const MAX_USER_MESSAGE_LENGTH = 800;

// Durasi typing indicator (min dan max, dalam milidetik)
export const TYPING_DURATION_MIN_MS = 800;
export const TYPING_DURATION_MAX_MS = 4_000;

// Jeda sebelum bot "membuka HP" (simulasi manusiawi)
export const OPEN_PHONE_DELAY_MIN_MS = 800;
export const OPEN_PHONE_DELAY_MAX_MS = 2_500;

// Cooldown anti-spam antar pesan dari orang yang sama (milidetik)
export const ANTI_SPAM_COOLDOWN_MS = 5_000;

// Jeda stitcher: tunggu berapa lama sebelum pesan dianggap "selesai dikirim" (milidetik)
export const STITCHER_WAIT_MS = 3_000;