# backend/app/config.py
#
# Semua konfigurasi backend di satu tempat.
# Prinsip yang sama dengan src/config/ di sisi TypeScript.

import os

# Path ke folder backend/ (lokasi file ini berada)
# dirname 1 -> backend/app/core
# dirname 2 -> backend/app
# dirname 3 -> backend/
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

class Config:
    """Konfigurasi utama aplikasi."""

    # Path folder storage khusus data dinamis
    STORAGE_DIR: str = os.path.join(BASE_DIR, 'storage')

    # Path lengkap ke file database SQLite
    DB_FILE: str = os.path.join(STORAGE_DIR, 'database', 'bot_memory.db')

    # Path untuk ChromaDB Persistent Storage
    CHROMA_DB_DIR: str = os.path.join(STORAGE_DIR, 'vector_db')

    # Host dan port server
    HOST: str = '127.0.0.1'
    PORT: int = 5000

    # Mode debug — matikan di production
    DEBUG: bool = False

    # Jumlah maksimal baris yang ditampilkan di dashboard
    DASHBOARD_LIMIT: int = 50

    # Folder media
    MEDIA_DIR: str = os.path.join(STORAGE_DIR, 'media')