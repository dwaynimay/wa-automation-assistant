# backend/app/routes/api.py

from flask import Blueprint, request, jsonify
from app.core import get_db, Config, vector_db
from app.emotion import analyze_emotion

import os, base64, mimetypes, uuid

api_bp = Blueprint('api', __name__)


@api_bp.route('/health', methods=['GET'])
def health_check():
    from datetime import datetime
    return jsonify({'status': 'ok', 'timestamp': datetime.now().isoformat()})









