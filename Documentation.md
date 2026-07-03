# 📖 Dokumentasi Perubahan & Panduan Testing

> Dokumen ini mencatat setiap perubahan yang dilakukan pada project Aksara,
> lengkap dengan cara menguji dan apa yang harus diperhatikan.

---

## 📋 Daftar Riwayat Perubahan

| Tanggal | Perubahan | Kategori |
|---------|-----------|----------|
| 03 Jul 2026 | Setup Python Backend (FastAPI + MySQL) | Backend |
| 03 Jul 2026 | Database Models (6 tabel) | Database |
| 03 Jul 2026 | API Endpoints (statistik, grafik, materi, progres) | Backend |
| 03 Jul 2026 | Service Layer (XP, stats, graph, material, Gemini AI) | Backend |
| 03 Jul 2026 | Alembic Migrations + Seed Data | Database |
| 03 Jul 2026 | Install Recharts + Buat komponen grafik | Frontend |
| 03 Jul 2026 | API Services frontend (apiClient, stats, graph, materials) | Frontend |
| 03 Jul 2026 | Sambungkan Dashboard ke Python API (dengan fallback) | Frontend |
| 03 Jul 2026 | Sambungkan Learn ke Python API (dengan fallback) | Frontend |
| 03 Jul 2026 | Fix type subCategory di Material interface | Types |
| 04 Jul 2026 | Auth Backend — Register, Login, JWT + password_hash | Backend |
| 04 Jul 2026 | Auth Frontend — Login/Register page, AuthContext, Protected Route | Frontend |

---

## 🔧 Perubahan 1: Setup Python Backend (FastAPI)

### Apa yang berubah?
- Membuat folder `be/` dengan struktur project Python modern
- Install dependencies: FastAPI, SQLAlchemy, MySQL connector, Alembic, Gemini SDK
- Konfigurasi environment via `.env` (database URL, API key)
- Entry point: `be/app/main.py`

### File-file baru:
| File | Fungsi |
|------|--------|
| `be/requirements.txt` | Daftar dependency Python |
| `be/.env` | Environment variables (DB URL, API key Gemini) |
| `be/.env.example` | Template .env (bisa di-commit ke git) |
| `be/app/__init__.py` | Package init |
| `be/app/main.py` | **Entry point FastAPI** — router, CORS, startup |
| `be/app/core/__init__.py` | Package init |
| `be/app/core/config.py` | Settings — baca dari `.env` |
| `be/app/core/database.py` | Koneksi MySQL via SQLAlchemy |

### Cara Menguji

#### 1. Cek Python & venv
```bash
# Pastikan Python 3.11+
python --version

# Aktifkan virtual environment
cd be
venv\Scripts\activate      # Windows
# atau: source venv/bin/activate  # Mac/Linux

# Cek package terinstall
pip list
```
**Hasil yang diharapkan:** Python 3.11+, ada package fastapi, sqlalchemy, dll.

#### 2. Cek import tanpa error
```bash
venv\Scripts\python -c "
from app.core.config import settings
print('Config OK:', settings.APP_NAME)
print('DB:', settings.DATABASE_URL)
"
```
**Hasil yang diharapkan:**
```
Config OK: Aksara API
DB: mysql+mysqlconnector://root:@localhost:3306/aksara_db
```

#### 3. Cek semua import models & services
```bash
venv\Scripts\python -c "
from app.models import User, Subject, Material, LearningSession, DailyStat, QuizResult
print('Models OK')
from app.services.xp_service import calculate_level_up
result = calculate_level_up(1000, 1000, 200)
print(f'XP Service OK — level up: {result[\"did_level_up\"]}')
from app.services.gemini_service import is_gemini_available
print(f'Gemini available: {is_gemini_available()}')
"
```
**Hasil yang diharapkan:** Semua print sukses, tidak ada ImportError.

---

## 🔧 Perubahan 2: Database Models (6 Tabel)

### Apa yang berubah?
- Membuat 6 SQLAlchemy models yang mewakili tabel MySQL
- Setiap model punya method `to_dict()` untuk konversi data
- Relasi foreign key antar tabel

### Struktur Tabel

#### 1. `users` — Data Pengguna
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | INT (PK) | Auto increment |
| username | VARCHAR(50) | Unique |
| display_name | VARCHAR(100) | Nama tampilan |
| avatar_url | VARCHAR(255) | URL avatar |
| level | INT | Level user (default 1) |
| current_xp | INT | XP terkumpul |
| xp_to_next_level | INT | XP yang dibutuhkan untuk naik level |
| streak_days | INT | Hari belajar beruntun |
| last_active_date | DATE | Terakhir aktif |
| total_minutes_studied | INT | Total menit belajar |
| total_questions_solved | INT | Total soal dijawab |

