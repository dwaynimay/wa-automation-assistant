# backend/app/vector_db.py

import os
import chromadb
from .config import Config


class VectorDBClient:
    def __init__(self):
        os.makedirs(Config.CHROMA_DB_DIR, exist_ok=True)

        self.client = chromadb.PersistentClient(path=Config.CHROMA_DB_DIR)

        self.memories_col = self.client.get_or_create_collection(
            name="user_memories",
            metadata={"hnsw:space": "cosine"},
        )
        self.summaries_col = self.client.get_or_create_collection(
            name="chat_summaries",
            metadata={"hnsw:space": "cosine"},
        )

        print(f"[VectorDB] ✅ ChromaDB siap.")
        print(f"[VectorDB]    memories  : {self.memories_col.count()} item")
        print(f"[VectorDB]    summaries : {self.summaries_col.count()} item")

    # ── Memories ──────────────────────────────────────────────────────────────

    def add_memory(self, memory_id: str, jid: str, fact: str) -> None:
        self.memories_col.add(
            documents=[fact],
            metadatas=[{"jid": jid}],
            ids=[memory_id],
        )
        print(f"[VectorDB] 💾 Memory ditambah | jid={jid} | total={self.memories_col.count()}")

    def search_memories(self, jid: str, query: str, n_results: int = 5) -> list:
        total = self.memories_col.count()

        if total == 0:
            print("[VectorDB] ⚠️  search_memories: koleksi kosong, skip.")
            return []

        safe_n = min(n_results, total)
        print(f"[VectorDB] 🔍 search_memories | jid={jid} | n={safe_n}/{total} | query='{query[:50]}'")

        try:
            results = self.memories_col.query(
                query_texts=[query],
                n_results=safe_n,
                where={"jid": jid},
            )
        except Exception as e:
            print(f"[VectorDB] ⚠️  Query error: {e}")
            return []

        if not results["documents"] or not results["documents"][0]:
            print(f"[VectorDB] ℹ️  Tidak ada memori untuk jid={jid}")
            return []

        memories = []
        # Ambil list distance dengan aman — bisa None jika ChromaDB tidak return
        raw_distances = results.get("distances") or [[]]
        dist_list = raw_distances[0] if raw_distances else []

        for i, (doc, meta, doc_id) in enumerate(zip(
            results["documents"][0],
            results["metadatas"][0],
            results["ids"][0],
        )):
            # ── PERBAIKAN: Jangan campur kondisi dan format dalam satu f-string ──
            # Cara lama yang error:  f"{dist:.4f if dist else 'N/A'}"  ← SALAH
            # Cara benar: hitung dulu, format terpisah
            dist = dist_list[i] if i < len(dist_list) else None

            if dist is None:
                dist_str = "N/A"
                label = "❓"
            elif dist < 0.3:
                dist_str = f"{dist:.4f}"
                label = "🟢 Sangat Relevan"
            elif dist < 0.6:
                dist_str = f"{dist:.4f}"
                label = "🟡 Cukup Relevan"
            else:
                dist_str = f"{dist:.4f}"
                label = "🔴 Kurang Relevan"

            print(f"[VectorDB]    → [{label}] dist={dist_str} | {doc[:60]}")

            memories.append({
                "memory_id": doc_id,
                "jid": meta["jid"],
                "fact": doc,
                "distance": dist,
            })

        return memories

    # ── Summaries ─────────────────────────────────────────────────────────────

    def add_summary(self, summary_id: str, chat_jid: str, summary: str) -> None:
        self.summaries_col.add(
            documents=[summary],
            metadatas=[{"chat_jid": chat_jid}],
            ids=[summary_id],
        )
        print(f"[VectorDB] 💾 Summary ditambah | chat={chat_jid} | total={self.summaries_col.count()}")

    def search_summaries(self, chat_jid: str, query: str, n_results: int = 3) -> list:
        total = self.summaries_col.count()

        if total == 0:
            print("[VectorDB] ⚠️  search_summaries: koleksi kosong, skip.")
            return []

        safe_n = min(n_results, total)

        try:
            results = self.summaries_col.query(
                query_texts=[query],
                n_results=safe_n,
                where={"chat_jid": chat_jid},
            )
        except Exception as e:
            print(f"[VectorDB] ⚠️  Summary query error: {e}")
            return []

        if not results["documents"] or not results["documents"][0]:
            return []

        raw_distances = results.get("distances") or [[]]
        dist_list = raw_distances[0] if raw_distances else []

        summaries = []
        for i, (doc, meta, doc_id) in enumerate(zip(
            results["documents"][0],
            results["metadatas"][0],
            results["ids"][0],
        )):
            dist = dist_list[i] if i < len(dist_list) else None
            summaries.append({
                "summary_id": doc_id,
                "chat_jid": meta["chat_jid"],
                "summary": doc,
                "distance": dist,
            })

        return summaries


# Singleton
vector_db = VectorDBClient()
