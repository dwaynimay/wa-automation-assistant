# backend/app/domains/contacts/router.py

from flask import Blueprint, request, jsonify
from .service import ContactService

contact_bp = Blueprint('contacts', __name__)
service = ContactService()

@contact_bp.route('/upsert_contact', methods=['POST'])
def upsert_contact():
    data = request.get_json(silent=True) or {}
    jid = (data.get('jid') or '').strip()
    pushname = data.get('pushname') or None

    try:
        service.upsert_contact(jid, pushname)
        return jsonify({'status': 'success'})
    except ValueError as ve:
        return jsonify({'status': 'error', 'message': str(ve)}), 400
    except Exception as e:
        print(f"[ERROR /upsert_contact] {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@contact_bp.route('/get_contact', methods=['POST'])
def get_contact():
    data = request.get_json(silent=True) or {}
    jid = (data.get('jid') or '').strip()
    
    try:
        contact = service.get_contact(jid)
        return jsonify(contact)
    except Exception:
        return jsonify(None)

@contact_bp.route('/set_whitelist', methods=['POST'])
def set_whitelist():
    data = request.get_json(silent=True) or {}
    jid = (data.get('jid') or '').strip()
    is_whitelist = int(data.get('is_whitelist', 0))

    try:
        service.set_whitelist(jid, is_whitelist)
        return jsonify({'status': 'success'})
    except ValueError as ve:
        return jsonify({'status': 'error', 'message': str(ve)}), 400
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500
