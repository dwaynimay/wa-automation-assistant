// src/config/index.ts
// Public API dari config layer.
// Layer lain cukup import dari 'src/config', tidak perlu tahu file mana.

export { appConfig } from './app-config';
export type { AppConfig } from './app-config'; // ← export tipe juga!

export { botRules } from './bot-rules';
export type { BotRules } from './bot-rules';

export { runtimeState } from './runtime-state';
export type { RuntimeState } from './runtime-state';

export { validateAppConfig } from './validate-app-config';