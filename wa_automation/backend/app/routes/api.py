# backend/app/routes/api.py

from flask import Blueprint, request, jsonify
from app.database import get_db
from app.emotion import analyze_emotion

api_bp = Blueprint('api', __name__)


@api_bp.route('/health', methods=['GET'])
def health_check():
    from datetime import datetime
    return jsonify({'status': 'ok', 'timestamp': datetime.now().isoformat()})


# ─── Contacts ─────────────────────────────────────────────────────────────────

@api_bp.route('/upsert_contact', methods=['POST'])
def upsert_contact():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'status': 'error', 'message': 'Body JSON tidak valid'}), 400

    jid      = (data.get('jid') or '').strip()
    pushname = data.get('pushname') or None

    if not jid:
        return jsonify({'status': 'error', 'message': 'Field jid wajib diisi'}), 400

    try:
        with get_db() as conn:
            conn.execute("""
                INSERT INTO contacts (jid, pushname) VALUES (?, ?)
                ON CONFLICT(jid) DO UPDATE SET pushname = excluded.pushname
            """, (jid, pushname))
            conn.commit()
        return jsonify({'status': 'success'})
    except Exception as e:
        print(f"[ERROR /upsert_contact] {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@api_bp.route('/get_contact', methods=['POST'])
def get_contact():
    data = request.get_json(silent=True)
    jid  = (data.get('jid') or '').strip() if data else ''

    try:
        with get_db() as conn:
            row = conn.execute(
                "SELECT * FROM contacts WHERE jid = ?", (jid,)
            ).fetchone()
        return jsonify(dict(row) if row else None)
    except Exception:
        return jsonify(None)


@api_bp.route('/set_whitelist', methods=['POST'])
def set_whitelist():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'status': 'error'}), 400

    jid          = (data.get('jid') or '').strip()
    is_whitelist = int(data.get('is_whitelist', 0))

    try:
        with get_db() as conn:
            conn.execute(
                "UPDATE contacts SET is_whitelist = ? WHERE jid = ?",
                (is_whitelist, jid),
            )
            conn.commit()
        return jsonify({'status': 'success'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


# ─── Chats ────────────────────────────────────────────────────────────────────

@api_bp.route('/upsert_chat', methods=['POST'])
def upsert_chat():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'status': 'error'}), 400

    chat_jid  = (data.get('chat_jid') or '').strip()
    chat_name = data.get('chat_name') or None
    is_group  = int(data.get('is_group', 0))

    if not chat_jid:
        return jsonify({'status': 'error', 'message': 'chat_jid wajib diisi'}), 400

    try:
        with get_db() as conn:
            conn.execute("""
                INSERT INTO chats (chat_jid, chat_name, is_group) VALUES (?, ?, ?)
                ON CONFLICT(chat_jid) DO UPDATE SET chat_name = excluded.chat_name
            """, (chat_jid, chat_name, is_group))
            conn.commit()
        return jsonify({'status': 'success'})
    except Exception as e:
        print(f"[ERROR /upsert_chat] {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@api_bp.route('/get_chat', methods=['POST'])
def get_chat():
    data     = request.get_json(silent=True)
    chat_jid = (data.get('chat_jid') or '').strip() if data else ''

    try:
        with get_db() as conn:
            row = conn.execute(
                "SELECT * FROM chats WHERE chat_jid = ?", (chat_jid,)
            ).fetchone()
        return jsonify(dict(row) if row else None)
    except Exception:
        return jsonify(None)


@api_bp.route('/set_bot_active', methods=['POST'])
def set_bot_active():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'status': 'error'}), 400

    chat_jid      = (data.get('chat_jid') or '').strip()
    is_bot_active = int(data.get('is_bot_active', 1))

    try:
        with get_db() as conn:
            conn.execute(
                "UPDATE chats SET is_bot_active = ? WHERE chat_jid = ?",
                (is_bot_active, chat_jid),
            )
            conn.commit()
        return jsonify({'status': 'success'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


@api_bp.route('/get_bot_active', methods=['POST'])
def get_bot_active():
    data     = request.get_json(silent=True)
    chat_jid = (data.get('chat_jid') or '').strip() if data else ''

    try:
        with get_db() as conn:
            row = conn.execute(
                "SELECT is_bot_active FROM chats WHERE chat_jid = ?",
                (chat_jid,),
            ).fetchone()
        return jsonify({'is_bot_active': row['is_bot_active'] if row else 1})
    except Exception:
        return jsonify({'is_bot_active': 1})


# ─── Messages ─────────────────────────────────────────────────────────────────

@api_bp.route('/save_message', methods=['POST'])
def save_message():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'status': 'error', 'message': 'Body JSON tidak valid'}), 400

    required = ['message_id', 'chat_jid', 'sender_jid',
                 'is_from_me', 'role', 'message_type', 'timestamp']
    if not all(data.get(f) is not None for f in required):
        return jsonify({
            'status': 'error',
            'message': f'Field wajib: {required}',
        }), 400

    # Analisis emosi dari konten pesan
    content         = data.get('content') or ''
    sentiment_score, emotion_label = analyze_emotion(content)

    try:
        with get_db() as conn:
            conn.execute("""
                INSERT OR IGNORE INTO messages (
                    message_id, chat_jid, sender_jid, is_from_me, role,
                    message_type, content, quoted_message_id,
                    media_file_path, media_mime_type, media_size, timestamp
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                data['message_id'],
                data['chat_jid'],
                data['sender_jid'],
                int(data['is_from_me']),
                data['role'],
                data['message_type'],
                content or None,
                data.get('quoted_message_id'),
                data.get('media_file_path'),
                data.get('media_mime_type'),
                data.get('media_size'),
                int(data['timestamp']),
            ))
            conn.commit()

        print(f"[DB] [{emotion_label.upper():7}] {data['role']:9} | {content[:40]}...")
        return jsonify({'status': 'success', 'emotion': emotion_label})

    except Exception as e:
        print(f"[ERROR /save_message] {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@api_bp.route('/get_messages', methods=['POST'])
def get_messages():
    """Ambil N pesan terakhir dari satu chat — untuk sistem RAG."""
    data     = request.get_json(silent=True)
    chat_jid = (data.get('chat_jid') or '').strip() if data else ''
    limit    = int(data.get('limit', 20)) if data else 20

    try:
        with get_db() as conn:
            rows = conn.execute("""
                SELECT * FROM messages
                WHERE chat_jid = ?
                ORDER BY timestamp DESC
                LIMIT ?
            """, (chat_jid, limit)).fetchall()

        # Balik urutan agar kronologis (terlama dulu)
        return jsonify({'messages': [dict(r) for r in reversed(rows)]})
    except Exception:
        return jsonify({'messages': []})