#### 2. `subjects` — Mata Pelajaran
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | INT (PK) | |
| name | VARCHAR(50) | Nama mapel |
| slug | VARCHAR(50) | Unique, untuk URL |
| icon, color | VARCHAR | Tampilan UI |
| sort_order | INT | Urutan tampilan |

#### 3. `materials` — Materi Belajar
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | INT (PK) | |
| subject_id | INT (FK) | Relasi ke subjects |
| title | VARCHAR(255) | Judul materi |
| sub_category | VARCHAR(100) | Sub-bab |
| level | VARCHAR(20) | Fundamental/Basic/Intermediate/Advanced/UTBK Level |
| type | VARCHAR(10) | text / video |
| content | TEXT | Konten Markdown |
| youtube_id | VARCHAR(50) | ID video YouTube |
| duration_minutes | INT | Durasi belajar |
| xp_reward | INT | XP yang didapat |
| is_active | BOOLEAN | Aktif/tidak |

#### 4. `learning_sessions` — Riwayat Belajar
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | INT (PK) | |
| user_id | INT (FK) | Relasi ke users |
| material_id | INT (FK) | Relasi ke materials |
| session_type | VARCHAR(20) | material / quiz / game |
| duration_minutes | INT | Durasi sesi |
| xp_earned | INT | XP didapat |
| score | INT | Skor (untuk quiz) |
| is_completed | BOOLEAN | Selesai/belum |

#### 5. `daily_stats` — Statistik Harian
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | INT (PK) | |
| user_id | INT (FK) | Relasi ke users |
| date | DATE | Tanggal |
| minutes_studied | INT | Menit belajar |
| materials_completed | INT | Materi selesai |
| quizzes_taken | INT | Kuis dikerjakan |
| average_score | DECIMAL(5,2) | Rata-rata skor |
| xp_earned | INT | XP didapat |

> **Unique Constraint:** `(user_id, date)` — 1 baris per user per hari

#### 6. `quiz_results` — Hasil Kuis
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | INT (PK) | |
| user_id | INT (FK) | |
| subject_id | INT (FK) | |
| question_text | TEXT | Soal |
| user_answer | VARCHAR | Jawaban user |
| correct_answer | VARCHAR | Jawaban benar |
| is_correct | BOOLEAN | Benar/salah |
| points | INT | Poin |
| time_spent_seconds | INT | Waktu pengerjaan |

### File-file baru:
| File | Fungsi |
|------|--------|
| `be/app/models/user.py` | Model User |
| `be/app/models/subject.py` | Model Subject |
| `be/app/models/material.py` | Model Material |
| `be/app/models/learning_session.py` | Model LearningSession |
| `be/app/models/daily_stat.py` | Model DailyStat |
| `be/app/models/quiz_result.py` | Model QuizResult |
| `be/app/models/__init__.py` | Export semua model |

### Cara Menguji

#### 1. Setup Database MySQL
```bash
# 1. Buka XAMPP Control Panel
# 2. Klik "Start" pada MySQL
# 3. Buka browser → http://localhost/phpmyadmin
# 4. Klik "New" → Buat database: aksara_db
#    - Collation: utf8mb4_general_ci
#    - Klik "Create"
```
**Hasil yang diharapkan:** Database `aksara_db` muncul di sidebar phpMyAdmin.

#### 2. Generate Tabel Lewat Python
```bash
cd be
venv\Scripts\python -c "
from app.core.database import init_db
print('Membuat tabel...')
init_db()
print('Tabel berhasil dibuat!')
"
```
**Hasil yang diharapkan:** Tidak ada error. Cek di phpMyAdmin → 6 tabel muncul.

#### 3. Cek Struktur Tabel
Buka phpMyAdmin → klik `aksara_db` → lihat daftar tabel:
- [ ] `users`
- [ ] `subjects`
- [ ] `materials`
- [ ] `learning_sessions`
- [ ] `daily_stats`
- [ ] `quiz_results`

Klik masing-masing tabel → tab "Structure" → cek kolom sesuai tabel di atas.

---

## 🔧 Perubahan 3: API Endpoints

### Apa yang berubah?
- Membuat 5 router FastAPI untuk grup endpoint berbeda
- Total 12 endpoint REST API
- Swagger UI otomatis di `/docs`

### Daftar Endpoint

#### Health Check
```
GET /api/health
```
Coba: http://localhost:8000/api/health

