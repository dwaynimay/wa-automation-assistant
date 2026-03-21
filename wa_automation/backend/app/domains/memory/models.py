# backend/app/domains/memory/models.py

from dataclasses import dataclass

@dataclass
class UserMemory:
    memory_id: str
    jid: str
    fact: str

@dataclass
class ChatSummary:
    summary_id: str
    chat_jid: str
    summary: str
