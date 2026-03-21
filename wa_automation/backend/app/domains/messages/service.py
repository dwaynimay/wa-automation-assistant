# backend/app/domains/messages/service.py

from typing import Dict, Any, List, Tuple
from .repository import MessageRepository
from app.emotion import analyze_emotion

class MessageService:
    """Mengelola logika emosi dan persiapan data Message."""
    
    def __init__(self):
        self.repository = MessageRepository()

    def save_message(self, message_data: Dict[str, Any]) -> Tuple[str, str]:
        # Validasi dasar
        required = ['message_id', 'chat_jid', 'sender_jid',
                    'is_from_me', 'role', 'message_type', 'timestamp']
        if not all(message_data.get(f) is not None for f in required):
            raise ValueError(f"Field wajib yang kurang: {required}")

        content = message_data.get('content') or ''
        sentiment_score, emotion_label = analyze_emotion(content)

        data_tuple = (
            message_data['message_id'],
            message_data['chat_jid'],
            message_data['sender_jid'],
            int(message_data['is_from_me']),
            message_data['role'],
            message_data['message_type'],
            content or None,
            message_data.get('quoted_message_id'),
            message_data.get('media_file_path'),
            message_data.get('media_mime_type'),
            message_data.get('media_size'),
            int(message_data['timestamp'])
        )

        self.repository.save_message(data_tuple)
        print(f"[DB] [{emotion_label.upper():7}] {message_data['role']:9} | {content[:40]}...")
        
        return 'success', emotion_label

    def get_messages(self, chat_jid: str, limit: int) -> List[Dict[str, Any]]:
        if not chat_jid:
            return []
        rows = self.repository.get_messages_by_chat(chat_jid, limit)
        # Balik urutan agar kronologis (lama -> baru)
        return list(reversed(rows))