#### Statistik
```
GET /api/stats/daily?user_id=1
GET /api/stats/weekly?user_id=1
GET /api/stats/monthly?user_id=1
```

#### Grafik
```
GET /api/graph/activity?user_id=1
GET /api/graph/scores?user_id=1
GET /api/graph/subject-distribution?user_id=1
```

#### Materi
```
GET /api/subjects
GET /api/materials?subject_id=1&level=Basic
GET /api/materials/1
POST /api/materials/generate
```

#### Progres
```
POST /api/progress
```

### File-file baru:
| File | Fungsi |
|------|--------|
| `be/app/routers/health.py` | Endpoint health check |
| `be/app/routers/stats.py` | Endpoint statistik (daily, weekly, monthly) |
| `be/app/routers/graph.py` | Endpoint grafik (activity, scores, distribution) |
| `be/app/routers/materials.py` | Endpoint materi (list, detail, generate AI) |
| `be/app/routers/progress.py` | Endpoint simpan progres & XP |
| `be/app/schemas/stats.py` | Pydantic schema statistik |
| `be/app/schemas/graph.py` | Pydantic schema grafik |
| `be/app/schemas/material.py` | Pydantic schema materi |

### Cara Menguji

#### 1. Jalankan Server
```bash
cd be
venv\Scripts\uvicorn app.main:app --reload --port 8000
```
**Hasil yang diharapkan:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
🚀 Aksara API started
📖 API Docs: http://localhost:8000/docs
```
> **Catatan:** Mungkin ada warning database. Itu normal karena tabel sudah dibuat manual.

#### 2. Buka Swagger UI
Buka browser: http://localhost:8000/docs

**Yang harus muncul:**
- Judul: "Aksara API"
- Daftar endpoint terkelompok:
  - Health
  - Statistik
  - Grafik
  - Materi
  - Progres
- Tombol "Try it out" di setiap endpoint

#### 3. Test Endpoint Satu per Satu

##### a. Health Check
```
GET /api/health
```
Expected:
```json
{
  "status": "ok",
  "message": "Aksara API is running!",
  "version": "1.0.0"
}
```

##### b. Statistik Harian (akan error karena belum ada data user)
```
GET /api/stats/daily?user_id=1
```
Expected: Error 500 atau response dengan data default.

> ⚠️ **Ini normal** — nanti setelah seed data, baru berfungsi penuh.

##### c. Subjects (belum ada data)
```
GET /api/subjects
```
Expected:
```json
{
  "success": true,
  "data": []
}
```

##### d. Materials List
```
GET /api/materials
```
Expected:
```json
{
  "success": true,
  "data": [],
  "total": 0
}
```

##### e. Materials Generate (tanpa Gemini API Key → offline fallback)
```
POST /api/materials/generate
Body: {
  "subject_id": 1,
  "level": "Basic",
  "topic": "Turunan Fungsi Aljabar"
}
```
Expected:
```json
{
  "success": true,
  "data": {
    "title": "...",
    "content": "...",
    ...
  },
  "is_offline_fallback": true
}
```

##### f. Simpan Progres (akan error karena user belum ada)
```json
POST /api/progress
Body: {
  "user_id": 1,
  "material_id": null,
  "session_type": "material",
  "duration_minutes": 15,
  "xp_earned": 100,
  "score": null,
  "is_completed": true
}
```

---

## 🔧 Perubahan 4: Service Layer

### Apa yang berubah?
- 5 service module dengan business logic terpisah
- Perhitungan XP & level dengan formula `XP_PER_LEVEL_BASE = 1000, multiplier = 1.2`
- Update streak harian otomatis
- Integrasi Gemini AI dengan fallback offline

### Service yang Dibuat

| Service | File | Fungsi Utama |
|---------|------|-------------|
| **XP Service** | `xp_service.py` | `calculate_level_up()`, `update_streak()`, `update_daily_stats()` |
| **Stats Service** | `stats_service.py` | `get_daily_stats()`, `get_weekly_stats()`, `get_monthly_stats()` |
| **Graph Service** | `graph_service.py` | `get_activity_graph()`, `get_scores_graph()`, `get_subject_distribution()` |
| **Material Service** | `material_service.py` | `get_subjects()`, `get_materials()`, `get_material_by_id()`, `create_material()` |
| **Gemini Service** | `gemini_service.py` | `generate_material()`, `generate_quiz()`, `_get_offline_quiz()` |

### Detail Logika Penting

#### XP & Level
```python
XP_PER_LEVEL_BASE = 1000
XP_MULTIPLIER = 1.2

