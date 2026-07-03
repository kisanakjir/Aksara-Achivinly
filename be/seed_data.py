"""
Seed data awal untuk database Aksara.
Jalankan: python seed_data.py

Pastikan MySQL sudah running dan database 'aksara_db' sudah dibuat.
"""

from app.core.database import SessionLocal, init_db, engine
from app.core.config import settings
from app.models import (
    User,
    Subject,
    Material,
    LearningSession,
    DailyStat,
    QuizResult,
)
from datetime import date, timedelta
import random


def seed():
    print("🌱 Seeding database...")
    init_db()

    db = SessionLocal()

    try:
        # Cek apakah sudah ada data
        existing_users = db.query(User).count()
        if existing_users > 0:
            print("⚠️  Database sudah memiliki data. Skip seeding.")
            return

        # === USERS ===
        user = User(
            username="IqbalMustafa",
            display_name="Iqbal Mustafa",
            avatar_url=None,
            goal_name="UTBK 2026",
            goal_intensity=3,
            goal_subjects='["Matematika", "Fisika", "Biologi"]',
            level=12,
            current_xp=4850,
            xp_to_next_level=5000,
            streak_days=4,
            last_active_date=date.today(),
            total_minutes_studied=165,
            total_questions_solved=42,
        )
        db.add(user)
        db.flush()  # Dapatkan ID

        print(f"✅ Created user: {user.username}")

        # === SUBJECTS ===
        subjects_data = [
            {"name": "Matematika", "slug": "math", "icon": "BookOpen", "color": "#3b82f6",
             "description": "Aljabar, geometri, kalkulus, statistika, dan logika matematika", "sort_order": 1},
            {"name": "Fisika", "slug": "physics", "icon": "Zap", "color": "#ef4444",
             "description": "Mekanika, termodinamika, gelombang, listrik, magnet, dan optik", "sort_order": 2},
            {"name": "Biologi", "slug": "biology", "icon": "Leaf", "color": "#22c55e",
             "description": "Sel, genetika, evolusi, ekologi, anatomi, dan fisiologi", "sort_order": 3},
            {"name": "Kimia", "slug": "chemistry", "icon": "Flask", "color": "#a855f7",
             "description": "Stoikiometri, ikatan kimia, termokimia, elektrokimia, dan kimia organik", "sort_order": 4},
            {"name": "Bahasa Indonesia", "slug": "indonesian", "icon": "Book", "color": "#f59e0b",
             "description": "Tata bahasa, ejaan, sastra, kebahasaan, dan literasi", "sort_order": 5},
            {"name": "Bahasa Inggris", "slug": "english", "icon": "Globe", "color": "#ec4899",
             "description": "Grammar, reading comprehension, vocabulary, dan structure", "sort_order": 6},
        ]

        subjects = {}
        for s in subjects_data:
            subject = Subject(**s)
            db.add(subject)
            db.flush()
            subjects[s["slug"]] = subject

        print(f"✅ Created {len(subjects_data)} subjects")

        # === MATERIALS ===
        materials_data = [
            {
                "subject_id": subjects["math"].id,
                "title": "Konsep Dasar Turunan Fungsi Aljabar",
                "sub_category": "Kalkulus",
                "level": "Basic",
                "type": "text",
                "content": """### Pengantar Turunan Fungsi Aljabar

Turunan fungsi aljabar adalah konsep pengukuran bagaimana suatu fungsi berubah seiring perubahan nilai masukannya.

#### Rumus Utama
Untuk setiap fungsi aljabar berbentuk f(x) = ax^n, turunan pertamanya adalah:
**f'(x) = a × n × x^(n-1)**

#### Langkah-langkah:
1. Kalikan koefisien dengan pangkat
2. Kurangi pangkat dengan 1
3. Sederhanakan

#### Tips Kilat
Jika f(x) berbentuk pecahan linear (ax+b)/(cx+d), turunan pertamanya bisa langsung menggunakan rumus cepat: **f'(x) = (ad - bc) / (cx+d)²**""",
                "youtube_id": "F77v6PzXW84",
                "duration_minutes": 10,
                "xp_reward": 100,
            },
            {
                "subject_id": subjects["math"].id,
                "title": "Integral Tentu dan Tak Tentu",
                "sub_category": "Kalkulus",
                "level": "Intermediate",
                "type": "text",
                "content": """### Pengantar Integral

Integral adalah kebalikan dari turunan (antiderivatif). Ada dua jenis: integral tak tentu dan integral tentu.

#### Integral Tak Tentu
∫ f(x) dx = F(x) + C

#### Integral Tentu
∫ₐᵇ f(x) dx = F(b) - F(a)

#### Aplikasi Integral
- Menghitung luas area di bawah kurva
- Menghitung volume benda putar
- Menghitung panjang busur""",
                "youtube_id": "Xh0mG2V8-K4",
                "duration_minutes": 15,
                "xp_reward": 150,
            },
            {
                "subject_id": subjects["physics"].id,
                "title": "Hukum Newton tentang Gerak",
                "sub_category": "Mekanika",
                "level": "Basic",
                "type": "text",
                "content": """### Hukum Newton I, II, dan III

#### Hukum I Newton (Kelembaman)
"Setiap benda akan mempertahankan keadaan diam atau bergerak lurus beraturan, kecuali ada gaya yang bekerja padanya."
ΣF = 0

#### Hukum II Newton
"Percepatan suatu benda berbanding lurus dengan gaya total yang bekerja padanya dan berbanding terbalik dengan massanya."
**F = m × a**

#### Hukum III Newton (Aksi-Reaksi)
"Setiap aksi akan menimbulkan reaksi yang sama besar tetapi berlawanan arah."
**F_aksi = -F_reaksi**""",
                "youtube_id": "30t041-h0QY",
                "duration_minutes": 12,
                "xp_reward": 120,
            },
            {
                "subject_id": subjects["biology"].id,
                "title": "Struktur dan Fungsi Sel",
                "sub_category": "Biologi Sel",
                "level": "Fundamental",
                "type": "text",
                "content": """### Pengantar Sel

Sel adalah unit terkecil kehidupan. Semua makhluk hidup tersusun dari sel.

#### Organel Sel Utama:
1. **Nukleus (Inti Sel)** — Pusat kendali sel, mengandung DNA
2. **Mitokondria** — Pusat produksi energi (ATP)
3. **Retikulum Endoplasma** — Sintesis protein dan lipid
4. **Ribosom** — Tempat sintesis protein
5. **Membran Sel** — Pelindung dan pengatur keluar masuk zat

#### Perbedaan Sel Hewan & Tumbuhan
| Organel | Hewan | Tumbuhan |
|---------|-------|----------|
| Dinding Sel | ❌ | ✅ |
| Kloroplas | ❌ | ✅ |
| Vakuola | Kecil | Besar""",
                "duration_minutes": 8,
                "xp_reward": 80,
                "level": "Fundamental",
                "type": "text",
            },
            {
                "subject_id": subjects["chemistry"].id,
                "title": "Stoikiometri: Konsep Mol",
                "sub_category": "Kimia Dasar",
                "level": "Basic",
                "type": "text",
                "content": """### Konsep Mol dalam Stoikiometri

**1 mol = 6,022 × 10²³ partikel** (Bilangan Avogadro)

#### Rumus Penting:
- n = m / Mr (mol = massa / massa molar)
- n = V / 22,4 (mol gas pada STP)
- n = N / 6,022 × 10²³ (mol = jumlah partikel / bilangan Avogadro)

#### Contoh Soal:
Hitung jumlah mol dalam 36 gram air (H₂O, Mr = 18)!
n = 36 / 18 = 2 mol

> **Tips:** Pahami dulu hubungan antara massa, mol, dan jumlah partikel — ini adalah fondasi semua perhitungan kimia!""",
                "duration_minutes": 10,
                "xp_reward": 100,
            },
        ]

        for m in materials_data:
            material = Material(**m)
            db.add(material)

        print(f"✅ Created {len(materials_data)} materials")

        # === DAILY STATS (7 hari terakhir) ===
        today = date.today()
        for i in range(7):
            d = today - timedelta(days=6 - i)
            daily = DailyStat(
                user_id=user.id,
                date=d,
                minutes_studied=random.choice([15, 20, 30, 45, 0, 40, 25]),
                materials_completed=random.randint(0, 3),
                quizzes_taken=random.randint(0, 2),
                average_score=random.uniform(70, 95),
                xp_earned=random.randint(50, 300),
            )
            db.add(daily)

        print(f"✅ Created 7 daily stats")

        # === LEARNING SESSIONS ===
        for i in range(5):
            session = LearningSession(
                user_id=user.id,
                material_id=random.choice(materials_data).get("subject_id", 1)
                if hasattr(materials_data[i], "id")
                else None,
                session_type="material",
                duration_minutes=random.randint(5, 30),
                xp_earned=random.randint(50, 150),
                score=None,
                is_completed=True,
                completed_at=today - timedelta(days=i),
            )
            db.add(session)

        print(f"✅ Created 5 learning sessions")

        # Commit semua
        db.commit()
        print("🎉 Seeding berhasil!")

    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print(f"📦 Database: {settings.DATABASE_URL}")
    seed()
