// src/services/receiver/index.ts
// Public API dari receiver layer.
// Hanya setupMessageListener yang perlu diekspos ke luar —
// file lainnya adalah detail implementasi internal.

export { setupMessageListener } from './listener';

// Internal exports (opsional, untuk keperluan testing di masa depan)
export { processIncomingMessage } from './processor';
export { routeMessage } from './router';
export { enqueueMessage } from './queue';