# Contoh:
# Level 1 → butuh 1000 XP
# Level 2 → butuh 1200 XP
# Level 3 → butuh 1440 XP
# dst...
```

#### Streak
- User aktif hari ini & kemarin → streak +1
- User aktif hari ini & kemarin beda >1 hari → streak reset ke 1
- User sudah aktif hari ini → streak tidak berubah

#### Gemini AI
- Cek `GEMINI_API_KEY` di `.env`
- Jika tidak ada → pakai template offline (fallback)
- Jika ada → panggil Gemini model `gemini-3.5-flash`
- Response JSON dibersihkan dari markdown wrapper

### Cara Menguji

#### 1. Test XP Service
```bash
cd be
venv\Scripts\python -c "
from app.services.xp_service import calculate_level_up

# Test 1: Level up (1000 XP + 200 XP → level up)
result = calculate_level_up(1000, 1000, 200)
print(f'Test 1 — Did level up: {result[\"did_level_up\"]}')
print(f'  Levels gained: {result[\"levels_gained\"]}')
print(f'  New XP: {result[\"new_xp\"]}')
print(f'  New XP to next: {result[\"new_xp_to_next\"]}')

# Test 2: Tidak level up
result2 = calculate_level_up(500, 1000, 200)
print(f'Test 2 — Did level up: {result2[\"did_level_up\"]}')
print(f'  Total XP: {500 + 200}')
"
```
**Hasil yang diharapkan:**
```
Test 1 — Did level up: True
  Levels gained: 1
  New XP: 200
  New XP to next: 1200
Test 2 — Did level up: False
  Total XP: 700
```

#### 2. Test Gemini Fallback
```bash
cd be
venv\Scripts\python -c "
import asyncio
from app.services.gemini_service import generate_material

async def test():
    result = await generate_material('Matematika', 'Basic', 'Turunan Fungsi')
    print(f'Success: {result[\"success\"]}')
    print(f'Fallback: {result[\"is_offline_fallback\"]}')
    print(f'Title: {result[\"data\"][\"title\"]}')

asyncio.run(test())
"
```

---

## 🔧 Perubahan 5: Database Migrations & Seed Data

### Apa yang berubah?
- Setup Alembic untuk version control database
- Migration file `001_initial_schema.py` — Create all 6 tables
- Seed data script untuk data awal development

### File-file baru:
| File | Fungsi |
|------|--------|
| `be/alembic.ini` | Konfigurasi Alembic |
| `be/alembic/env.py` | Environment Alembic (import dari app) |
| `be/alembic/script.py.mako` | Template migration |
| `be/alembic/versions/001_initial_schema.py` | Migration pertama |
| `be/seed_data.py` | Seed data awal (user, subjects, materials, stats) |

### Data Seed yang Akan Dimasukkan

| Tabel | Jumlah Data | Detail |
|-------|-------------|--------|
| **users** | 1 | `IqbalMustafa` — level 12, 4850 XP |
| **subjects** | 6 | Matematika, Fisika, Biologi, Kimia, B. Indo, B. Inggris |
| **materials** | 5 | Turunan, Integral, Hukum Newton, Sel, Stoikiometri |
| **daily_stats** | 7 | Data 7 hari terakhir (random) |
| **learning_sessions** | 5 | Sesi belajar random |

### Cara Menguji

#### 1. Seed Data
```bash
# Pastikan MySQL running + database aksara_db sudah dibuat
cd be
venv\Scripts\python seed_data.py
```
**Hasil yang diharapkan:**
```
🌱 Seeding database...
✅ Created user: IqbalMustafa
✅ Created 6 subjects
✅ Created 5 materials
✅ Created 7 daily stats
✅ Created 5 learning sessions
🎉 Seeding berhasil!
```

#### 2. Cek di phpMyAdmin
Buka http://localhost/phpmyadmin → `aksara_db`:
- [ ] Tabel `users` → ada 1 baris (IqbalMustafa)
- [ ] Tabel `subjects` → ada 6 baris
- [ ] Tabel `materials` → ada 5 baris
- [ ] Tabel `daily_stats` → ada 7 baris
- [ ] Tabel `learning_sessions` → ada 5 baris

#### 3. Test API dengan Data (setelah seed)
Jalankan server:
```bash
cd be
venv\Scripts\uvicorn app.main:app --reload --port 8000
```

Test endpoint di browser atau Swagger:

**a. Daftar Subject**
```
GET http://localhost:8000/api/subjects
```
Expected: Array 6 subjects

**b. Statistik Harian**
```
GET http://localhost:8000/api/stats/daily?user_id=1
```
Expected: Data statistik hari ini dengan user IqbalMustafa

**c. Statistik Mingguan**
```
GET http://localhost:8000/api/stats/weekly?user_id=1
```
Expected: 7 hari data dengan day_by_day array

**d. Grafik Aktivitas**
```
GET http://localhost:8000/api/graph/activity?user_id=1
```
Expected: Bar chart data dengan 7 labels

**e. Grafik Skor**
```
GET http://localhost:8000/api/graph/scores?user_id=1
```
Expected: Line chart data

**f. Daftar Materi**
```
GET http://localhost:8000/api/materials
```
Expected: Array 5 materials

**g. Detail Materi**
```
GET http://localhost:8000/api/materials/1
```
Expected: Object materi dengan title, content, dll

**h. Simpan Progres**
```
POST http://localhost:8000/api/progress
Content-Type: application/json

