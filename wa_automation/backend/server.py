# backend/server.py

import sys
import os

# Tambahkan folder backend/ ke sys.path agar Python bisa menemukan folder app/
# Ini diperlukan karena server.py dijalankan dari root folder wa_automation/,
# bukan dari dalam folder backend/ itu sendiri.
_BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, _BACKEND_DIR)

from app import create_app
from app.config import Config

app = create_app()

if __name__ == '__main__':
    print("╔════════════════════════════════════════╗")
    print("║       WA Automation Backend            ║")
    print(f"║  API    : http://{Config.HOST}:{Config.PORT}          ║")
    print(f"║  Monitor: http://{Config.HOST}:{Config.PORT}/dashboard ║")
    print("╚════════════════════════════════════════╝")

    app.run(
        host=Config.HOST,
        port=Config.PORT,
        debug=Config.DEBUG,
    )
