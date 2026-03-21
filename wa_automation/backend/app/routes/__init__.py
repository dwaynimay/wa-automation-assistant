# backend/app/routes/__init__.py

from flask import Flask
from .api import api_bp
from .dashboard import dashboard_bp
from app.domains.contacts import contact_bp
from app.domains.chats import chat_bp
from app.domains.messages import message_bp
from app.domains.memory import memory_bp
from app.domains.media import media_bp


def register_routes(app: Flask) -> None:
    """Daftarkan semua blueprint route ke instance Flask."""
    app.register_blueprint(api_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(contact_bp)
    app.register_blueprint(chat_bp)
    app.register_blueprint(message_bp)
    app.register_blueprint(memory_bp)
    app.register_blueprint(media_bp)