{
  "user_id": 1,
  "material_id": 1,
  "session_type": "material",
  "duration_minutes": 15,
  "xp_earned": 100,
  "score": null,
  "is_completed": true
}
```
Expected:
```json
{
  "success": true,
  "xp_earned": 100,
  "level_up": false,
  "new_level": null,
  "streak_days": 4,
  "message": "Progress berhasil disimpan!"
}
```

#### 4. Test Schema Migration (Opsional)
```bash
cd be
# Buat migration baru (jika rubah model)
venv\Scripts\alembic revision --autogenerate -m "Deskripsi perubahan"

# Apply migration ke database
venv\Scripts\alembic upgrade head
```

---

## 🔄 Testing Flow Lengkap (End-to-End)

Berikut urutan testing untuk memverifikasi semuanya berfungsi:

### Tahap 1: Setup Environment
```
[ ] Python 3.11+ terinstall
[ ] Virtual environment aktif
[ ] Semua dependency terinstall (pip list)
[ ] XAMPP MySQL running
[ ] Database aksara_db sudah dibuat di phpMyAdmin
```

### Tahap 2: Database
```
[ ] init_db() jalan tanpa error
[ ] 6 tabel muncul di phpMyAdmin
[ ] Struktur kolom sesuai desain
```

### Tahap 3: Seed Data
```
[ ] python seed_data.py sukses
[ ] Ada 1 user, 6 subjects, 5 materials di database
```

### Tahap 4: Server
```
[ ] uvicorn jalan tanpa error
[ ] http://localhost:8000/docs bisa diakses
[ ] http://localhost:8000/api/health response OK
```

### Tahap 5: API Endpoints
```
[ ] GET /api/subjects → 6 data
[ ] GET /api/materials → 5 data
[ ] GET /api/materials/1 → detail materi
[ ] GET /api/stats/daily?user_id=1 → data statistik
[ ] GET /api/stats/weekly?user_id=1 → 7 hari
[ ] GET /api/graph/activity?user_id=1 → bar chart
[ ] GET /api/graph/scores?user_id=1 → line chart
[ ] POST /api/progress → sukses simpan
[ ] POST /api/materials/generate → fallback OK
```

### Tahap 6: XP & Level
```
[ ] Hitung XP: 4850 + 100 → 4950 (belum level up)
[ ] Hitung XP: 4950 + 200 → 5150 → level up (sisa 150 XP)
[ ] Streak bertambah setelah POST /api/progress
```

---

## 🐛 Troubleshooting

### Error: `ModuleNotFoundError: No module named 'pydantic_settings'`
**Penyebab:** Virtual environment belum diaktifkan.
**Solusi:** 
```bash
cd be
venv\Scripts\activate
pip install -r requirements.txt
```

### Error: `Can't connect to MySQL server on 'localhost:3306'`
**Penyebab:** MySQL belum jalan di XAMPP.
**Solusi:** Buka XAMPP → Start MySQL.

### Error: `Unknown database 'aksara_db'`
**Penyebab:** Database belum dibuat.
**Solusi:** Buka phpMyAdmin → New → Buat database `aksara_db`.

### Error: `Table 'users' already exists`
**Penyebab:** Seed data sudah pernah dijalankan.
**Solusi:** Hapus dulu data di phpMyAdmin atau truncate semua tabel, lalu jalankan seed lagi.

### Swagger UI tidak muncul
**Penyebab:** Server tidak jalan atau port berbeda.
**Solusi:** Pastikan uvicorn jalan di `http://127.0.0.1:8000`. Coba akses langsung http://127.0.0.1:8000/health.

---

## 📌 Catatan Penting

