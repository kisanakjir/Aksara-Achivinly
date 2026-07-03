"""Layanan untuk integrasi Gemini AI."""

import json
import re
import google.generativeai as genai
from app.core.config import settings

GEMINI_MODEL = settings.GEMINI_MODEL
from app.services.material_service import get_offline_fallback_material

# Inisialisasi Gemini client
_genai_initialized = False


def _ensure_initialized():
    """Inisialisasi Gemini client jika API key tersedia."""
    global _genai_initialized
    if not _genai_initialized and settings.GEMINI_API_KEY:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        _genai_initialized = True


def is_gemini_available() -> bool:
    """Cek apakah Gemini API tersedia."""
    return bool(settings.GEMINI_API_KEY)


def _clean_json_response(text: str) -> str:
    """Bersihkan response dari markdown JSON wrapper jika ada."""
    text = text.strip()
    # Hapus ```json ... ``` wrapper
    text = re.sub(r'^```(?:json)?\s*', '', text)
    text = re.sub(r'\s*```$', '', text)
    return text.strip()


async def generate_material(subject: str, level: str, topic: str) -> dict:
    """
    Generate materi belajar menggunakan Gemini AI.
    Fallback ke template offline jika API tidak tersedia.
    """
    if not is_gemini_available():
        return {
            "success": True,
            "data": get_offline_fallback_material(subject, level, topic),
            "is_offline_fallback": True,
        }

    try:
        _ensure_initialized()
        model = genai.GenerativeModel(GEMINI_MODEL)

        prompt = f"""Buatlah ringkasan materi belajar yang informatif, modern, dan mudah dipahami dengan gaya bahasa anak muda / asyik tentang topik "{topic}" untuk mata pelajaran "{subject}" dengan tingkat kesulitan "{level}" dalam Bahasa Indonesia.

Sertakan:
1. Pengantar Konseptual singkat.
2. 3 Poin Utama/Rumus penting yang mudah diingat.
3. Contoh Kasus nyata atau Analoginya.
4. Tips Kilat (Life Hack) pengerjaan soal.

Gunakan format Markdown yang estetik dengan pembagian sub-bab yang rapi.

Format respon harus JSON objek dengan struktur:
{{
  "title": "Judul Materi Pembelajaran yang Menarik",
  "content": "Isi materi lengkap dalam format Markdown...",
  "youtube_search_query": "pencarian video youtube yang cocok untuk topik ini",
  "duration_minutes": 8,
  "xp_reward": 100
}}
Jangan menyertakan tag markdown ```json atau karakter pembungkus lain di luar JSON murni."""

        response = model.generate_content(prompt)
        text = _clean_json_response(response.text)

        try:
            data = json.loads(text)
        except json.JSONDecodeError:
            # Fallback jika response bukan JSON valid
            return {
                "success": True,
                "data": get_offline_fallback_material(subject, level, topic),
                "is_offline_fallback": True,
            }

        return {
            "success": True,
            "data": data,
            "is_offline_fallback": False,
        }

    except Exception as e:
        print(f"Gemini API Error: {e}")
        return {
            "success": True,
            "data": get_offline_fallback_material(subject, level, topic),
            "is_offline_fallback": True,
        }


async def generate_quiz(
    subject: str, level: str, topic: str, count: int = 3
) -> dict:
    """
    Generate soal kuis menggunakan Gemini AI.
    Fallback ke template offline jika API tidak tersedia.
    """
    if not is_gemini_available():
        return {
            "success": True,
            "questions": _get_offline_quiz(subject),
            "is_offline_fallback": True,
        }

    try:
        _ensure_initialized()
        model = genai.GenerativeModel(GEMINI_MODEL)

        prompt = f"""Buatkan {count} soal kuis pilihan ganda yang interaktif dan menarik tentang topik "{topic}" untuk mata pelajaran "{subject}" dengan tingkat kesulitan "{level}" dalam Bahasa Indonesia.

Format respon HARUS dalam format JSON murni berupa Array berisi objek-objek dengan struktur:
[
  {{
    "question_text": "Teks pertanyaan...",
    "options": ["Pilihan A", "Pilihan B", "Pilihan C", "Pilihan D"],
    "correct_option_index": 0,
    "explanation": "Penjelasan detail mengapa pilihan tersebut benar...",
    "points": 50,
    "timer_seconds": 60
  }}
]

Buatlah soal yang bervariasi, menantang, mendidik, dan relevan dengan kurikulum nasional atau UTBK. Jangan menyertakan tag markdown ```json di luar JSON murni."""

        response = model.generate_content(prompt)
        text = _clean_json_response(response.text)

        try:
            questions = json.loads(text)
        except json.JSONDecodeError:
            return {
                "success": True,
                "questions": _get_offline_quiz(subject),
                "is_offline_fallback": True,
            }

        return {
            "success": True,
            "questions": questions,
            "is_offline_fallback": False,
        }

    except Exception as e:
        print(f"Gemini API Error: {e}")
        return {
            "success": True,
            "questions": _get_offline_quiz(subject),
            "is_offline_fallback": True,
        }


def _get_offline_quiz(subject: str) -> list:
    """Template soal offline cadangan."""
    default_questions = [
        {
            "question_text": "Diberikan sebuah fungsi kuadrat f(x) = x² - 6x + 8. Manakah koordinat titik balik (puncak) dari fungsi tersebut?",
            "options": ["(3, -1)", "(3, 1)", "(-3, -1)", "(2, 4)"],
            "correct_option_index": 0,
            "explanation": "Sumbu simetri xp = -b / 2a = -(-6) / 2(1) = 3. Subtitusikan x = 3 ke fungsi: f(3) = 9 - 18 + 8 = -1. Jadi titik puncaknya adalah (3, -1).",
            "points": 60,
            "timer_seconds": 60,
        },
    ]

    if subject.lower() == "matematika":
        return [
            {
                "question_text": "Jika log 2 = a dan log 3 = b, maka nilai dari log 18 adalah...",
                "options": ["a + 2b", "2a + b", "a + b²", "a² + b"],
                "correct_option_index": 0,
                "explanation": "log 18 = log (2 × 9) = log 2 + log 3² = log 2 + 2 log 3 = a + 2b.",
                "points": 80,
                "timer_seconds": 60,
            },
        ]

    return default_questions
