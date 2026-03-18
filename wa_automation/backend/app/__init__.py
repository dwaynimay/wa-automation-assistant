# backend/app/__init__.py
#
# Application Factory — membuat instance Flask dengan semua konfigurasi siap.
# Pola ini memudahkan testing dan deployment di berbagai environment.

from flask import Flask
from flask_cors import CORS
from .database import init_db
from .routes import register_routes


def create_app() -> Flask:
    """
    Buat dan konfigurasi instance Flask.
    Dipanggil oleh server.py saat startup.
    """
    # Template folder kita arahkan ke backend/app/templates/
    app = Flask(__name__, template_folder='templates')

    # Izinkan request dari userscript (CORS bypass)
    CORS(app)

    # Inisialisasi database (buat tabel jika belum ada)
    init_db()

    # Daftarkan semua routes
    register_routes(app)

    return app