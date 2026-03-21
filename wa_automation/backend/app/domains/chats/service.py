# backend/app/domains/chats/service.py

from typing import Optional
from .repository import ChatRepository

class ChatService:
    """Mengelola aturan bisnis untuk domain Chats."""
    
    def __init__(self):
        self.repository = ChatRepository()

    def upsert_chat(self, chat_jid: str, chat_name: Optional[str], is_group: int) -> None:
        if not chat_jid:
            raise ValueError("Field chat_jid wajib diisi")
        self.repository.upsert_chat(chat_jid, chat_name, is_group)

    def get_chat(self, chat_jid: str) -> Optional[dict]:
        if not chat_jid:
            return None
        return self.repository.get_chat_by_jid(chat_jid)

    def set_bot_active(self, chat_jid: str, is_bot_active: int) -> None:
        # Toggle bot active juga butuh JID
        if not chat_jid:
            raise ValueError("Field chat_jid wajib diisi")
        self.repository.set_bot_active(chat_jid, is_bot_active)

    def get_bot_active(self, chat_jid: str) -> int:
        if not chat_jid:
            return 1  # Default aktif jika JID tidak valid
        return self.repository.get_bot_active(chat_jid)
