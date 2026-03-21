# backend/app/domains/memory/router.py

from flask import Blueprint, request, jsonify
from .service import MemoryService

memory_bp = Blueprint('memory', __name__)
service = MemoryService()

@memory_bp.route('/add_memory', methods=['POST'])
def add_memory():
    data = request.get_json(silent=True) or {}
    jid = (data.get('jid') or '').strip()
    fact = (data.get('fact') or '').strip()

    try:
        memory_id = service.add_user_memory(jid, fact)
        print(f"\n{'='*55}\n  [RAG] 💾 MEMORI BARU TERSIMPAN\n{'='*55}\n  JID      : {jid}\n  Memory ID: {memory_id}\n  Fakta    : {fact}\n  Status   : ✅ SQLite + ChromaDB OK\n{'='*55}\n")
        return jsonify({'status': 'success', 'memory_id': memory_id})
    except ValueError as ve:
        return jsonify({'status': 'error', 'message': str(ve)}), 400
    except Exception as e:
        print(f"[RAG] ❌ ERROR /add_memory: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@memory_bp.route('/search_memories', methods=['POST'])
def search_memories():
    data = request.get_json(silent=True) or {}
    jid = (data.get('jid') or '').strip()
    query = (data.get('query') or '').strip()
    limit = int(data.get('limit', 5))

    try:
        results = service.search_user_memories(jid, query, limit)
        
        print(f"\n{'='*55}\n  [RAG] 🔍 PENCARIAN MEMORI\n{'='*55}\n  JID  : {jid}\n  Query: {query[:60]}{'...' if len(query) > 60 else ''}\n  Limit: {limit}\n  Hasil: {len(results)} memori ditemukan\n{'─'*55}")
        if results:
            for i, mem in enumerate(results, 1):
                dist = mem.get('distance')
                if dist is not None:
                    if dist < 0.5:
                        relevansi = "🟢 Sangat Relevan"
                    elif dist < 0.8:
                        relevansi = "🟡 Cukup Relevan"
                    else:
                        relevansi = "🔴 Kurang Relevan"
                else:
                    relevansi = "N/A"
                
                dist_str = f"{dist:.4f}" if dist is not None else "N/A"
                print(f"  [{i}] {mem.get('fact', '')[:50]}\n       Distance: {dist_str} | {relevansi}")
        else:
            print("  ⚠️  Belum ada memori untuk JID ini.\n  💡 Tips: AI perlu percakapan lebih dulu untuk menyimpan fakta.")
        print(f"{'='*55}\n")

        return jsonify({'status': 'success', 'memories': results})
    except ValueError as ve:
        return jsonify({'status': 'error', 'message': str(ve)}), 400
    except Exception as e:
        print(f"[RAG] ❌ ERROR /search_memories: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@memory_bp.route('/add_summary', methods=['POST'])
def add_summary():
    data = request.get_json(silent=True) or {}
    chat_jid = (data.get('chat_jid') or '').strip()
    summary = (data.get('summary') or '').strip()

    try:
        summary_id = service.add_chat_summary(chat_jid, summary)
        print(f"\n[RAG] 💾 Summary tersimpan | chat_jid: {chat_jid} | id: {summary_id}")
        return jsonify({'status': 'success', 'summary_id': summary_id})
    except ValueError as ve:
        return jsonify({'status': 'error', 'message': str(ve)}), 400
    except Exception as e:
        print(f"[RAG] ❌ ERROR /add_summary: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@memory_bp.route('/search_summaries', methods=['POST'])
def search_summaries():
    data = request.get_json(silent=True) or {}
    chat_jid = (data.get('chat_jid') or '').strip()
    query = (data.get('query') or '').strip()
    limit = int(data.get('limit', 3))

    try:
        results = service.search_chat_summaries(chat_jid, query, limit)
        print(f"\n[RAG] 🔍 Search summaries | chat: {chat_jid} | hasil: {len(results)}")
        return jsonify({'status': 'success', 'summaries': results})
    except ValueError as ve:
        return jsonify({'status': 'error', 'message': str(ve)}), 400
    except Exception as e:
        print(f"[RAG] ❌ ERROR /search_summaries: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500
