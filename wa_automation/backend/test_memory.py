import requests
import time

BASE_URL = "http://127.0.0.1:5000"

def test_memory_flow():
    print("Testing /add_memory...")
    resp = requests.post(f"{BASE_URL}/add_memory", json={
        "jid": "628123456789@c.us",
        "fact": "Pengguna adalah seorang software engineer yang suka kopi pahit."
    })
    print(resp.json())
    
    # Wait for ChromaDB to flush (usually fast but just in case)
    time.sleep(1)
    
    print("\nTesting /search_memories...")
    resp = requests.post(f"{BASE_URL}/search_memories", json={
        "jid": "628123456789@c.us",
        "query": "Apa pekerjaan dan minuman favoritnya?",
        "limit": 2
    })
    print(resp.json())

    print("\nTesting /add_summary...")
    resp = requests.post(f"{BASE_URL}/add_summary", json={
        "chat_jid": "room_123@g.us",
        "summary": "Membahas rencana integrasi ChromaDB dan SQLite."
    })
    print(resp.json())

    time.sleep(1)

    print("\nTesting /search_summaries...")
    resp = requests.post(f"{BASE_URL}/search_summaries", json={
        "chat_jid": "room_123@g.us",
        "query": "Apa yang dibahas soal database?",
        "limit": 2
    })
    print(resp.json())

if __name__ == "__main__":
    test_memory_flow()