1. **Data hilang saat restart?** Tidak! Karena pakai MySQL, data tetap aman.
2. **Gemini AI tidak punya API key?** Tidak masalah — fallback offline sudah siap.
3. **Port 8000 bentrok?** Ganti port: `uvicorn app.main:app --reload --port 8001`
4. **Frontend di port 3000?** CORS sudah diizinkan untuk localhost:3000 dan 5173.
5. **Ada error aneh?** Cek log di terminal — FastAPI memberikan error detail.

---

> **Catatan:** Dokumentasi ini akan terus diperbarui setiap ada perubahan.
> Jika ada yang tidak jelas, tanyakan langsung! 😊

-- END PERUBAHAN 1 --

--- AWAL PERUBAHAN 2 ---

## 🔧 Perubahan 6: Frontend — Recharts + Grafik Dashboard

### Apa yang berubah?
1. **Install Recharts** — Library grafik untuk React
2. **3 komponen grafik baru** — ActivityBarChart, ScoreLineChart, SubjectDonutChart
3. **ChartShell** — Wrapper konsisten untuk semua grafik (title, subtitle, dark mode)
4. **Dashboard diubah** — Dari grafik CSS manual → Recharts interaktif

### File baru:
| File | Fungsi |
|------|--------|
| `fe/src/components/charts/ChartShell.tsx` | Wrapper grafik dengan judul & subtitle |
| `fe/src/components/charts/ActivityBarChart.tsx` | Bar chart aktivitas mingguan |
| `fe/src/components/charts/ScoreLineChart.tsx` | Line chart tren skor harian |
| `fe/src/components/charts/SubjectDonutChart.tsx` | Donut chart distribusi mapel |

### Cara Menguji

#### 1. Cek grafik di Dashboard
1. Jalankan backend Python: `cd be && venv\Scripts\uvicorn app.main:app --reload --port 8000`
2. Jalankan frontend: `cd fe && npm run dev`
3. Buka http://localhost:3000
4. Tab **Beranda** (Dashboard)

**Yang harus muncul:**
- Bar chart aktivitas mingguan di sebelah kanan statistik
- Line chart skor harian
- Donut chart distribusi mapel

**Jika backend Python mati** → muncul fallback data demo (grafik tetap tampil pakai data dari `stats.weeklyActivity`)

**Yang harus diuji:**
- [ ] Bar chart muncul dengan 7 hari (Sen-Ming)
- [ ] Hover tooltip pada bar menampilkan menit
- [ ] Line chart menunjukkan tren skor
- [ ] Donut chart + legend mapel
- [ ] Ganti dark mode → grafik ikut berganti tema

---

## 🔧 Perubahan 7: Frontend — API Services

### Apa yang berubah?
- Membuat folder `fe/src/services/` untuk layer API
- Setiap service menangani satu domain: stats, graph, materials
- Base API client dengan `fetch` + error handling

### File baru:
| File | Fungsi |
|------|--------|
| `fe/src/services/apiClient.ts` | Base fetch wrapper (`apiGet`, `apiPost`, `ApiError`) |
| `fe/src/services/statsApi.ts` | Panggilan API statistik + progres |
| `fe/src/services/graphApi.ts` | Panggilan API grafik |
| `fe/src/services/materialsApi.ts` | Panggilan API materi |

### Cara Menguji

#### 1. Cek import di console browser
```bash
# Jalankan frontend
cd fe && npm run dev
```
Buka browser → DevTools (F12) → Console.

Tidak ada error `Failed to load module` atau `404` untuk file services.

#### 2. Cek panggilan API di Network tab
1. Buka Dashboard (tab Beranda)
2. Buka Network tab di DevTools
3. Filter: `XHR` atau `Fetch`
4. Cari request ke `localhost:8000/api/stats/daily?user_id=1`

**Jika backend Python mati** → Request gagal (status error) → Dashboard pakai fallback data demo. Ini **tidak masalah**.

**Jika backend Python hidup**:
- [ ] Status: 200
- [ ] Response body: `{ "success": true, "data": { ... } }`

#### 3. Test endpoint spesifik di console
```javascript
// Buka console browser di halaman Dashboard
fetch('http://localhost:8000/api/health')
  .then(r => r.json())
  .then(console.log)
  .catch(e => console.warn('Backend tidak aktif', e))
```

---

## 🔧 Perubahan 8: Dashboard — Sambung ke API Python

### Apa yang berubah?
- Dashboard menggunakan `useEffect` untuk fetch data dari Python API saat mount
- 3 state baru: `dailyStats`, `weeklyStats`, `activityChartData`, `scoreChartData`, `subjectDistribution`
- Loading state dengan spinner
- Error state dengan banner kuning
- **Fallback otomatis**: Jika backend mati, Dashboard pakai data dari props `stats` (data demo)
- Statistik harian/mingguan/bulanan menggunakan data API (jika ada)

