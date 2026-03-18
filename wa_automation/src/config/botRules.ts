import { parseEnvArray } from '../utils';

export const botRules = {
  respondToSelf: false,
  respondToGroups: false,
  respondToStatus: false,
  onlyReplyToContacts: false,
  whitelistNumbers: parseEnvArray(import.meta.env.VITE_WHITELIST_NUMBERS),
  whitelistGroups: parseEnvArray(import.meta.env.VITE_WHITELIST_GROUPS),
  blacklistNumbers: parseEnvArray(import.meta.env.VITE_BLACKLIST_NUMBERS),
  blacklistGroups: parseEnvArray(import.meta.env.VITE_BLACKLIST_GROUPS),
} as const;