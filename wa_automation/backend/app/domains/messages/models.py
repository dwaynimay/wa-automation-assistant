# backend/app/domains/messages/models.py

from dataclasses import dataclass
from typing import Optional

@dataclass
class Message:
    message_id: str
    chat_jid: str
    sender_jid: str
    is_from_me: int
    role: str
    message_type: str
    timestamp: int
    content: Optional[str] = None
    quoted_message_id: Optional[str] = None
    media_file_path: Optional[str] = None
    media_mime_type: Optional[str] = None
    media_size: Optional[int] = None
