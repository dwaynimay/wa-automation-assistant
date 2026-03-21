# backend/app/vector_db.py
import os
import chromadb
from app.config import Config

class VectorDBClient:
    def __init__(self):
        # Pastikan direktori ada sebelum inisialisasi ChromaDB client
        os.makedirs(Config.CHROMA_DB_DIR, exist_ok=True)
        
        # Local Persistent ChromaDB
        self.client = chromadb.PersistentClient(path=Config.CHROMA_DB_DIR)
        
        # Mendapatkan atau membuat collection untuk memory dan summary
        self.memories_col = self.client.get_or_create_collection(name="user_memories")
        self.summaries_col = self.client.get_or_create_collection(name="chat_summaries")
        
    def add_memory(self, memory_id: str, jid: str, fact: str):
        """Menyimpan fakta pengguna ke ChromaDB."""
        self.memories_col.add(
            documents=[fact],
            metadatas=[{"jid": jid}],
            ids=[memory_id]
        )
        
    def search_memories(self, jid: str, query: str, n_results: int = 5):
        """Mencari memori berdasarkan JID pengguna menggunakan semantic search."""
        # Querying the collection
        results = self.memories_col.query(
            query_texts=[query],
            n_results=n_results,
            where={"jid": jid}
        )
        
        # Format response
        if not results["documents"] or not results["documents"][0]:
            return []
            
        memories = []
        for d, m, id_, dist in zip(
            results["documents"][0], 
            results["metadatas"][0], 
            results["ids"][0],
            results["distances"][0] if results["distances"] else [None]*len(results["ids"][0])
        ):
            memories.append({
                "memory_id": id_,
                "jid": m["jid"],
                "fact": d,
                "distance": dist
            })
        return memories

    def add_summary(self, summary_id: str, chat_jid: str, summary: str):
        """Menyimpan ringkasan obrolan ke ChromaDB."""
        self.summaries_col.add(
            documents=[summary],
            metadatas=[{"chat_jid": chat_jid}],
            ids=[summary_id]
        )
        
    def search_summaries(self, chat_jid: str, query: str, n_results: int = 3):
        """Mencari ringkasan obrolan terkait (semantic search)."""
        results = self.summaries_col.query(
            query_texts=[query],
            n_results=n_results,
            where={"chat_jid": chat_jid}
        )
        
        if not results["documents"] or not results["documents"][0]:
            return []
            
        summaries = []
        for d, m, id_, dist in zip(
            results["documents"][0], 
            results["metadatas"][0], 
            results["ids"][0],
            results["distances"][0] if results["distances"] else [None]*len(results["ids"][0])
        ):
            summaries.append({
                "summary_id": id_,
                "chat_jid": m["chat_jid"],
                "summary": d,
                "distance": dist
            })
        return summaries

# Singleton instance exported for use in routes
vector_db = VectorDBClient()
