# backend/app/domains/contacts/repository.py

from typing import Optional
from app.core import get_db

class ContactRepository:
    """Hanya menangani urusan database (SQL)."""
    
    def upsert_contact(self, jid: str, pushname: Optional[str]) -> None:
        with get_db() as conn:
            conn.execute("""
                INSERT INTO contacts (jid, pushname) VALUES (?, ?)
                ON CONFLICT(jid) DO UPDATE SET pushname = excluded.pushname
            """, (jid, pushname))
            conn.commit()

    def get_contact_by_jid(self, jid: str) -> Optional[dict]:
        with get_db() as conn:
            row = conn.execute(
                "SELECT * FROM contacts WHERE jid = ?", (jid,)
            ).fetchone()
            return dict(row) if row else None

    def set_whitelist(self, jid: str, is_whitelist: int) -> None:
        with get_db() as conn:
            conn.execute(
                "UPDATE contacts SET is_whitelist = ? WHERE jid = ?",
                (is_whitelist, jid),
            )
            conn.commit()
