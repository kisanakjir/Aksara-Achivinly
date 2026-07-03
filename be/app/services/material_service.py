"""Layanan untuk CRUD materi belajar."""

from typing import Optional
from sqlalchemy.orm import Session
from app.models.material import Material
from app.models.subject import Subject


def get_subjects(db: Session) -> list:
    """Ambil semua mata pelajaran."""
    return db.query(Subject).order_by(Subject.sort_order).all()


def get_materials(
    db: Session,
    subject_id: Optional[int] = None,
    level: Optional[str] = None,
) -> list:
    """Ambil daftar materi dengan filter opsional."""
    query = db.query(Material).filter(Material.is_active == True)

    if subject_id:
        query = query.filter(Material.subject_id == subject_id)
    if level:
        query = query.filter(Material.level == level)

    return query.order_by(Material.created_at.desc()).all()


def get_material_by_id(db: Session, material_id: int) -> Optional[Material]:
    """Ambil detail materi berdasarkan ID."""
    return (
        db.query(Material)
        .filter(Material.id == material_id, Material.is_active == True)
        .first()
    )


def create_material(db: Session, data: dict) -> Material:
    """Buat materi baru."""
    material = Material(**data)
    db.add(material)
    db.commit()
    db.refresh(material)
    return material


def get_offline_fallback_material(subject: str, level: str, topic: str) -> dict:
    """Template materi offline saat API Gemini tidak tersedia."""
    return {
        "title": f"{topic} — Konsep Inti Level {level}",
        "content": f"""### 🚀 Selamat Datang di Aksara Study Guide!

Materi ini membahas **{topic}** untuk mata pelajaran **{subject}** tingkat **{level}**.

---

### 💡 Konsep Utama & Fondasi
Setiap topik pendidikan membutuhkan pemahaman visual dan logis yang mendalam dibanding sekadar menghafal rumus.

1. **Analisis Masalah**: Selalu identifikasi variabel yang diketahui sebelum memulai.
2. **Prinsip Eliminasi**: Di UTBK, mengeliminasi 2-3 jawaban yang tidak logis jauh lebih cepat.
3. **Peta Pikiran (Mindmapping)**: Menghubungkan konsep dengan analogi sehari-hari akan memperkuat memori jangka panjang Anda hingga 80%.

---

### 📝 Contoh Kasus & Solusi
*Contoh untuk {topic}:*
- **Pendekatan Standar**: Ikuti langkah-langkah sistematis.
- **Trik Aksara**: Gunakan rumus cepat untuk menghemat waktu pengerjaan.

---

### 🔥 Tips Kilat UTBK (Aksara Life Hack)
> **Jangan terjebak pada soal yang sulit!** Setiap soal memiliki bobot IRT yang dinamis. Jika Anda menemui kesulitan dalam 30 detik pertama, berikan tanda "ragu-ragu", lewati, dan selesaikan soal fundamental terlebih dahulu!""",
        "youtube_search_query": f"{subject} {topic} UTBK pembahasan soal",
        "duration_minutes": 10,
        "xp_reward": 100,
    }
