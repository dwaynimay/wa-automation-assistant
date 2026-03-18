# backend/app/config.py
#
# Semua konfigurasi backend di satu tempat.
# Prinsip yang sama dengan src/config/ di sisi TypeScript.

import os

# Path ke folder backend/ (lokasi file ini berada)
# dirname pertama  → backend/app/
# dirname kedua    → backend/
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

class Config:
    """Konfigurasi utama aplikasi."""

    # Path lengkap ke file database SQLite
    DB_FILE: str = os.path.join(BASE_DIR, 'bot_memory.db')

    # Host dan port server
    HOST: str = '127.0.0.1'
    PORT: int = 5000

    # Mode debug — matikan di production
    DEBUG: bool = False

    # Jumlah maksimal baris yang ditampilkan di dashboard
    DASHBOARD_LIMIT: int = 50