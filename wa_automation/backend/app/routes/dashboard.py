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
                m.id, m.jid, m.role, m.content,
                m.sentiment_score, m.emotion_label,
                m.timestamp, u.nama
            FROM messages m
            LEFT JOIN users u ON m.jid = u.jid
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