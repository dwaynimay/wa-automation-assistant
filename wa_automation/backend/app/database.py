# backend/app/database.py

import sqlite3
from contextlib import contextmanager
from app.config import Config


@contextmanager
def get_db():
    conn = sqlite3.connect(Config.DB_FILE)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()


def init_db() -> None:
    with get_db() as conn:
        conn.execute("PRAGMA journal_mode = WAL")
        conn.execute("PRAGMA foreign_keys = ON")

        conn.executescript("""

            -- ─── contacts ─────────────────────────────────────────────────────
            CREATE TABLE IF NOT EXISTS contacts (
                jid          TEXT    PRIMARY KEY,
                pushname     TEXT,
                is_whitelist INTEGER NOT NULL DEFAULT 0
                             CHECK(is_whitelist IN (0, 1)),
                created_at   INTEGER NOT NULL DEFAULT (unixepoch())
            );

            -- ─── chats ────────────────────────────────────────────────────────
            CREATE TABLE IF NOT EXISTS chats (
                chat_jid      TEXT    PRIMARY KEY,
                chat_name     TEXT,
                is_group      INTEGER NOT NULL DEFAULT 0
                              CHECK(is_group IN (0, 1)),
                is_bot_active INTEGER NOT NULL DEFAULT 1
                              CHECK(is_bot_active IN (0, 1))
            );

            -- ─── messages ─────────────────────────────────────────────────────
            CREATE TABLE IF NOT EXISTS messages (
                message_id        TEXT    PRIMARY KEY,
                chat_jid          TEXT    NOT NULL
                                  REFERENCES chats(chat_jid) ON DELETE CASCADE,
                sender_jid        TEXT    NOT NULL
                                  REFERENCES contacts(jid) ON DELETE CASCADE,
                is_from_me        INTEGER NOT NULL CHECK(is_from_me IN (0, 1)),
                role              TEXT    NOT NULL CHECK(role IN ('user', 'assistant')),
                message_type      TEXT    NOT NULL
                                  CHECK(message_type IN (
                                      'chat', 'image', 'video', 'audio',
                                      'ptt', 'document', 'sticker', 'reply'
                                  )),
                content           TEXT,
                quoted_message_id TEXT,
                media_file_path   TEXT,
                media_mime_type   TEXT,
                media_size        INTEGER,
                timestamp         INTEGER NOT NULL
            );

            -- ─── Index untuk RAG ──────────────────────────────────────────────
            CREATE INDEX IF NOT EXISTS idx_messages_chat
                ON messages(chat_jid);

            CREATE INDEX IF NOT EXISTS idx_messages_timestamp
                ON messages(timestamp);

        """)
        conn.commit()

    print(f"[DB] Siap — {Config.DB_FILE}")