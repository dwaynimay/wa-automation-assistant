# backend/app/routes/__init__.py

from flask import Flask
from .api import api_bp
from .dashboard import dashboard_bp


def register_routes(app: Flask) -> None:
    """Daftarkan semua blueprint route ke instance Flask."""
    app.register_blueprint(api_bp)
    app.register_blueprint(dashboard_bp)