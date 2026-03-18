# backend/app/routes/api.py
#
# Blueprint untuk semua endpoint API yang dipanggil oleh userscript.
# Endpoints:
#   GET  /health        → cek status server
#   POST /save_user     → simpan/update profil pengguna
#   POST /save_message  → simpan pesan + analisis emosi

from flask import Blueprint, request, jsonify
from app.database import get_db
from app.emotion import analyze_emotion

# Blueprint adalah cara Flask memecah routes ke file terpisah.
# Nama 'api' dipakai sebagai prefix untuk url_for().
api_bp = Blueprint('api', __name__)


@api_bp.route('/health', methods=['GET'])
def health_check():
    """Cek apakah server hidup. Berguna untuk debugging dari browser."""
    from datetime import datetime
    return jsonify({
        'status': 'ok',
        'timestamp': datetime.now().isoformat(),
    })


@api_bp.route('/save_user', methods=['POST'])
def save_user():
    """
    Simpan atau perbarui profil pengguna.
    Jika JID sudah ada → hanya update nama dan last_seen.
    """
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'status': 'error', 'message': 'Body JSON tidak valid'}), 400

    jid  = (data.get('jid') or '').strip()
    nama = (data.get('nama') or '').strip()

    if not jid:
        return jsonify({'status': 'error', 'message': 'Field jid wajib diisi'}), 400

    try:
        with get_db() as conn:
            conn.execute("""
                INSERT INTO users (jid, nama)
                VALUES (?, ?)
                ON CONFLICT(jid) DO UPDATE SET
                    nama      = excluded.nama,
                    last_seen = CURRENT_TIMESTAMP
            """, (jid, nama))
            conn.commit()

        return jsonify({'status': 'success'})

    except Exception as e:
        print(f"[ERROR /save_user] {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@api_bp.route('/save_message', methods=['POST'])
def save_message():
    """
    Simpan pesan ke riwayat percakapan beserta hasil analisis emosi.
    Menggunakan INSERT OR IGNORE agar pesan yang sama tidak tersimpan dua kali.
    """
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'status': 'error', 'message': 'Body JSON tidak valid'}), 400

    msg_id  = (data.get('id')      or '').strip()
    jid     = (data.get('jid')     or '').strip()
    role    = (data.get('role')    or '').strip()
    content = (data.get('content') or '').strip()

    # Validasi field wajib
    if not all([msg_id, jid, role]):
        return jsonify({'status': 'error', 'message': 'Field id, jid, role wajib diisi'}), 400

    # Validasi nilai role
    VALID_ROLES = ('user', 'bot', 'owner')
    if role not in VALID_ROLES:
        return jsonify({
            'status': 'error',
            'message': f"Role '{role}' tidak valid. Pilihan: {VALID_ROLES}"
        }), 400

    # Analisis emosi sebelum menyimpan
    sentiment_score, emotion_label = analyze_emotion(content)

    try:
        with get_db() as conn:
            conn.execute("""
                INSERT OR IGNORE INTO messages
                    (id, jid, role, content, sentiment_score, emotion_label)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (msg_id, jid, role, content, sentiment_score, emotion_label))
            conn.commit()

        print(f"[DB] [{emotion_label.upper():7}] {role:5} | {content[:40]}...")
        return jsonify({'status': 'success', 'emotion': emotion_label})

    except Exception as e:
        print(f"[ERROR /save_message] {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500