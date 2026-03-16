# Source Code

Folder ini berisi seluruh kode utama dari project WA Automation.

## Struktur

src/
├── main.ts
├── config.ts
├── types/
├── utils/
├── core/
├── features/
├── services/
└── ui/

## Prinsip Arsitektur

Project menggunakan pendekatan modular:

- **core** → mesin utama sistem
- **services** → penghubung antar sistem
- **features** → fitur bot
- **utils** → helper functions
- **types** → definisi tipe data
- **ui** → tampilan
- **config** → konfigurasi global
