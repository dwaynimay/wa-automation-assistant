# backend/app/routes/__init__.py
#
# Mendaftarkan semua Blueprint ke aplikasi Flask.
# Cukup tambahkan baris register_blueprint di sini
# jika nanti ada route baru — tidak perlu menyentuh file lain.

from flask import Flask
from .api import api_bp
from .dashboard import dashboard_bp


def register_routes(app: Flask) -> None:
    """Daftarkan semua blueprint route ke instance Flask."""
    app.register_blueprint(api_bp)
    app.register_blueprint(dashboard_bp)