# backend/app/domains/chats/repository.py

from typing import Optional
from app.core import get_db

class ChatRepository:
    """Implementasi akses data (SQL queries) ke tabel chats."""
    
    def upsert_chat(self, chat_jid: str, chat_name: Optional[str], is_group: int) -> None:
        with get_db() as conn:
            conn.execute("""
                INSERT INTO chats (chat_jid, chat_name, is_group) VALUES (?, ?, ?)
                ON CONFLICT(chat_jid) DO UPDATE SET chat_name = excluded.chat_name
            """, (chat_jid, chat_name, is_group))
            conn.commit()

    def get_chat_by_jid(self, chat_jid: str) -> Optional[dict]:
        with get_db() as conn:
            row = conn.execute(
                "SELECT * FROM chats WHERE chat_jid = ?", (chat_jid,)
            ).fetchone()
            return dict(row) if row else None

    def set_bot_active(self, chat_jid: str, is_bot_active: int) -> None:
        with get_db() as conn:
            conn.execute(
                "UPDATE chats SET is_bot_active = ? WHERE chat_jid = ?",
                (is_bot_active, chat_jid),
            )
            conn.commit()

    def get_bot_active(self, chat_jid: str) -> int:
        with get_db() as conn:
            row = conn.execute(
                "SELECT is_bot_active FROM chats WHERE chat_jid = ?",
                (chat_jid,),
            ).fetchone()
            return row['is_bot_active'] if row else 1