### Yang Diubah di Dashboard.tsx:
- Import `useEffect` dan API services
- `useEffect` async untuk fetch data
- Angka statistik (target harian, skor) dari API atau fallback
- Grafik bawaan dari `weeklyActivity` sebagai fallback donut chart
- Error banner: "Backend Python belum tersambung. Menampilkan data demo sementara."
- Loading spinner

### Cara Menguji

#### Skenario A: Backend Python HIDUP
1. Start backend: `cd be && venv\Scripts\uvicorn app.main:app --reload --port 8000`
2. Pastikan seed data sudah dijalankan
3. Buka http://localhost:3000 (tab Beranda)
4. **Yang harus terjadi:**
   - [ ] Angka target harian sesuai data di database
   - [ ] Skor harian/mingguan dari API
   - [ ] Bar chart dari data 7 hari terakhir
   - [ ] Tidak ada banner error kuning
   - [ ] Loading spinner cepat hilang (< 1 detik)

#### Skenario B: Backend Python MATI
1. Pastikan backend TIDAK berjalan
2. Buka http://localhost:3000 (tab Beranda)
3. **Yang harus terjadi:**
   - [ ] Banner kuning muncul: "Backend Python belum tersambung..."
   - [ ] Angka statistik tetap muncul (dari props)
   - [ ] Bar chart tetap muncul (dari `weeklyActivity`)
   - [ ] Score line chart & donut chart tetap muncul (data demo)
   - [ ] Aplikasi tidak crash

---

## 🔧 Perubahan 9: Learn/Materi — Sambung ke API Python + Fix Interface

### Apa yang berubah?
- Halaman Materi sekarang fetch subjects dan materials dari Python API
- Jika API mati, fallback ke `initialMaterials` (data demo yang sudah ada)
- Material interface di `types.ts` ditambahi field `subCategory` dan `subjectId`
- Tombol "Tandai Selesai" juga menyimpan progres ke backend via `POST /api/progress`

### Yang Diubah di types.ts:
```typescript
export interface Material {
  // ... field existing
  subCategory?: string;   // ← BARU
  subjectId?: number;     // ← BARU
}
```

### Yang Diubah di Learn.tsx:
- Import `useEffect`, `getMaterials`, `getSubjects`, `saveProgress`
- State: `subjects`, `isLoadingMaterials`, `materialError`
- `useEffect` untuk fetch data saat mount
- Loading spinner saat ambil data
- Error banner jika backend mati
- `handleComplete` jadi async → save ke backend + UI optimistis
- Mapel list dinamis dari API (atau fallback ke `mapelList` hardcoded)

### Cara Menguji

#### Skenario A: Backend HIDUP
1. Backend Python jalan, seed data sudah ada
2. Buka tab **Materi**
3. **Yang harus terjadi:**
   - [ ] Mapel muncul sesuai database (Matematika, Fisika, dll)
   - [ ] Klik mapel → materi terfilter
   - [ ] Klik materi → detail muncul
   - [ ] Klik "Tandai Selesai" → data terkirim ke `/api/progress`
   - [ ] Cek Network tab → ada POST ke localhost:8000/api/progress

#### Skenario B: Backend MATI
1. Pastikan backend tidak jalan
2. Buka tab Materi
3. **Yang harus terjadi:**
   - [ ] Banner kuning: "Backend Python belum tersambung..."
   - [ ] Materi demo (3 materi) tetap muncul
   - [ ] Filter mapel tetap berfungsi
   - [ ] Klik materi → detail tetap muncul
   - [ ] Tandai selesai → UI berubah, console.warn "Gagal menyimpan progress"
   - [ ] Aplikasi tidak crash

#### 3. Cek Material interface
```bash
cd fe
npx tsc --noEmit
```
- [ ] Tidak ada error TypeScript

---

## 🔄 Testing Flow Lengkap (Tambahan Frontend)

### Tahap 6: Frontend Build
```
[ ] npx tsc --noEmit lulus tanpa error
[ ] npm run build sukses
```

### Tahap 7: Grafik Dashboard
```
[ ] Bar chart aktivitas mingguan muncul
[ ] Line chart skor harian muncul
[ ] Donut chart distribusi mapel muncul
[ ] Tooltip hover berfungsi
[ ] Dark mode theme konsisten
```

### Tahap 8: Dashboard Integration
```
[ ] Data statistik dari API (daily, weekly)
[ ] Fallback data saat backend mati
[ ] Error banner kuning muncul
[ ] Loading spinner saat fetching
```

