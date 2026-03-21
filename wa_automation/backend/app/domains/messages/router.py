# backend/app/domains/messages/router.py

from flask import Blueprint, request, jsonify
from .service import MessageService

message_bp = Blueprint('messages', __name__)
service = MessageService()

@message_bp.route('/save_message', methods=['POST'])
def save_message():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'status': 'error', 'message': 'Body JSON tidak valid'}), 400

    try:
        status, emotion_label = service.save_message(data)
        return jsonify({'status': status, 'emotion': emotion_label})
    except ValueError as ve:
        return jsonify({'status': 'error', 'message': str(ve)}), 400
    except Exception as e:
        print(f"[ERROR /save_message] {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@message_bp.route('/get_messages', methods=['POST'])
def get_messages():
    data = request.get_json(silent=True)
    chat_jid = (data.get('chat_jid') or '').strip() if data else ''
    limit = int(data.get('limit', 20)) if data else 20

    try:
        messages = service.get_messages(chat_jid, limit)
        return jsonify({'messages': messages})
    except Exception:
        return jsonify({'messages': []})
