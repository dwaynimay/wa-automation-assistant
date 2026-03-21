# backend/app/domains/messages/repository.py

from typing import List, Dict, Any
from app.core import get_db

class MessageRepository:
    """Implementasi akses SQL untuk tabel messages."""
    
    def save_message(self, data: tuple) -> None:
        with get_db() as conn:
            conn.execute("""
                INSERT OR IGNORE INTO messages (
                    message_id, chat_jid, sender_jid, is_from_me, role,
                    message_type, content, quoted_message_id,
                    media_file_path, media_mime_type, media_size, timestamp
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, data)
            conn.commit()

    def get_messages_by_chat(self, chat_jid: str, limit: int) -> List[Dict[str, Any]]:
        with get_db() as conn:
            rows = conn.execute("""
                SELECT * FROM messages
                WHERE chat_jid = ?
                ORDER BY timestamp DESC
                LIMIT ?
            """, (chat_jid, limit)).fetchall()
            return [dict(r) for r in rows]