### Tahap 9: Materi Integration
```
[ ] List mapel dari API
[ ] Filter mapel + level berfungsi
[ ] Detail materi tampil benar
[ ] Tandai selesai → kirim ke backend
[ ] Fallback data demo saat backend mati
```

---

### Catatan VITE_API_BASE_URL
Frontend membaca alamat backend dari environment variable:
```
VITE_API_BASE_URL=http://localhost:8000
```

Cara setting:
1. Buat file `fe/.env.local`:
```
VITE_API_BASE_URL=http://localhost:8000
```
2. Restart `npm run dev`

Default tanpa file `.env.local`: `http://localhost:8000` (hardcoded di `apiClient.ts`)

---

## 🔧 Perubahan 10: Autentikasi (Backend + Frontend)

### Apa yang berubah?
- **Backend**: Register, Login, JWT token, middleware `get_current_user()`
- **Frontend**: Halaman Login, Register, AuthContext, protected routes
- **Database**: Kolom `password_hash` di tabel `users`
- **API Client**: Semua request sekarang otomatis kirim `Authorization: Bearer <token>`

### File baru:
| File | Fungsi |
|------|--------|
| `be/app/routers/auth.py` | Endpoint register, login, profile |
| `be/app/schemas/auth.py` | Pydantic schemas auth |
| `be/app/services/auth_service.py` | Hash password, JWT create/decode, get_current_user |
| `fe/src/components/LoginPage.tsx` | Halaman login |
| `fe/src/components/RegisterPage.tsx` | Halaman register |
| `fe/src/contexts/AuthContext.tsx` | Auth state management (React Context) |
| `fe/src/services/authApi.ts` | API calls untuk auth |
| `fe/alembic/versions/002_add_password_hash.py` | Migration tambah kolom |

### File diubah:
| File | Perubahan |
|------|-----------|
| `be/app/models/user.py` | Tambah kolom `password_hash` + field baru |
| `be/app/main.py` | Register auth router |
| `fe/src/main.tsx` | Wrap App dengan `<AuthProvider>` |
| `fe/src/App.tsx` | Auth flow: loading → login/register → dashboard |
| `fe/src/services/apiClient.ts` | Semua request otomatis attach JWT token |

### API Endpoint Baru

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `POST` | `/api/auth/register` | Daftar akun baru |
| `POST` | `/api/auth/login` | Login, return JWT token |
| `GET` | `/api/auth/me` | Profil user (butuh token) |
| `PUT` | `/api/auth/profile` | Update profil (butuh token) |

### Cara Menguji

#### 1. Register Akun Baru
```bash
curl -s -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"Budi99","password":"rahasia123","display_name":"Budi Santoso"}' | python -m json.tool
```
**Expected:**
```json
{
  "success": true,
  "token": "eyJ...",
  "user": { "id": 2, "username": "Budi99", "level": 1, ... }
}
```

#### 2. Login
```bash
curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"Budi99","password":"rahasia123"}' | python -m json.tool
```

#### 3. Coba dengan password salah
```bash
curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"Budi99","password":"salah"}' | python -m json.tool
```
**Expected:** `"detail": "Username atau password salah"`

#### 4. Coba register duplikat
```bash
curl -s -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"Budi99","password":"test123"}' | python -m json.tool
```
**Expected:** `"detail": "Username sudah terdaftar"`

#### 5. Test frontend auth flow
1. Buka http://localhost:3000
2. **Yang muncul:** Halaman login (bukan dashboard)
3. Klik "Daftar sekarang" → halaman register
4. Register akun baru → otomatis login → masuk ke dashboard
5. Refresh halaman → tetap login (token tersimpan di localStorage)
6. Klik tombol logout (icon keluar di pojok kanan atas) → kembali ke login

#### 6. Verifikasi token di localStorage
Buka DevTools (F12) → Application → Local Storage → `aksara_token`

### Akun Testing

| Username | Password | Level |
|----------|----------|-------|
| `IqbalMustafa` | `aksara123` | 13 (seed data) |
| `Budi99` | `rahasia123` | 1 (baru register) |

### Password Seed User

Jika ingin masuk sebagai IqbalMustafa (user seed):
```
Username: IqbalMustafa
Password: aksara123
```

### Catatan Penting
- Token berlaku **7 hari** sejak login
- Token disimpan di `localStorage` dengan key `aksara_token`
- Semua API call (dashboard, materi, grafik) otomatis mengirim token via header `Authorization`
- Halaman auth (login/register) tetap bisa toggle **dark mode** dari tombol di pojok kanan
