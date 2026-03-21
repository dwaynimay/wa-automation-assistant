# backend/app/routes/api.py

from flask import Blueprint, request, jsonify
from app.database import get_db
from app.emotion import analyze_emotion
from app.config import Config
from app.vector_db import vector_db

import os, base64, mimetypes, uuid

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

# ─── Memories & Summaries ──────────────────────────────────────────────────────

@api_bp.route('/add_memory', methods=['POST'])
def add_memory():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'status': 'error', 'message': 'Body JSON tidak valid'}), 400

    jid = (data.get('jid') or '').strip()
    fact = (data.get('fact') or '').strip()
    
    if not jid or not fact:
        return jsonify({'status': 'error', 'message': 'jid dan fact wajib diisi'}), 400

    memory_id = str(uuid.uuid4())
    
    try:
        with get_db() as conn:
            conn.execute("""
                INSERT INTO user_memories (memory_id, jid, fact)
                VALUES (?, ?, ?)
            """, (memory_id, jid, fact))
            conn.commit()
            
        vector_db.add_memory(memory_id, jid, fact)
        return jsonify({'status': 'success', 'memory_id': memory_id})
    except Exception as e:
        print(f"[ERROR /add_memory] {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@api_bp.route('/search_memories', methods=['POST'])
def search_memories():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'status': 'error', 'message': 'Body JSON tidak valid'}), 400

    jid = (data.get('jid') or '').strip()
    query = (data.get('query') or '').strip()
    limit = int(data.get('limit', 5))
    
    if not jid or not query:
        return jsonify({'status': 'error', 'message': 'jid dan query wajib diisi'}), 400

    try:
        results = vector_db.search_memories(jid, query, n_results=limit)
        return jsonify({'status': 'success', 'memories': results})
    except Exception as e:
        print(f"[ERROR /search_memories] {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@api_bp.route('/add_summary', methods=['POST'])
def add_summary():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'status': 'error', 'message': 'Body JSON tidak valid'}), 400

    chat_jid = (data.get('chat_jid') or '').strip()
    summary = (data.get('summary') or '').strip()
    
    if not chat_jid or not summary:
        return jsonify({'status': 'error', 'message': 'chat_jid dan summary wajib diisi'}), 400

    summary_id = str(uuid.uuid4())
    
    try:
        with get_db() as conn:
            conn.execute("""
                INSERT INTO chat_summaries (summary_id, chat_jid, summary)
                VALUES (?, ?, ?)
            """, (summary_id, chat_jid, summary))
            conn.commit()
            
        vector_db.add_summary(summary_id, chat_jid, summary)
        return jsonify({'status': 'success', 'summary_id': summary_id})
    except Exception as e:
        print(f"[ERROR /add_summary] {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@api_bp.route('/search_summaries', methods=['POST'])
def search_summaries():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'status': 'error', 'message': 'Body JSON tidak valid'}), 400

    chat_jid = (data.get('chat_jid') or '').strip()
    query = (data.get('query') or '').strip()
    limit = int(data.get('limit', 3))
    
    if not chat_jid or not query:
        return jsonify({'status': 'error', 'message': 'chat_jid dan query wajib diisi'}), 400

    try:
        results = vector_db.search_summaries(chat_jid, query, n_results=limit)
        return jsonify({'status': 'success', 'summaries': results})
    except Exception as e:
        print(f"[ERROR /search_summaries] {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

# ─── Media ─────────────────────────────────────────────────────────────────



def _subfolder_from_mime(mime_type: str) -> str:
    """Fallback: tentukan subfolder dari mime_type jika message_type tidak dikenal."""
    if mime_type.startswith('image/'):
        return 'images'
    elif mime_type.startswith('video/'):
        return 'videos'
    elif mime_type.startswith('audio/'):
        return 'audio'
    else:
        return 'documents'


SUBFOLDER_MAP = {
    'image':    'images',
    'video':    'videos',
    'audio':    'audio',
    'ptt':      'audio',
    'document': 'documents',
    'sticker':  'stickers',
}


@api_bp.route('/upload_media', methods=['POST'])
def upload_media():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'status': 'error', 'message': 'Body JSON tidak valid'}), 400

    base64_raw   = data.get('base64', '')
    mime_type    = data.get('mime_type', 'application/octet-stream')
    message_id   = (data.get('message_id') or '').strip()
    message_type = (data.get('message_type') or '').strip().lower()


    print(f"[DEBUG] message_type='{message_type}' | mime_type='{mime_type}'")
    if not base64_raw or not message_id:
        return jsonify({'status': 'error', 'message': 'base64 dan message_id wajib diisi'}), 400

    try:
        # Strip prefix data URL jika ada: "data:image/jpeg;base64,..."
        if ',' in base64_raw:
            prefix = base64_raw.split(',')[0]
            if 'data:' in prefix and not mime_type:
                mime_type = prefix.replace('data:', '').replace(';base64', '')
            base64_raw = base64_raw.split(',', 1)[1]

        # Tentukan subfolder — pakai message_type dari WPP sebagai sumber utama,
        # fallback ke mime_type jika message_type tidak dikenal
        subfolder = SUBFOLDER_MAP.get(message_type) or _subfolder_from_mime(mime_type)

        # Buat folder jika belum ada
        folder_path = os.path.join(Config.MEDIA_DIR, subfolder)
        os.makedirs(folder_path, exist_ok=True)

        # Tentukan ekstensi dari MIME type
        ext = mimetypes.guess_extension(mime_type) or '.bin'
        ext = {'.jpe': '.jpg', '.jpeg': '.jpg', '.jfif': '.jpg'}.get(ext, ext)

        # Nama file aman dari message_id
        safe_id   = message_id.replace('/', '_').replace('@', '_').replace(':', '_')
        file_name = f"{safe_id}{ext}"
        file_path = os.path.join(folder_path, file_name)

        # Decode dan tulis ke disk
        file_bytes = base64.b64decode(base64_raw)
        with open(file_path, 'wb') as f:
            f.write(file_bytes)

        file_size = len(file_bytes)
        print(f"[Media] [{message_type.upper():8}] → {subfolder}/{file_name} ({file_size:,} bytes)")

        return jsonify({
            'status':    'success',
            'file_path': file_path,
            'size':      file_size,
        })

    except Exception as e:
        print(f"[ERROR /upload_media] {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500