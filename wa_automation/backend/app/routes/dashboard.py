# backend/app/routes/dashboard.py

from flask import Blueprint, render_template
from app.database import get_db
from app.config import Config

dashboard_bp = Blueprint('dashboard', __name__)


@dashboard_bp.route('/dashboard')
def dashboard():
    with get_db() as conn:
        messages = conn.execute("""
            SELECT
                m.message_id,
                m.chat_jid,
                m.sender_jid,
                m.role,
                m.message_type,
                m.content,
                m.timestamp,
                c.pushname AS nama
            FROM messages m
            LEFT JOIN contacts c ON m.sender_jid = c.jid
            ORDER BY m.timestamp DESC
            LIMIT ?
        """, (Config.DASHBOARD_LIMIT,)).fetchall()

        total = conn.execute(
            "SELECT COUNT(*) as total FROM messages"
        ).fetchone()['total']

    return render_template(
        'dashboard.html',
        messages=[dict(row) for row in messages],
        total=total,
    )