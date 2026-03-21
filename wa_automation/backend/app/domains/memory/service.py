# backend/app/domains/memory/service.py

import uuid
from typing import List, Dict, Any
from .repository import MemoryRepository

class MemoryService:
    def __init__(self):
        self.repository = MemoryRepository()

    def add_user_memory(self, jid: str, fact: str) -> str:
        if not jid or not fact:
            raise ValueError("jid dan fact wajib diisi")
        memory_id = str(uuid.uuid4())
        self.repository.add_user_memory(memory_id, jid, fact)
        return memory_id

    def search_user_memories(self, jid: str, query: str, limit: int) -> List[Dict[str, Any]]:
        if not jid or not query:
            raise ValueError("jid dan query wajib diisi")
        return self.repository.search_user_memories(jid, query, limit)

    def add_chat_summary(self, chat_jid: str, summary: str) -> str:
        if not chat_jid or not summary:
            raise ValueError("chat_jid dan summary wajib diisi")
        summary_id = str(uuid.uuid4())
        self.repository.add_chat_summary(summary_id, chat_jid, summary)
        return summary_id

    def search_chat_summaries(self, chat_jid: str, query: str, limit: int) -> List[Dict[str, Any]]:
        if not chat_jid or not query:
            raise ValueError("chat_jid dan query wajib diisi")
        return self.repository.search_chat_summaries(chat_jid, query, limit)
