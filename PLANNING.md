# 🎯 Rencana Pembangunan Aksara EdTech — MVP

> **Aksara** — Platform gamifikasi EdTech untuk persiapan UTBK & ujian akademik.
> **Tech Stack:** React (FE) + Python FastAPI (BE) + MySQL (DB) + Gemini AI

---

## 📋 Daftar Isi

- [1. Status Proyek — Progress Tracker](#1-status-proyek--progress-tracker)
- [2. Visi & Misi MVP](#2-visi--misi-mvp)
- [3. Arsitektur Aplikasi](#3-arsitektur-aplikasi)
- [4. Fokus MVP: Statistik, Grafik & Materi Belajar](#4-fokus-mvp-statistik-grafik--materi-belajar)
- [5. Peta Jalan Pengembangan (Roadmap)](#5-peta-jalan-pengembangan-roadmap)
- [6. Rincian Fitur MVP](#6-rincian-fitur-mvp)
- [7. Desain Database MySQL](#7-desain-database-mysql)
- [8. Struktur Folder](#8-struktur-folder)
- [9. Alur Data](#9-alur-data)
- [10. Prioritas & Estimasi](#10-prioritas--estimasi)
- [11. Persiapan Lingkungan Development](#11-persiapan-lingkungan-development)
- [12. Catatan Tambahan](#12-catatan-tambahan)

---

## 1. Status Proyek — Progress Tracker

### ✅ MVP Core Platform — SELESAI (100%)

| Task | Status | Keterangan |
|------|--------|-----------|
| **M1** Setup Python Backend | ✅ | FastAPI + SQLAlchemy + Alembic + Gemini SDK |
| **M2** Desain Database MySQL | ✅ | 6 tabel dengan relasi lengkap |
| **M3** Seed Data Awal | ✅ | 1 user, 6 subjects, 5 materials, 7 daily stats |
| **M4** API Statistik | ✅ | `/api/stats/daily`, `/api/stats/weekly`, `/api/stats/monthly` |
| **M5** API Grafik | ✅ | `/api/graph/activity`, `/api/graph/scores`, `/api/graph/subject-distribution` |
| **M6** API Materi | ✅ | CRUD materials + filter by subject/level |
| **M7** Dashboard React | ✅ | Statistik + 3 grafik Recharts (bar, line, donut) |
| **M8** Halaman Materi React | ✅ | List + detail, youtube embed, filter mapel/level |
| **M9** Gemini AI Generate | ✅ | Generate materi & quiz dengan offline fallback |
| **M10** XP & Level | ✅ | Leveling, streak, daily stats tracking |
| **M11** Polish & Testing | ✅ | Error handling, logging fix, TypeScript 0 error |

### 🚧 Bonus Terselesaikan

| Item | Keterangan |
|------|-----------|
| API Services Frontend | `apiClient.ts`, `statsApi.ts`, `graphApi.ts`, `materialsApi.ts` |
| Recharts 3 Komponen Grafik | ActivityBarChart, ScoreLineChart, SubjectDonutChart |
| Fix types.ts | Tambah `subCategory` dan `subjectId` di Material interface |
| Error Handling Docs | 3 error didokumentasikan di `errorhandling.md` |
| Database Documentation | `db_document.md` — ERD, flow, koneksi fitur |
| Dynamic Island Nav | Floating assistive navigation mode |
| Dark Mode | Toggle dark/light, konsisten di semua chart |
| Fallback System | Full offline fallback untuk semua API (dashboard, materi, AI) |

### 🟡 Next Up: Autentikasi Pengguna

Auth adalah **penghalang** terbesar untuk multi-user — saat ini semua API pakai `user_id=1` hardcoded.
Tanpa auth, fitur Leaderboard, Profil, dan Quiz personalisasi tidak bisa berfungsi.

---

## 2. Arsitektur Aplikasi

```
┌─────────────────────────────────────────────────────────────┐
│                   FRONTEND (React + Vite)                    │
│   Folder: fe/                                                │
│                                                              │
│   React 19 + TypeScript + Tailwind CSS v4 + Framer Motion     │
│   ┌────────── Recharts / Chart.js ──────────┐                │
│   │  Library grafik & visualisasi data       │                │
│   └─────────────────────────────────────────┘                │
│                                                              │
│   pages/         halaman utama                                │
│   components/    komponen reusable                            │
│   hooks/         custom hooks                                 │
│   services/      API calls ke backend                        │
│   types/         TypeScript interfaces                        │
└───────────────────────┬─────────────────────────────────────┘
                        │  HTTP REST API (JSON)
                        │  http://localhost:8000/api/
┌───────────────────────▼─────────────────────────────────────┐
│                   BACKEND (Python FastAPI)                    │
│   Folder: be/                                                 │
│                                                              │
│   FastAPI + Uvicorn + SQLAlchemy + Alembic + Gemini SDK       │
│                                                              │
│   ┌─────────────────────────────────────────────────────┐    │
│   │  API Endpoints                                       │    │
│   │                                                      │    │
│   │  GET    /api/health          → Health check          │    │
│   │  GET    /api/stats/daily     → Statistik harian      │    │
│   │  GET    /api/stats/weekly    → Statistik mingguan    │    │
│   │  GET    /api/stats/monthly   → Statistik bulanan     │    │
│   │  GET    /api/graph/activity  → Data grafik aktivitas │    │
│   │  GET    /api/graph/scores    → Data grafik skor      │    │
│   │  GET    /api/materials       → Daftar materi          │    │
│   │  GET    /api/materials/:id   → Detail materi          │    │
│   │  POST   /api/materials       → Tambah materi          │    │
│   │  POST   /api/materials/generate → Generate AI        │    │
│   │  POST   /api/progress        → Update progres belajar │    │
│   │  POST   /api/generate       → Gemini AI generate     │    │
│   └─────────────────────────────────────────────────────┘    │
│                                                              │
│   models/        SQLAlchemy models                            │
│   schemas/       Pydantic schemas (request/response)         │
│   services/      Business logic layer                        │
│   routers/       API route handlers                          │
│   core/          Config, database, dependencies              │
└───────────────────────┬─────────────────────────────────────┘
                        │  mysql+mysqlconnector://
┌───────────────────────▼─────────────────────────────────────┐
│                   DATABASE (MySQL)                           │
│                                                              │
│   phpMyAdmin untuk manajemen database                        │
│                                                              │
│   aksara_db                                                  │
│   ├── users              → Data pengguna                     │
│   ├── subjects           → Mata pelajaran                    │
│   ├── materials          → Materi belajar                    │
│   ├── learning_sessions  → Sesi belajar user                 │
│   ├── daily_stats        → Statistik harian                  │
│   └── quiz_results       → Hasil kuis/soal                   │
└─────────────────────────────────────────────────────────────┘
```

### Spesifikasi Teknis

| Layer | Teknologi | Alasan |
|-------|-----------|--------|
| **Frontend** | React 19 + TypeScript + Vite | Cepat, modern, sudah punya codebase |
| **Grafik** | Recharts | React-native, mudah dikustom, responsif |
| **Styling** | Tailwind CSS v4 | Utility-first, cepat develop |
| **Animasi** | Framer Motion (motion/react) | Animasi halus, sudah terpakai |
| **Backend** | Python FastAPI | Performa tinggi, async, auto-docs (Swagger) |
| **ORM** | SQLAlchemy 2.0 | Mature, mendukung MySQL penuh |
| **Migration** | Alembic | Version control untuk skema DB |
| **AI** | Google Generative AI Python SDK | Integrasi Gemini |
| **Database** | MySQL 8+ (via phpMyAdmin) | Robust, familiar, relasional |
| **Server BE** | Uvicorn | ASGI server untuk FastAPI |

---

## 3. Visi & Misi Proyek

### Visi
Menjadi platform belajar nomor satu di Indonesia yang membuat persiapan UTBK terasa seperti bermain game.

### Status Terkini
MVP Core (3 pilar) ✅ Selesai. **Fokus saat ini: Autentikasi & Multi-User.**

---

## 4. Fokus MVP: Statistik, Grafik & Materi Belajar

### 📊 Statistik Belajar
Data yang akan ditampilkan:

| Statistik | Sumber Data | Visualisasi |
|-----------|------------|-------------|
| Total waktu belajar hari ini | `daily_stats.minutes_studied` | Progress bar + angka |
| Rata-rata skor harian | `quiz_results` → AVG(score) | Circle progress |
| Streak hari beruntun | `daily_stats` → count consecutive days | Flame icon + angka |
| Total materi selesai | `learning_sessions` → count completed | Angka + badge |
| XP terkumpul | SUM dari semua aktivitas | Angka + progress bar level |
| Ranking (persentil) | Hitung dari total XP user | Badge posisi |

### 📈 Grafik Performa
Grafik yang akan ditampilkan:

| Grafik | Tipe | Data |
|--------|------|------|
| **Aktivitas Mingguan** | Bar chart | Menit belajar per hari (Sen-Ming) |
| **Skor Harian** | Line chart | Rata-rata skor kuis 7 hari terakhir |
| **Distribusi Waktu per Mapel** | Pie / Donut chart | Persentase waktu per mata pelajaran |
| **Progres Level** | Area chart | Akumulasi XP dari waktu ke waktu |

### 📚 Materi Belajar
Fitur materi yang akan dijadikan fokus:

- ✅ **Daftar materi** per mata pelajaran (filter by subject)
- ✅ **Tingkat kesulitan** (Fundamental → Basic → Intermediate → Advanced → UTBK)
- ✅ **Konten Markdown + Embedded YouTube**
- ✅ **AI Generate materi** via Gemini (dengan fallback template)
- ✅ **Tracking progres** — materi selesai/ belum
- ✅ **XP reward** setiap selesai materi

---

## 5. Peta Jalan Pengembangan (Roadmap)

### 🟢 Fase MVP — Core Platform (Minggu 1-4) ✅ SELESAI

| No | Task | Status | Estimasi |
|----|------|--------|----------|
| **M1** | **Setup Python Backend** — FastAPI + struktur project + koneksi MySQL | ✅ | 2 hari |
| **M2** | **Desain Database MySQL** — Tabel users, subjects, materials, stats, quiz_results | ✅ | 1 hari |
| **M3** | **Seed Data** — Input data materi & mapel via phpMyAdmin atau script | ✅ | 1 hari |
| **M4** | **API Endpoints Statistik** — Daily, weekly, monthly stats | ✅ | 2 hari |
| **M5** | **API Endpoints Grafik** — Data untuk bar chart, line chart, donut | ✅ | 2 hari |
| **M6** | **API Endpoints Materi** — CRUD materi, detail, filter by mapel/level | ✅ | 2 hari |
| **M7** | **Dashboard React** — Tampilkan statistik + grafik dari API | ✅ | 3 hari |
| **M8** | **Halaman Materi React** — List + detail materi, filter, search | ✅ | 3 hari |
| **M9** | **Gemini AI Generate** — Generate materi & quiz via Python SDK | ✅ | 2 hari |
| **M10** | **Sistem XP & Level** — Reward XP, level up, streak tracking | ✅ | 2 hari |
| **M11** | **Polish & Testing** — Responsive, error handling, load test | ✅ | 2 hari |

### 🔵 Fase 2 — Multi-User & Autentikasi (Sekarang)

| No | Task | Prioritas | Estimasi |
|----|------|-----------|----------|
| **A1** | **Auth Backend** — Register, login, JWT token, middleware | 🔥 Critical | 2 hari |
| **A2** | **Auth Frontend** — Halaman Login/Register, AuthContext, Protected Route | 🔥 Critical | 2 hari |
| **A3** | **Multi-user API** — Hapus user_id=1 hardcoded, pakai token user | 🔥 Critical | 1 hari |
| **A4** | **Halaman Profil** — Edit profil, avatar, statistik pribadi | ⭐ High | 2 hari |

### 🟣 Fase 3 — Konten & Interaktivitas (Setelah Auth)

| No | Task | Prioritas | Estimasi |
|----|------|-----------|----------|
| C1 | **Quiz/Tryout** — Soal interaktif dengan timer + AI generate | 🔥 High | 3 hari |
| C2 | **Leaderboard** — Peringkat antar user dari database | ⭐ Medium | 2 hari |
| C3 | **GameZone Expansion** — Node & map baru | 🟢 Low | 3 hari |
| C4 | **Forum Diskusi** — Feed sosial, like, komentar | 🟢 Low | 3 hari |

### 🟠 Fase 4 — AI & Skalabilitas (Masa Depan)

| No | Task | Prioritas | Estimasi |
|----|------|-----------|----------|
| S1 | **AI Tutor/Chat** — Chat dengan Gemini dengan konteks riwayat | 🔥 High | 4 hari |
| S2 | **Rekomendasi Materi** — "Kamu lemah di X, coba materi Y" | ⭐ Medium | 3 hari |
| S3 | **Soal Adaptif** — Soal menyesuaikan level user | ⭐ Medium | 3 hari |
| S4 | **Laporan Analitik** — Dashboard insight kognitif | 🟢 Low | 3 hari |
| S5 | **Deployment** — Docker + VPS/Cloud | ⭐ Medium | 2 hari |

---

## 5. Rincian Fitur MVP

### M1: Setup Python Backend

**Struktur awal project backend (`be/`):**

```
be/
├── app/
│   ├── __init__.py
│   ├── main.py              # Entry point FastAPI
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py        # Settings (DB URL, API keys)
│   │   ├── database.py      # SQLAlchemy engine & session
│   │   └── dependencies.py  # Dependency injection
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── subject.py
│   │   ├── material.py
│   │   ├── learning_session.py
│   │   ├── daily_stat.py
│   │   └── quiz_result.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── stats.py         # Pydantic untuk response statistik
│   │   ├── material.py      # Pydantic untuk material
│   │   └── graph.py         # Pydantic untuk data grafik
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── stats.py         # Endpoints statistik
│   │   ├── graph.py         # Endpoints grafik
│   │   ├── materials.py     # Endpoints materi
│   │   └── generate.py      # Endpoints AI generate
│   └── services/
│       ├── __init__.py
│       ├── stats_service.py     # Logic statistik
│       ├── graph_service.py     # Logic grafik
│       ├── material_service.py  # Logic materi
│       └── gemini_service.py    # Logic Gemini AI
├── alembic/                # Database migrations
├── alembic.ini
├── requirements.txt        # Python dependencies
├── seed_data.py            # Script untuk seed data awal
└── .env                    # Environment variables
```

**Dependencies (`requirements.txt`):**
```
fastapi==0.115.0
uvicorn[standard]==0.30.0
sqlalchemy==2.0.35
mysql-connector-python==9.0.0
alembic==1.13.0
pydantic==2.9.0
pydantic-settings==2.5.0
python-dotenv==1.0.1
google-generativeai==0.8.0
python-multipart==0.0.12
corsheaders==4.2.0
```

### M2: Desain Database MySQL

**Database:** `aksara_db` (via phpMyAdmin)

#### Table: `users`

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100),
    avatar_url VARCHAR(255),
    level INT DEFAULT 1,
    current_xp INT DEFAULT 0,
    xp_to_next_level INT DEFAULT 1000,
    streak_days INT DEFAULT 0,
    last_active_date DATE,
    total_minutes_studied INT DEFAULT 0,
    total_questions_solved INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### Table: `subjects`

```sql
CREATE TABLE subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,          -- Matematika, Fisika, Biologi, dll
    slug VARCHAR(50) NOT NULL UNIQUE,   -- math, physics, biology
    icon VARCHAR(50),                   -- Nama icon
    color VARCHAR(20),                  -- Warna tema
    description TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Table: `materials`

```sql
CREATE TABLE materials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    sub_category VARCHAR(100),          -- Sub-bab spesifik
    level ENUM('Fundamental','Basic','Intermediate','Advanced','UTBK Level') NOT NULL,
    type ENUM('text','video') DEFAULT 'text',
    content TEXT,                       -- Konten Markdown
    youtube_id VARCHAR(50),             -- YouTube embed ID
    duration_minutes INT DEFAULT 10,
    xp_reward INT DEFAULT 100,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);
```

#### Table: `learning_sessions`

```sql
CREATE TABLE learning_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    material_id INT,
    session_type ENUM('material','quiz','game') DEFAULT 'material',
    duration_minutes INT DEFAULT 0,
    xp_earned INT DEFAULT 0,
    score INT,                          -- 0-100 untuk quiz
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE SET NULL
);
```

#### Table: `daily_stats`

```sql
CREATE TABLE daily_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    date DATE NOT NULL,
    minutes_studied INT DEFAULT 0,
    materials_completed INT DEFAULT 0,
    quizzes_taken INT DEFAULT 0,
    average_score DECIMAL(5,2),         -- Rata-rata skor hari ini
    xp_earned INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_date (user_id, date)
);
```

#### Table: `quiz_results`

```sql
CREATE TABLE quiz_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    subject_id INT,
    question_text TEXT NOT NULL,
    user_answer VARCHAR(255),
    correct_answer VARCHAR(255),
    is_correct BOOLEAN,
    points INT DEFAULT 0,
    time_spent_seconds INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL
);
```

#### Entity Relationship Diagram (ERD)

```
users 1───* learning_sessions *───1 materials
  │                                   │
  │                                   1
  │                                   │
  1                                   │
  │                                   │
  ├───* daily_stats                   │
  │                                   │
  └───* quiz_results *───1 subjects
```

### M4-M6: API Endpoints Detail

#### `GET /api/stats/daily`
Returns:
```json
{
  "success": true,
  "data": {
    "date": "2026-07-03",
    "minutes_studied": 45,
    "materials_completed": 3,
    "quizzes_taken": 2,
    "average_score": 85.5,
    "xp_earned": 350,
    "streak_days": 4,
    "level": 12,
    "current_xp": 4850,
    "xp_to_next_level": 5000,
    "daily_goal_minutes": 30,
    "goal_progress_percentage": 150
  }
}
```

#### `GET /api/stats/weekly`
Returns:
```json
{
  "success": true,
  "data": {
    "total_minutes": 165,
    "total_xp": 1200,
    "average_score": 82.3,
    "active_days": 6,
    "materials_completed": 12,
    "day_by_day": [
      {"day": "Sen", "date": "2026-06-27", "minutes": 20, "score": 75, "xp": 150},
      {"day": "Sel", "date": "2026-06-28", "minutes": 45, "score": 85, "xp": 300},
      {"day": "Rab", "date": "2026-06-29", "minutes": 15, "score": 80, "xp": 100},
      {"day": "Kam", "date": "2026-06-30", "minutes": 30, "score": 90, "xp": 200},
      {"day": "Jum", "date": "2026-07-01", "minutes": 0, "score": 0, "xp": 0},
      {"day": "Sab", "date": "2026-07-02", "minutes": 40, "score": 88, "xp": 250},
      {"day": "Min", "date": "2026-07-03", "minutes": 15, "score": 85, "xp": 200}
    ]
  }
}
```

#### `GET /api/graph/activity`
Returns data untuk bar chart:
```json
{
  "success": true,
  "data": {
    "type": "bar",
    "labels": ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],
    "datasets": [
      {
        "label": "Menit Belajar",
        "data": [20, 45, 15, 30, 0, 40, 15],
        "backgroundColor": "#3b82f6"
      }
    ]
  }
}
```

#### `GET /api/graph/scores`
Returns data untuk line chart:
```json
{
  "success": true,
  "data": {
    "type": "line",
    "labels": ["H-7", "H-6", "H-5", "H-4", "H-3", "H-2", "Hari Ini"],
    "datasets": [
      {
        "label": "Rata-rata Skor",
        "data": [72, 78, 75, 82, 80, 85, 88],
        "borderColor": "#3b82f6"
      }
    ]
  }
}
```

#### `GET /api/graph/subject-distribution`
Returns data untuk donut chart:
```json
{
  "success": true,
  "data": {
    "type": "donut",
    "labels": ["Matematika", "Fisika", "Biologi", "Kimia", "Bahasa"],
    "datasets": [
      {
        "data": [45, 20, 15, 10, 10]
      }
    ]
  }
}
```

#### `GET /api/materials?subject_id=1&level=Basic`
Returns filtered materials.

#### `GET /api/materials/:id`
Returns detail materi termasuk konten markdown dan YouTube embed.

#### `POST /api/materials/generate`
Generate materi baru via Gemini AI:
```json
{
  "subject_id": 1,
  "level": "Intermediate",
  "topic": "Turunan Fungsi Aljabar"
}
```

#### `POST /api/progress`
Update progres belajar:
```json
{
  "user_id": 1,
  "material_id": 3,
  "session_type": "material",
  "duration_minutes": 15,
  "xp_earned": 100,
  "is_completed": true
}
```

### M7: Dashboard React

Halaman utama yang menampilkan:

1. **Header Stats Bar** — XP, Level, Streak, Daily Goal (dari `/api/stats/daily`)
2. **Grafik Aktivitas Mingguan** — Bar chart (dari `/api/graph/activity`)
3. **Grafik Skor Harian** — Line chart (dari `/api/graph/scores`)
4. **Distribusi Waktu per Mapel** — Donut chart (dari `/api/graph/subject-distribution`)
5. **Ringkasan Statistik** — Total waktu, rata-rata skor, streak (dari `/api/stats/weekly`)

### M8: Halaman Materi React

1. **List View** — Filter by mapel + level, grid of material cards
2. **Detail View** — Markdown content + YouTube embed + "Tandai Selesai" button

### M9: Gemini AI Generate

```python
# be/app/services/gemini_service.py
import google.generativeai as genai
from app.core.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)

async def generate_material(subject: str, level: str, topic: str) -> dict:
    model = genai.GenerativeModel("gemini-3.5-flash")
    
    prompt = f"""Buatkan materi belajar tentang {topic} untuk mata pelajaran {subject} 
    tingkat {level} dalam Bahasa Indonesia. Format JSON dengan properti:
    title, content (Markdown), youtube_search_query, duration_minutes, xp_reward.
    """
    
    response = model.generate_content(prompt)
    # Parse response JSON
    return response.text

async def generate_quiz(subject: str, level: str, topic: str, count: int = 5) -> list:
    # Similar pattern untuk generate quiz questions
    pass
```

### M10: Sistem XP & Level

Logika leveling (di backend Python):

```python
# be/app/services/xp_service.py
XP_PER_LEVEL_BASE = 1000
XP_MULTIPLIER = 1.2

def calculate_level_up(current_xp: int, xp_to_next: int, earned_xp: int):
    """
    Return (new_xp, new_level, new_xp_to_next, did_level_up)
    """
    total = current_xp + earned_xp
    new_level = 0  # calculated
    remaining = total
    
    # Hitung berapa kali level up
    while remaining >= xp_to_next:
        remaining -= xp_to_next
        new_level += 1
        xp_to_next = int(xp_to_next * XP_MULTIPLIER)
    
    return remaining, new_level, xp_to_next, new_level > 0
```

---

## 6. Desain Database MySQL

### Setup Database via phpMyAdmin

1. Buat database baru: `aksara_db` (Collation: `utf8mb4_general_ci`)
2. Jalankan SQL statements dari [M2](#m2-desain-database-mysql) di tab SQL
3. Atau jalankan migration via Alembic:
```bash
cd be/
alembic init migrations
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

### Seed Data Awal

**Subjects:**
| name | slug | color |
|------|------|-------|
| Matematika | math | #3B82F6 |
| Fisika | physics | #EF4444 |
| Biologi | biology | #22C55E |
| Kimia | chemistry | #A855F7 |
| Bahasa Indonesia | indonesian | #F59E0B |
| Bahasa Inggris | english | #EC4899 |
| UTBK / SNBT | utbk | #8B5CF6 |

**Sample Materials:** Minimal 3-5 materi per subject dengan variasi level.

### Koneksi Python ke MySQL

```python
# be/app/core/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "Aksara API"
    DATABASE_URL: str = "mysql+mysqlconnector://root:@localhost:3306/aksara_db"
    GEMINI_API_KEY: str = ""
    
    class Config:
        env_file = ".env"

settings = Settings()
```

```python
# be/app/core/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

---

## 7. Struktur Folder

```
aksara/                          # Root project
├── fe/                          # Frontend React (existing codebase)
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── index.css
│   │   ├── types.ts
│   │   ├── hooks/
│   │   │   └── useApi.ts        # Hook untuk fetch API
│   │   ├── services/
│   │   │   ├── statsApi.ts      # Panggilan API statistik
│   │   │   ├── graphApi.ts      # Panggilan API grafik
│   │   │   └── materialApi.ts   # Panggilan API materi
│   │   ├── components/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Learn.tsx
│   │   │   ├── Quiz.tsx
│   │   │   └── ...
│   │   └── └── charts/          # NEW — komponen grafik
│   │           ├── ActivityBarChart.tsx
│   │           ├── ScoreLineChart.tsx
│   │           └── SubjectDonutChart.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── server.ts                # Express dev server (untuk FE only)
│
├── be/                          # Backend Python (NEW — dari awal)
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── database.py
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── subject.py
│   │   │   ├── material.py
│   │   │   ├── learning_session.py
│   │   │   ├── daily_stat.py
│   │   │   └── quiz_result.py
│   │   ├── schemas/
│   │   │   ├── stats.py
│   │   │   ├── graph.py
│   │   │   └── material.py
│   │   ├── routers/
│   │   │   ├── stats.py
│   │   │   ├── graph.py
│   │   │   ├── materials.py
│   │   │   └── generate.py
│   │   └── services/
│   │       ├── stats_service.py
│   │       ├── graph_service.py
│   │       ├── material_service.py
│   │       └── gemini_service.py
│   ├── alembic/
│   ├── requirements.txt
│   ├── seed_data.py
│   └── .env
│
├── PLANNING.md                  # Dokumen ini
└── CLAUDE.md                    # Panduan untuk AI coding
```

---

## 8. Alur Data

### Flow: User Buka Dashboard

```
Browser                          Backend Python                    MySQL
  │                                  │                              │
  │  1. GET /api/stats/daily         │                              │
  │  ──────────────────────────────> │                              │
  │                                  │  2. SELECT * FROM daily_stats│
  │                                  │     WHERE user_id=1          │
  │                                  │     AND date=CURDATE()      │
  │                                  │ ───────────────────────────> │
  │                                  │  <── Row data ─────────────│
  │                                  │                              │
  │                                  │  3. Hitung streak, level,   │
  │                                  │     persentase goal          │
  │                                  │                              │
  │  <── JSON response ─────────── │                              │
  │                                  │                              │
  │  4. React render stats + grafik  │                              │
```

### Flow: User Belajar Materi

```
Browser                          Backend Python                    MySQL
  │                                  │                              │
  │  1. GET /api/materials?subject=1 │                              │
  │  ──────────────────────────────> │                              │
  │                                  │  2. SELECT * FROM materials  │
  │                                  │ ───────────────────────────> │
  │                                  │  <── Array of materials ───│
  │  <── JSON list ─────────────── │                              │
  │                                  │                              │
  │  3. Klik materi → detail        │                              │
  │     GET /api/materials/3        │                              │
  │  ──────────────────────────────> │  4. SELECT by id             │
  │  <── JSON detail ───────────── │                              │
  │                                  │                              │
  │  5. Klik "Tandai Selesai"       │                              │
  │     POST /api/progress          │                              │
  │  ──────────────────────────────> │  6. INSERT learning_sessions │
  │                                  │  7. UPDATE daily_stats       │
  │                                  │  8. UPDATE users.xp         │
  │                                  │ ───────────────────────────> │
  │  <── {success, xp_earned} ──── │                              │
```

---

## 9. Prioritas & Estimasi

### Urutan Pengerjaan (Recommended Order)

```
Minggu 1:              Minggu 2:              Minggu 3:              Minggu 4:
┌──────────────┐      ┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│ M1 Setup BE  │      │ M4 Stats API │       │ M7 Dashboard │       │ M10 XP/Level │
│ M2 Database  │      │ M5 Graph API │       │ React +      │       │ Polish       │
│ M3 Seed Data │      │ M6 Materi    │       │ Charts       │       │ Testing      │
│              │      │   API        │       │ M8 Materi    │       │              │
│              │      │              │       │   Halaman    │       │              │
│              │      │              │       │ M9 AI Gen    │       │              │
└──────────────┘      └──────────────┘       └──────────────┘       └──────────────┘
```

### Matriks Prioritas MVP

| | Dampak Rendah | Dampak Sedang | Dampak Tinggi |
|--|--------------|--------------|--------------|
| **Mudah** | Seed data | | **M2 Database** |
| | | | **M3 Seed Data** |
| **Sedang** | Polish | **M1 Setup BE** | **M4 Stats API** |
| | | **M7 Dashboard** | **M5 Graph API** |
| | | **M8 Materi** | **M6 Materi API** |
| **Sulit** | Testing | M9 AI Generate | M10 XP/Level |

---

## 10. Persiapan Lingkungan Development

### Prasyarat

| Tools | Version Minimal | Catatan |
|-------|----------------|---------|
| Node.js | 18+ | Sudah terinstall |
| Python | 3.11+ | Perlu install |
| MySQL | 8.0+ | Via XAMPP / Laragon / langsung |
| phpMyAdmin | Latest | Biasanya bundled dengan MySQL |
| VSCode | Latest | Sudah terinstall |

### Langkah Setup

#### 1. Database MySQL
```bash
# Via XAMPP:
- Start Apache + MySQL
- Buka http://localhost/phpmyadmin
- Buat database: aksara_db (utf8mb4_general_ci)
- Import SQL dari be/schema.sql
```

#### 2. Backend Python
```bash
cd be/
python -m venv venv
source venv/bin/activate  # atau venv\Scripts\activate (Windows)
pip install -r requirements.txt
cp .env.example .env       # Isi GEMINI_API_KEY
# Jalankan migration
alembic upgrade head
# Seed data awal
python seed_data.py
# Jalankan server
uvicorn app.main:app --reload --port 8000
# Buka http://localhost:8000/docs (Swagger UI)
```

#### 3. Frontend React
```bash
cd fe/
npm install
npm run dev
# Buka http://localhost:3000
```

### CORS Setup

```python
# be/app/main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 11. Catatan Tambahan

### Yang Perlu Diubah dari Kode Existing

1. **server.ts** — Backend Express akan diganti dengan Python FastAPI. Server.ts hanya perlu serve frontend (Vite middleware / static files).
2. **App.tsx** — Sesuaikan `fetch()` calls dari `http://localhost:3000/api/*` ke `http://localhost:8000/api/*`
3. **Dashboard.tsx** — Tambah komponen grafik (Recharts) dan fetch data dari API statistik
4. **Learn.tsx** — Sesuaikan untuk fetch data dari Python API
5. **types.ts** — Sesuaikan interface dengan response dari Python API
6. **Hapus** — Kode Express di server.ts yang berisi logic API (pindah ke Python)

### Library Grafik Rekomendasi

Untuk React charts, pilih salah satu:

| Library | Alasan |
|---------|--------|
| **Recharts** ⭐ | React-native, deklaratif, bagus untuk bar/line/pie |
| Chart.js + react-chartjs-2 | Ringan, banyak plugin, community besar |
| Nivo | Server-side rendering, bagus untuk kompleks |

**Rekomendasi: Recharts** — karena:
- Sudah React-native (deklaratif, cocok dengan paradigma React)
- Mudah dikustom (animasi, tooltip, responsive)
- Ringan (~200KB)
- Contoh:

```tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { day: 'Sen', minutes: 20 },
  { day: 'Sel', minutes: 45 },
  { day: 'Rab', minutes: 15 },
  { day: 'Kam', minutes: 30 },
  { day: 'Jum', minutes: 0 },
  { day: 'Sab', minutes: 40 },
  { day: 'Min', minutes: 15 },
];

export default function ActivityChart({ isDarkMode }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <XAxis dataKey="day" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="minutes" fill="#3b82f6" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
```

### Checklist Progres MVP

```
[ ] Fase MVP — Core Platform
  [ ] M1 Setup Python FastAPI backend
  [ ] M2 Desain database MySQL + migration
  [ ] M3 Seed data awal (subjects, materials)
  [ ] M4 API endpoints statistik (daily, weekly, monthly)
  [ ] M5 API endpoints grafik (activity, scores, distribution)
  [ ] M6 API endpoints materi (CRUD, filter, detail)
  [ ] M7 Dashboard React dengan statistik & grafik (Recharts)
  [ ] M8 Halaman materi React (list + detail)
  [ ] M9 Gemini AI generate (materi & quiz)
  [ ] M10 Sistem XP, level, streak
  [ ] M11 Polish & testing

Catatan:
  [ ] Setup MySQL via phpMyAdmin
  [ ] Setup Python virtual environment
  [ ] Install Recharts di frontend
  [ ] Konfigurasi CORS backend-frontend
  [ ] Test alur end-to-end
```

---

> **Catatan**: Dokumen ini adalah *living document*. ✅ MVP selesai. 🟡 Fokus sekarang: **Autentikasi & Multi-User**. 🚀
