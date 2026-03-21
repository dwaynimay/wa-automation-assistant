# backend/app/domains/memory/repository.py

from app.core import get_db, vector_db

class MemoryRepository:
    def add_user_memory(self, memory_id: str, jid: str, fact: str) -> None:
        with get_db() as conn:
            conn.execute("""
                INSERT INTO user_memories (memory_id, jid, fact)
                VALUES (?, ?, ?)
            """, (memory_id, jid, fact))
            conn.commit()
        vector_db.add_memory(memory_id, jid, fact)

    def search_user_memories(self, jid: str, query: str, limit: int) -> list:
        return vector_db.search_memories(jid, query, n_results=limit)

    def add_chat_summary(self, summary_id: str, chat_jid: str, summary: str) -> None:
        with get_db() as conn:
            conn.execute("""
                INSERT INTO chat_summaries (summary_id, chat_jid, summary)
                VALUES (?, ?, ?)
            """, (summary_id, chat_jid, summary))
            conn.commit()
        vector_db.add_summary(summary_id, chat_jid, summary)

    def search_chat_summaries(self, chat_jid: str, query: str, limit: int) -> list:
        return vector_db.search_summaries(chat_jid, query, n_results=limit)
