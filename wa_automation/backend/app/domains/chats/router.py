# backend/app/domains/chats/router.py

from flask import Blueprint, request, jsonify
from .service import ChatService

chat_bp = Blueprint('chats', __name__)
service = ChatService()

@chat_bp.route('/upsert_chat', methods=['POST'])
def upsert_chat():
    data = request.get_json(silent=True) or {}
    chat_jid = (data.get('chat_jid') or '').strip()
    chat_name = data.get('chat_name') or None
    is_group = int(data.get('is_group', 0))

    try:
        service.upsert_chat(chat_jid, chat_name, is_group)
        return jsonify({'status': 'success'})
    except ValueError as ve:
        return jsonify({'status': 'error', 'message': str(ve)}), 400
    except Exception as e:
        print(f"[ERROR /upsert_chat] {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@chat_bp.route('/get_chat', methods=['POST'])
def get_chat():
    data = request.get_json(silent=True) or {}
    chat_jid = (data.get('chat_jid') or '').strip()

    try:
        chat = service.get_chat(chat_jid)
        return jsonify(chat)
    except Exception:
        return jsonify(None)

@chat_bp.route('/set_bot_active', methods=['POST'])
def set_bot_active():
    data = request.get_json(silent=True) or {}
    chat_jid = (data.get('chat_jid') or '').strip()
    is_bot_active = int(data.get('is_bot_active', 1))

    try:
        service.set_bot_active(chat_jid, is_bot_active)
        return jsonify({'status': 'success'})
    except ValueError as ve:
        return jsonify({'status': 'error', 'message': str(ve)}), 400
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@chat_bp.route('/get_bot_active', methods=['POST'])
def get_bot_active():
    data = request.get_json(silent=True) or {}
    chat_jid = (data.get('chat_jid') or '').strip()

    try:
        is_bot_active = service.get_bot_active(chat_jid)
        return jsonify({'is_bot_active': is_bot_active})
    except Exception:
        return jsonify({'is_bot_active': 1})
