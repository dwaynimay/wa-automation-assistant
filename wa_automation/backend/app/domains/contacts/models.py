# backend/app/domains/contacts/models.py

from dataclasses import dataclass
from typing import Optional

@dataclass
class Contact:
    jid: str
    pushname: Optional[str] = None
    is_whitelist: int = 0
