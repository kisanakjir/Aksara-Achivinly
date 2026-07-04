"""
Seed data lengkap untuk database Aksara (22 subjects + 31 materials).
Jalankan: cd be && python seed_data.py

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
        # Hapus data lama dulu
        db.query(Material).delete()
        db.query(Subject).delete()
        db.query(User).delete()
        db.query(LearningSession).delete()
        db.query(DailyStat).delete()
        db.query(QuizResult).delete()
        db.commit()
        print("🗑️  Cleared existing data")

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
        db.flush()
        print(f"✅ Created user: {user.username}")

        # === SUBJECTS (22) ===
        subjects_data = [
            # Wajib (Nasional)
            {"name": "Pendidikan Agama & Budi Pekerti", "slug": "pendidikan-agama", "icon": "BookOpen", "color": "#10b981", "description": "Pendidikan spiritual dan moral sesuai agama masing-masing", "sort_order": 1},
            {"name": "Pendidikan Pancasila", "slug": "pancasila", "icon": "Flag", "color": "#ef4444", "description": "Nilai-nilai Pancasila, kewarganegaraan, dan bela negara", "sort_order": 2},
            {"name": "Bahasa Indonesia", "slug": "bahasa-indonesia", "icon": "Book", "color": "#f59e0b", "description": "Teks, sastra, tata bahasa, dan literasi Bahasa Indonesia", "sort_order": 3},
            {"name": "Matematika", "slug": "matematika", "icon": "BookOpen", "color": "#3b82f6", "description": "Aljabar, geometri, kalkulus, statistika, dan logika", "sort_order": 4},
            {"name": "Bahasa Inggris", "slug": "bahasa-inggris", "icon": "Globe", "color": "#ec4899", "description": "Grammar, reading comprehension, vocabulary, dan writing", "sort_order": 5},
            {"name": "PJOK", "slug": "pjok", "icon": "Activity", "color": "#84cc16", "description": "Pendidikan jasmani, olahraga, dan kesehatan", "sort_order": 6},
            {"name": "Informatika", "slug": "informatika", "icon": "Monitor", "color": "#06b6d4", "description": "Algoritma, pemrograman, dan berpikir komputasional", "sort_order": 7},
            {"name": "Sejarah", "slug": "sejarah", "icon": "Clock", "color": "#a855f7", "description": "Sejarah Indonesia, kerajaan, kolonialisme, dan kemerdekaan", "sort_order": 8},
            {"name": "Seni & Budaya", "slug": "seni-budaya", "icon": "Palette", "color": "#f97316", "description": "Seni rupa, musik, tari, teater, dan apresiasi budaya", "sort_order": 9},
            # MIPA
            {"name": "Fisika", "slug": "fisika", "icon": "Zap", "color": "#ef4444", "description": "Mekanika, termodinamika, gelombang, listrik, dan optik", "sort_order": 10},
            {"name": "Kimia", "slug": "kimia", "icon": "Beaker", "color": "#a855f7", "description": "Stoikiometri, ikatan kimia, termokimia, elektrokimia", "sort_order": 11},
            {"name": "Biologi", "slug": "biologi", "icon": "Leaf", "color": "#22c55e", "description": "Sel, genetika, evolusi, ekologi, anatomi, fisiologi", "sort_order": 12},
            {"name": "Matematika Tingkat Lanjut", "slug": "matematika-lanjut", "icon": "BookOpen", "color": "#3b82f6", "description": "Trigonometri, polinomial, kalkulus lanjut, dan vektor", "sort_order": 13},
            # IPS
            {"name": "Ekonomi", "slug": "ekonomi", "icon": "TrendingUp", "color": "#10b981", "description": "Permintaan, penawaran, pasar, dan sistem ekonomi", "sort_order": 14},
            {"name": "Sosiologi", "slug": "sosiologi", "icon": "Users", "color": "#f59e0b", "description": "Interaksi sosial, kelompok sosial, dan perubahan sosial", "sort_order": 15},
            {"name": "Geografi", "slug": "geografi", "icon": "Globe", "color": "#06b6d4", "description": "Prinsip geografi, atmosfer, hidrosfer, dan litosfer", "sort_order": 16},
            {"name": "Antropologi", "slug": "antropologi", "icon": "Search", "color": "#ec4899", "description": "Ilmu tentang manusia, kebudayaan, dan keanekaragaman budaya", "sort_order": 17},
            # Bahasa & Budaya
            {"name": "Bahasa Indonesia Tingkat Lanjut", "slug": "bahasa-indonesia-lanjut", "icon": "Book", "color": "#f59e0b", "description": "Karya ilmiah, kritik sastra, dan kebahasaan tingkat lanjut", "sort_order": 18},
            {"name": "Bahasa Inggris Tingkat Lanjut", "slug": "bahasa-inggris-lanjut", "icon": "Globe", "color": "#ec4899", "description": "Analytical exposition, hortatory, dan teks kompleks", "sort_order": 19},
            {"name": "Bahasa Asing", "slug": "bahasa-asing", "icon": "Languages", "color": "#8b5cf6", "description": "Bahasa asing pilihan: Mandarin, Arab, Jepang, dll", "sort_order": 20},
            # Vokasi
            {"name": "Prakarya & Kewirausahaan", "slug": "prakarya", "icon": "Hammer", "color": "#f97316", "description": "Kerajinan, rekayasa, budidaya, pengolahan, dan kewirausahaan", "sort_order": 21},
            # Seleksi Masuk PT
            {"name": "UTBK / SNBT", "slug": "utbk-snbt", "icon": "Target", "color": "#3b82f6", "description": "Persiapan UTBK SNBT: Penalaran Umum, PK, PBM, Literasi, PM", "sort_order": 22},
        ]

        subjects = {}
        for s in subjects_data:
            subject = Subject(**s)
            db.add(subject)
            db.flush()
            subjects[s["slug"]] = subject

        print(f"✅ Created {len(subjects_data)} subjects")

        # === MATERIALS (31) dengan YouTube ID ===
        materials_data = [
            # Wajib (Nasional)
            {"subject_slug": "pendidikan-agama", "title": "Konsep Iman, Islam, dan Ihsan", "sub_category": "Akidah", "level": "Fundamental", "type": "video", "content": "Materi ini membahas tiga pilar utama dalam ajaran Islam: Iman (percaya), Islam (tunduk), dan Ihsan (kesempurnaan). Dipelajari hubungan antara ketiganya serta implementasi dalam kehidupan sehari-hari.", "youtube_id": "1qyIiJ2Z9KA", "duration_minutes": 15, "xp_reward": 100},
            {"subject_slug": "pancasila", "title": "Makna Bhinneka Tunggal Ika", "sub_category": "Persatuan", "level": "Fundamental", "type": "video", "content": "Pembahasan tentang asal-usul, makna, dan implementasi semboyan Bhinneka Tunggal Ika dalam kehidupan berbangsa dan bernegara di Indonesia.", "youtube_id": "9Eu733Q7PhU", "duration_minutes": 12, "xp_reward": 100},
            {"subject_slug": "bahasa-indonesia", "title": "Teks Argumentasi: Struktur dan Kebahasaan", "sub_category": "Teks", "level": "Fundamental", "type": "video", "content": "Belajar mengenali, menganalisis, dan menulis teks argumentasi. Mencakup pengertian, struktur (pendahuluan, argumen, penegasan ulang), dan kaidah kebahasaan.", "youtube_id": "0fAXtsReT64", "duration_minutes": 15, "xp_reward": 100},
            {"subject_slug": "matematika", "title": "Konsep Dasar Turunan Fungsi Aljabar", "sub_category": "Kalkulus", "level": "Basic", "type": "video", "content": "Konsep turunan fungsi aljabar dari definisi limit hingga rumus utama turunan. Dibahas juga aplikasi sederhana turunan dalam kehidupan sehari-hari.", "youtube_id": "AVhhqQABddk", "duration_minutes": 18, "xp_reward": 120},
            {"subject_slug": "matematika", "title": "Cara Mudah Turunan Fungsi Aljabar", "sub_category": "Kalkulus", "level": "Basic", "type": "video", "content": "Step-by-step menyelesaikan soal turunan fungsi aljabar dengan cara cepat dan mudah dipahami. Cocok untuk pemula.", "youtube_id": "2HwfsBqqrHE", "duration_minutes": 12, "xp_reward": 100},
            {"subject_slug": "bahasa-inggris", "title": "Narrative Text: Structure & Language Features", "sub_category": "Teks", "level": "Fundamental", "type": "video", "content": "Materi lengkap tentang Narrative Text — pengertian, generic structure (orientation, complication, resolution), dan language features.", "youtube_id": "3XC3-67vQGI", "duration_minutes": 14, "xp_reward": 100},
            {"subject_slug": "pjok", "title": "Komponen Kebugaran Jasmani", "sub_category": "Kebugaran", "level": "Fundamental", "type": "video", "content": "Materi tentang komponen kebugaran jasmani, jenis latihan untuk masing-masing komponen, serta cara mengukur tingkat kebugaran jasmani.", "youtube_id": "0EJQtK_wxxM", "duration_minutes": 12, "xp_reward": 80},
            {"subject_slug": "informatika", "title": "Algoritma: Dasar Berpikir Komputasional", "sub_category": "Algoritma", "level": "Fundamental", "type": "video", "content": "Mengenal konsep algoritma sebagai fondasi berpikir komputasional dalam kehidupan sehari-hari dan pemrograman sederhana.", "youtube_id": "3hPnxPTbR0o", "duration_minutes": 10, "xp_reward": 80},
            {"subject_slug": "sejarah", "title": "Perkembangan Hindu-Buddha di Indonesia", "sub_category": "Kerajaan", "level": "Fundamental", "type": "video", "content": "Membahas proses masuknya agama Hindu dan Buddha ke Indonesia, pengaruhnya terhadap kebudayaan lokal, serta kerajaan-kerajaan Hindu-Buddha pertama.", "youtube_id": "_WsMFuKKFoE", "duration_minutes": 16, "xp_reward": 110},
            {"subject_slug": "sejarah", "title": "Kerajaan Hindu-Buddha di Indonesia", "sub_category": "Kerajaan", "level": "Intermediate", "type": "video", "content": "Detail kerajaan Hindu-Buddha: Kutai, Tarumanegara, Sriwijaya, Mataram Kuno, dan Majapahit.", "youtube_id": "0QaIEa06TrE", "duration_minutes": 18, "xp_reward": 120},
            {"subject_slug": "seni-budaya", "title": "Menggambar 2 Dimensi", "sub_category": "Seni Rupa", "level": "Fundamental", "type": "video", "content": "Memahami konsep seni rupa dua dimensi: unsur-unsur visual, prinsip komposisi, serta teknik dasar menggambar 2D.", "youtube_id": "_QS-67CtL3E", "duration_minutes": 14, "xp_reward": 80},
            # MIPA
            {"subject_slug": "fisika", "title": "Hukum Newton tentang Gerak", "sub_category": "Mekanika", "level": "Basic", "type": "video", "content": "Pembahasan lengkap Hukum I, II, III Newton — kelembaman, F=ma, aksi-reaksi. Dilengkapi contoh soal dan aplikasi.", "youtube_id": "0B_oCGTh-54", "duration_minutes": 15, "xp_reward": 120},
            {"subject_slug": "fisika", "title": "Aplikasi Hukum Newton dalam Soal", "sub_category": "Mekanika", "level": "Basic", "type": "video", "content": "Latihan soal aplikasi Hukum Newton dari soal sederhana hingga soal cerita yang sering muncul di ujian.", "youtube_id": "1scecjMJwq8", "duration_minutes": 20, "xp_reward": 130},
            {"subject_slug": "kimia", "title": "Konsep Mol dan Stoikiometri", "sub_category": "Kimia Dasar", "level": "Basic", "type": "video", "content": "Materi fundamental kimia tentang konsep mol — bilangan Avogadro, hubungan mol-massa-jumlah partikel, dan perhitungan stoikiometri.", "youtube_id": "3zHWfZ16fVo", "duration_minutes": 16, "xp_reward": 120},
            {"subject_slug": "kimia", "title": "Hukum Dasar Kimia & Stoikiometri", "sub_category": "Kimia Dasar", "level": "Intermediate", "type": "video", "content": "Hukum Lavoisier, Proust, Gay-Lussac dan aplikasinya dalam perhitungan stoikiometri. Disertai tips hitungan kimia.", "youtube_id": "3XMbIHKQ6WY", "duration_minutes": 20, "xp_reward": 140},
            {"subject_slug": "biologi", "title": "Struktur dan Fungsi Sel", "sub_category": "Biologi Sel", "level": "Fundamental", "type": "video", "content": "Mempelajari struktur dan fungsi organel sel hewan dan tumbuhan, perbedaan, dan kaitannya dengan fungsi kehidupan.", "youtube_id": "_JV38mH82F0", "duration_minutes": 14, "xp_reward": 100},
            {"subject_slug": "matematika-lanjut", "title": "Fungsi Trigonometri dan Pemodelannya", "sub_category": "Trigonometri", "level": "Intermediate", "type": "video", "content": "Fungsi trigonometri, grafik sinus/cos/tan, dan pemodelan fenomena periodik dalam kehidupan.", "youtube_id": "_ycgBH7nIQE", "duration_minutes": 18, "xp_reward": 130},
            {"subject_slug": "matematika-lanjut", "title": "Fungsi Polinomial", "sub_category": "Aljabar", "level": "Intermediate", "type": "video", "content": "Operasi aljabar, pembagian polinomial, teorema sisa, faktor, dan pemodelan matematika.", "youtube_id": "02MK6br3940", "duration_minutes": 16, "xp_reward": 120},
            # IPS
            {"subject_slug": "ekonomi", "title": "Permintaan dan Penawaran", "sub_category": "Teori Ekonomi", "level": "Basic", "type": "video", "content": "Konsep demand-supply, faktor yang mempengaruhi, dan pembentukan harga keseimbangan di pasar.", "youtube_id": "_TsyUrSkRqU", "duration_minutes": 15, "xp_reward": 110},
            {"subject_slug": "ekonomi", "title": "Kelangkaan dan Kebutuhan Manusia", "sub_category": "Dasar Ekonomi", "level": "Fundamental", "type": "video", "content": "Konsep kelangkaan sebagai inti ilmu ekonomi, jenis kebutuhan manusia, dan sistem ekonomi.", "youtube_id": "_jmDxQc48jw", "duration_minutes": 12, "xp_reward": 90},
            {"subject_slug": "sosiologi", "title": "Tindakan dan Interaksi Sosial", "sub_category": "Interaksi", "level": "Basic", "type": "video", "content": "Materi tentang tindakan sosial, interaksi sosial, dan proses sosial di masyarakat.", "youtube_id": "5TdQMBgy1e4", "duration_minutes": 16, "xp_reward": 110},
            {"subject_slug": "sosiologi", "title": "Pengertian dan Jenis Interaksi Sosial", "sub_category": "Interaksi", "level": "Fundamental", "type": "video", "content": "Pengertian interaksi sosial, syarat (kontak dan komunikasi), serta jenis interaksi sosial.", "youtube_id": "6jWVxEgh1b8", "duration_minutes": 13, "xp_reward": 100},
            {"subject_slug": "geografi", "title": "Prinsip-Prinsip Ilmu Geografi", "sub_category": "Dasar Geografi", "level": "Fundamental", "type": "video", "content": "Prinsip persebaran, interelasi, deskripsi, korologi, dan ruang lingkup studi geografi.", "youtube_id": "5Agxr3tljLI", "duration_minutes": 14, "xp_reward": 100},
            {"subject_slug": "antropologi", "title": "Pengertian dan Ruang Lingkup Antropologi", "sub_category": "Dasar Antropologi", "level": "Fundamental", "type": "video", "content": "Antropologi sebagai ilmu tentang manusia dan kebudayaan: ruang lingkup, cabang, dan metode penelitian.", "youtube_id": "aTDA7Io1oEg", "duration_minutes": 14, "xp_reward": 100},
            # Bahasa & Budaya
            {"subject_slug": "bahasa-indonesia-lanjut", "title": "Karya Tulis Ilmiah", "sub_category": "Akademik", "level": "Intermediate", "type": "video", "content": "Panduan menyusun karya tulis ilmiah: sistematika, teknik pengumpulan data, kutipan, dan bahasa Indonesia ilmiah.", "youtube_id": "1YnfRM7_8uo", "duration_minutes": 15, "xp_reward": 110},
            {"subject_slug": "bahasa-inggris-lanjut", "title": "Analytical Exposition Text", "sub_category": "Teks", "level": "Intermediate", "type": "video", "content": "Teks eksposisi analitis: struktur, ciri kebahasaan, dan cara menulis teks untuk meyakinkan pembaca.", "youtube_id": "_k75vxX4cRk", "duration_minutes": 14, "xp_reward": 100},
            {"subject_slug": "bahasa-asing", "title": "Perkenalan Diri Bahasa Mandarin", "sub_category": "Percakapan", "level": "Fundamental", "type": "video", "content": "Perkenalan dasar bahasa Mandarin: nama, asal, umur, hobi, dan pelafalan Hanzi sederhana.", "youtube_id": "_S00iW5DrAE", "duration_minutes": 10, "xp_reward": 80},
            # Vokasi
            {"subject_slug": "prakarya", "title": "Sistem Produksi Usaha Kerajinan", "sub_category": "Kewirausahaan", "level": "Intermediate", "type": "video", "content": "Sistem produksi kerajinan: perencanaan, bahan baku, proses produksi, distribusi, dan pemasaran.", "youtube_id": "_jDQQJtXWVg", "duration_minutes": 18, "xp_reward": 110},
            # UTBK
            {"subject_slug": "utbk-snbt", "title": "Penalaran Umum — Pernyataan Pasti Salah", "sub_category": "Penalaran Umum", "level": "UTBK Level", "type": "video", "content": "Strategi mengerjakan soal Penalaran Umum UTBK tipe pernyataan pasti salah: pola, identifikasi, trik cepat.", "youtube_id": "3q1q2UVTkUk", "duration_minutes": 14, "xp_reward": 150},
            {"subject_slug": "utbk-snbt", "title": "Pengetahuan Kuantitatif — Akar Berulang", "sub_category": "Pengetahuan Kuantitatif", "level": "UTBK Level", "type": "video", "content": "Rumus cepat akar berulang untuk subtes Pengetahuan Kuantitatif UTBK + latihan soal.", "youtube_id": "1g_bLjuvp2Y", "duration_minutes": 12, "xp_reward": 150},
            {"subject_slug": "utbk-snbt", "title": "Penalaran Matematika — Soal & Pembahasan", "sub_category": "Penalaran Matematika", "level": "UTBK Level", "type": "video", "content": "Pembahasan soal Penalaran Matematika UTBK. Tips mengerjakan soal berbasis konteks tanpa kalkulator.", "youtube_id": "1Pwt89OI50g", "duration_minutes": 16, "xp_reward": 150},
        ]

        for m in materials_data:
            material = Material(
                subject_id=subjects[m["subject_slug"]].id,
                title=m["title"],
                sub_category=m["sub_category"],
                level=m["level"],
                type=m["type"],
                content=m["content"],
                youtube_id=m["youtube_id"],
                duration_minutes=m["duration_minutes"],
                xp_reward=m["xp_reward"],
                is_active=True,
            )
            db.add(material)

        print(f"✅ Created {len(materials_data)} materials")

        # === DAILY STATS (7 hari) ===
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

        # Commit semua
        db.commit()
        print("\n🎉 Seeding berhasil!")
        print(f"   - 1 User (IqbalMustafa / aksara123)")
        print(f"   - 22 Mata Pelajaran")
        print(f"   - 31 Materi dengan video YouTube")
        print(f"   - 7 Daily Stats")

    except Exception as e:
        db.rollback()
        print(f"\n❌ Error seeding: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    import sys; sys.stdout.reconfigure(encoding="utf-8", errors="replace")  # type: ignore
    print(f"[Seed] Database: {settings.DATABASE_URL}")
    seed()
