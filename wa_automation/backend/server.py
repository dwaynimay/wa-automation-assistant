import os
import sqlite3
from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
from textblob import TextBlob # Pastikan sudah pip install textblob

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(BASE_DIR, 'bot_memory.db')

def init_db():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    
    # 1. Tabel User
    c.execute('''CREATE TABLE IF NOT EXISTS users
                 (jid TEXT PRIMARY KEY, 
                  nama TEXT, 
                  kategori TEXT DEFAULT 'unknown',
                  catatan_persona TEXT,
                  last_seen DATETIME DEFAULT CURRENT_TIMESTAMP)''')
    
    # 2. Tabel Messages (Disinkronkan kolomnya)
    c.execute('''CREATE TABLE IF NOT EXISTS messages
                 (id TEXT PRIMARY KEY, 
                  jid TEXT, 
                  role TEXT, 
                  content TEXT, 
                  sentiment_score REAL,
                  emotion_label TEXT,
                  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)''')
    conn.commit()
    conn.close()

def analyze_emotion(text):
    """Menganalisis skor sentimen dan melabeli emosi sederhana"""
    if not text: return 0.0, "neutral"
    
    # Skor Dasar dari TextBlob
    try:
        analysis = TextBlob(text)
        score = round(analysis.sentiment.polarity, 2)
    except:
        score = 0.0
    
    text_lower = text.lower()
    emotion = "neutral"
    
    # Keyword Mapping Bahasa Indonesia
    if any(word in text_lower for word in ['marah', 'kesal', 'benci', 'lama', 'gimana sih', 'woi', 'anjing', 'bgst']):
        emotion = "angry"
    elif any(word in text_lower for word in ['urgent', 'penting', 'cepat', 'tolong', 'p', 'woi']):
        emotion = "urgent"
    elif any(word in text_lower for word in ['makasih', 'terima kasih', 'senang', 'keren', 'mantap', 'halo', 'hallo', 'hi']):
        emotion = "happy"
    elif any(word in text_lower for word in ['sedih', 'maaf', 'kecewa', 'yah', 'huhu']):
        emotion = "sad"
    
    if emotion == "neutral":
        if score > 0.1: emotion = "happy"
        elif score < -0.1: emotion = "angry"
        
    return score, emotion

@app.route('/save_user', methods=['POST'])
def save_user():
    data = request.json
    jid, nama = data.get('jid'), data.get('nama')
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("""INSERT INTO users (jid, nama) VALUES (?, ?) 
                 ON CONFLICT(jid) DO UPDATE SET nama=excluded.nama, last_seen=CURRENT_TIMESTAMP""", 
              (jid, nama))
    conn.commit()
    conn.close()
    return jsonify({"status": "success"})

@app.route('/save_message', methods=['POST'])
def save_message():
    data = request.json
    content = data.get('content', '')
    msg_id = data.get('id')
    jid = data.get('jid')
    role = data.get('role')
    
    # Jalankan Analisis Emosi
    sentiment_score, emotion_label = analyze_emotion(content)
    
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    try:
        c.execute('''INSERT OR IGNORE INTO messages (id, jid, role, content, sentiment_score, emotion_label) 
                     VALUES (?, ?, ?, ?, ?, ?)''', 
                  (msg_id, jid, role, content, sentiment_score, emotion_label))
        conn.commit()
        print(f"💾 [{emotion_label.upper()}] Dari {jid}: {content[:30]}...")
    except Exception as e:
        print(f"❌ Error DB: {e}")
    finally:
        conn.close()
        
    return jsonify({"status": "success", "emotion": emotion_label})

# --- DASHBOARD UI ---
DASHBOARD_HTML = """
<!DOCTYPE html>
<html>
<head>
    <title>WA Bot Dashboard</title>
    <meta http-equiv="refresh" content="15">
    <style>
        body { font-family: 'Segoe UI', sans-serif; background: #f0f2f5; margin: 20px; }
        .container { max-width: 1100px; margin: auto; background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.08); }
        h2 { color: #25D366; display: flex; align-items: center; gap: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
        th { background: #f8f9fa; font-size: 13px; color: #666; text-transform: uppercase; }
        
        .badge { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: bold; }
        .role-user { background: #e7f3ff; color: #007bff; }
        .role-bot { background: #e6ffed; color: #28a745; }
        
        /* Emotion Colors */
        .emo-happy { border-left: 4px solid #28a745; background: #f0fff4; }
        .emo-angry { border-left: 4px solid #dc3545; background: #fff5f5; }
        .emo-urgent { border-left: 4px solid #ffc107; background: #fffbeb; }
        .emo-sad { border-left: 4px solid #17a2b8; background: #f0fcff; }
        .emo-neutral { border-left: 4px solid #6c757d; }
        
        .sentiment-score { font-size: 10px; color: #999; display: block; }
    </style>
</head>
<body>
    <div class="container">
        <h2>📱 WA Bot Realtime Monitor</h2>
        <table>
            <thead>
                <tr>
                    <th>Waktu</th>
                    <th>Pengirim</th>
                    <th>Role</th>
                    <th>Pesan & Emosi</th>
                </tr>
            </thead>
            <tbody>
                {% for row in logs %}
                <tr class="emo-{{ row[5] }}">
                    <td style="font-size: 12px; color: #888;">{{ row[6] }}</td>
                    <td><strong>{{ row[7] if row[7] else row[1] }}</strong><br><small style="color: #aaa;">{{ row[1] }}</small></td>
                    <td><span class="badge role-{{ row[2] }}">{{ row[2] | upper }}</span></td>
                    <td>
                        <span class="badge" style="background: #eee; color: #333;">{{ row[5] | upper }}</span>
                        <span class="sentiment-score">Score: {{ row[4] }}</span>
                        <div style="margin-top: 5px;">{{ row[3] }}</div>
                    </td>
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
    # Query mengambil data message + nama dari tabel users
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

if __name__ == '__main__':
    init_db()
    print("🚀 Server Emotion-Aware aktif di http://127.0.0.1:5000")
    print("📊 Dashboard Monitor: http://127.0.0.1:5000/dashboard")
    app.run(port=5000)