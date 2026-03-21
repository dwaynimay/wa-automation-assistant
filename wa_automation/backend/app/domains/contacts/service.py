# backend/app/domains/contacts/service.py

from typing import Optional
from .repository import ContactRepository

class ContactService:
    """Mengelola aturan bisnis dan validasi tingkat tinggi."""
    
    def __init__(self):
        self.repository = ContactRepository()

    def upsert_contact(self, jid: str, pushname: Optional[str]) -> None:
        if not jid:
            raise ValueError("Field jid wajib diisi")
        self.repository.upsert_contact(jid, pushname)

    def get_contact(self, jid: str) -> Optional[dict]:
        if not jid:
            return None
        return self.repository.get_contact_by_jid(jid)

    def set_whitelist(self, jid: str, is_whitelist: int) -> None:
        if not jid:
            raise ValueError("Field jid wajib diisi")
        self.repository.set_whitelist(jid, is_whitelist)
