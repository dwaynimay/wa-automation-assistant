# backend/app/database.py
#
# Semua hal yang berhubungan dengan SQLite ada di sini:
# - Membuat koneksi
# - Inisialisasi tabel
#
# Tidak ada logika bisnis di file ini — murni infrastruktur data.

import sqlite3
from contextlib import contextmanager
from app.config import Config


@contextmanager
def get_db():
    """
    Context manager untuk koneksi database.
    Pemakaian:
        with get_db() as conn:
            conn.execute(...)

    Koneksi otomatis ditutup setelah blok 'with' selesai,
    bahkan jika terjadi exception di tengah jalan.
    """
    conn = sqlite3.connect(Config.DB_FILE)
    conn.row_factory = sqlite3.Row  # hasil query bisa diakses seperti dict
    try:
        yield conn
    finally:
        conn.close()


def init_db() -> None:
    """
    Buat semua tabel jika belum ada.
    Dipanggil SATU KALI saat server pertama kali dijalankan.
    Aman dijalankan berulang kali (CREATE TABLE IF NOT EXISTS).
    """
    with get_db() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS users (
                jid       TEXT PRIMARY KEY,
                nama      TEXT,
                kategori  TEXT     DEFAULT 'unknown',
                catatan   TEXT,
                last_seen DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS messages (
                id              TEXT PRIMARY KEY,
                jid             TEXT     NOT NULL,
                role            TEXT     NOT NULL
                                CHECK(role IN ('user', 'bot', 'owner')),
                content         TEXT,
                sentiment_score REAL     DEFAULT 0.0,
                emotion_label   TEXT     DEFAULT 'neutral',
                timestamp       DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (jid) REFERENCES users(jid)
            );
        """)
        conn.commit()

    print(f"[DB] Siap — {Config.DB_FILE}")