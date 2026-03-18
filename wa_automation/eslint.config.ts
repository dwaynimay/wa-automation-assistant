import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier'; // Penghubung Prettier

export default tseslint.config(
  // 1. Abaikan folder yang tidak perlu di-lint (SANGAT PENTING!)
  { ignores: ['dist/', 'backend/venv/', 'node_modules/'] },

  // 2. Aturan bawaan standar industri
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // 3. Aturan kustom dari idemu tadi
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      'no-console': 'off',
    },
  },

  // 4. Prettier HARUS ditaruh paling bawah agar menimpa aturan yang bentrok
  eslintConfigPrettier,
);
