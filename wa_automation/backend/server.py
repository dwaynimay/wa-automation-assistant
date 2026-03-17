import os
import sqlite3
from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(BASE_DIR, 'bot_memory.db')

def init_db():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS users
                 (jid TEXT PRIMARY KEY, nama TEXT, last_seen DATETIME DEFAULT CURRENT_TIMESTAMP)''')
    c.execute('''CREATE TABLE IF NOT EXISTS messages
                 (id TEXT PRIMARY KEY, jid TEXT, role TEXT, content TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)''')
    conn.commit()
    conn.close()

# --- DASHBOARD UI ---
DASHBOARD_HTML = """
<!DOCTYPE html>
<html>
<head>
    <title>WA Bot Dashboard</title>
    <meta http-equiv="refresh" content="30"> <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f7f6; margin: 20px; color: #333; }
        .container { max-width: 1000px; margin: auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        h2 { color: #25D366; border-bottom: 2px solid #eee; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
        th { background: #f8f9fa; color: #666; font-size: 14px; }
        .role-user { color: #007bff; font-weight: bold; }
        .role-bot { color: #28a745; font-weight: bold; }
        .timestamp { font-size: 12px; color: #999; }
        .message-text { word-break: break-word; line-height: 1.4; }
        .badge { padding: 4px 8px; border-radius: 4px; font-size: 11px; text-transform: uppercase; }
        .badge-user { background: #e7f3ff; color: #007bff; }
        .badge-bot { background: #e6ffed; color: #28a745; }
    </style>
</head>
<body>
    <div class="container">
        <h2>📱 WA Automation - Realtime Monitor</h2>
        <table>
            <thead>
                <tr>
                    <th width="20%">Waktu</th>
                    <th width="20%">Pengirim</th>
                    <th width="10%">Role</th>
                    <th width="50%">Pesan</th>
                </tr>
            </thead>
            <tbody>
                {% for row in logs %}
                <tr>
                    <td class="timestamp">{{ row[4] }}</td>
                    <td><strong>{{ row[5] if row[5] else row[1] }}</strong><br><small style="color:#aaa">{{ row[1] }}</small></td>
                    <td><span class="badge badge-{{ row[2] }}">{{ row[2] }}</span></td>
                    <td class="message-text">{{ row[3] }}</td>
                </tr>
                {% endfor %}
            </tbody>
        </table>
    </div>
</body>
</html>
"""

@app.route('/dashboard')
def dashboard():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    # Join tabel messages dan users untuk dapet namanya
    query = '''
        SELECT m.*, u.nama 
        FROM messages m 
        LEFT JOIN users u ON m.jid = u.jid 
        ORDER BY m.timestamp DESC 
        LIMIT 50
    '''
    c.execute(query)
    logs = c.fetchall()
    conn.close()
    return render_template_string(DASHBOARD_HTML, logs=logs)

@app.route('/save_user', methods=['POST'])
def save_user():
    data = request.json
    jid, nama = data.get('jid'), data.get('nama')
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("INSERT INTO users (jid, nama) VALUES (?, ?) ON CONFLICT(jid) DO UPDATE SET nama=excluded.nama, last_seen=CURRENT_TIMESTAMP", (jid, nama))
    conn.commit()
    conn.close()
    return jsonify({"status": "success"})

@app.route('/save_message', methods=['POST'])
def save_message():
    data = request.json
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("INSERT OR IGNORE INTO messages (id, jid, role, content) VALUES (?, ?, ?, ?)", 
              (data.get('id'), data.get('jid'), data.get('role'), data.get('content')))
    conn.commit()
    conn.close()
    return jsonify({"status": "success"})

if __name__ == '__main__':
    init_db()
    print("🚀 Dashboard aktif di: http://127.0.0.1:5000/dashboard")
    app.run(port=5000)