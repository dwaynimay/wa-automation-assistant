# backend/app/emotion.py
#
# Logika analisis emosi — sepenuhnya terpisah dari database dan routing.
# Mudah diuji secara independen dan mudah diperluas di masa depan.

from textblob import TextBlob

# Kata kunci emosi Bahasa Indonesia
# Dipisah sebagai konstanta agar mudah ditambah tanpa mengubah logika
EMOTION_KEYWORDS: dict[str, list[str]] = {
    'angry': [
        'marah', 'kesal', 'benci', 'gimana sih',
        'woi', 'anjing', 'bgst', 'bego', 'goblok',
    ],
    'urgent': [
        'urgent', 'penting', 'cepat', 'buruan',
        'tolong segera', 'asap',
    ],
    'happy': [
        'makasih', 'terima kasih', 'senang', 'keren',
        'mantap', 'halo', 'hallo', 'hi', 'hehe', 'wkwk',
        'sip', 'oke', 'ok',
    ],
    'sad': [
        'sedih', 'maaf', 'kecewa', 'yah',
        'huhu', 'nangis', 'galau',
    ],
}


def analyze_emotion(text: str) -> tuple[float, str]:
    """
    Menganalisis teks dan mengembalikan (sentiment_score, emotion_label).

    Strategi dua lapis:
    1. Keyword matching Bahasa Indonesia (prioritas utama)
    2. TextBlob sentiment score sebagai fallback

    Args:
        text: Teks pesan yang akan dianalisis.

    Returns:
        Tuple (sentiment_score: float, emotion_label: str)
        di mana emotion_label salah satu dari:
        'happy' | 'angry' | 'urgent' | 'sad' | 'neutral'
    """
    if not text or not text.strip():
        return 0.0, 'neutral'

    text_lower = text.lower()

    # Lapisan 1: Keyword matching (lebih akurat untuk Bahasa Indonesia)
    for emotion, keywords in EMOTION_KEYWORDS.items():
        if any(kw in text_lower for kw in keywords):
            score = _get_sentiment_score(text)
            return score, emotion

    # Lapisan 2: TextBlob sentiment sebagai fallback
    score = _get_sentiment_score(text)
    if score > 0.1:
        return score, 'happy'
    elif score < -0.1:
        return score, 'angry'

    return score, 'neutral'


def _get_sentiment_score(text: str) -> float:
    """
    Helper internal: hitung sentiment score via TextBlob.
    Mengembalikan 0.0 jika TextBlob gagal (aman untuk teks non-Inggris).
    """
    try:
        return round(TextBlob(text).sentiment.polarity, 2)
    except Exception:
        return 0.0