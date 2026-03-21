# backend/app/domains/chats/models.py

from dataclasses import dataclass
from typing import Optional

@dataclass
class Chat:
    chat_jid: str
    chat_name: Optional[str] = None
    is_group: int = 0
    is_bot_active: int = 1
