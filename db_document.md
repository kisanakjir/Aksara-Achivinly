# 🗄️ Database Dokumentasi — Aksara EdTech

> Dokumentasi lengkap struktur database MySQL, relasi antar tabel, alur data,
> dan bagaimana setiap tabel terhubung ke fitur di frontend & backend.

---

## 📋 Daftar Isi

- [1. Entity Relationship Diagram (ERD)](#1-entity-relationship-diagram-erd)
- [2. Spesifikasi Tabel](#2-spesifikasi-tabel)
  - [2.1 `users`](#21-users)
  - [2.2 `subjects`](#22-subjects)
  - [2.3 `materials`](#23-materials)
  - [2.4 `learning_sessions`](#24-learning_sessions)
  - [2.5 `daily_stats`](#25-daily_stats)
  - [2.6 `quiz_results`](#26-quiz_results)
- [3. Alur Data (Data Flow)](#3-alur-data-data-flow)
  - [3.1 Flow: User Belajar Materi](#31-flow-user-belajar-materi)
  - [3.2 Flow: Dashboard Statistik](#32-flow-dashboard-statistik)
  - [3.3 Flow: Grafik & Visualisasi](#33-flow-grafik--visualisasi)
- [4. Koneksi Tabel ke Fitur](#4-koneksi-tabel-ke-fitur)

---

## 1. Entity Relationship Diagram (ERD)

```
  ┌─────────────────────────────────────────────────────────────────┐
  │                         RELASI TABEL                            │
  │                                                                  │
  │  ┌──────────┐       ┌──────────────┐       ┌──────────────┐    │
  │  │  users   │       │  subjects    │       │  materials   │    │
  │  │──────────│       │──────────────│       │──────────────│    │
  │  │ id (PK)  │ 1    │ id (PK)      │ 1     │ id (PK)      │    │
  │  │ username │──┐   │ name         │──┐    │ subject_id   │◄───┤
  │  │ level    │  │   │ slug         │  │    │ (FK)         │    │
  │  │ current_xp│  │   │ color        │  │    │ title        │    │
  │  │ streak   │  │   │ sort_order   │  │    │ level        │    │
  │  └──────────┘  │   └──────────────┘  │    │ content      │    │
  │                │        │            │    │ xp_reward    │    │
  │                │        │            │    └──────┬───────┘    │
  │                │        │            │           │            │
  │                │  ┌─────┴────────────┴─┐         │            │
  │                │  │                    │         │            │
  │                │  │  quiz_results      │         │            │
  │                │  │────────────────────│         │            │
  │                ├──│ user_id (FK)       │         │            │
  │                │  │ subject_id (FK)◄───┘         │            │
  │                │  │ question_text                 │            │
  │                │  │ is_correct                    │            │
  │                │  └───────────────────┘            │            │
  │                │                                  │            │
  │                │  ┌──────────────────────┐         │            │
  │                │  │                      │         │            │
  │                ├──│  learning_sessions   │         │            │
  │                │  │──────────────────────│         │            │
  │                │  │ user_id (FK)         │         │            │
  │                │  │ material_id (FK)◄────┘         │            │
  │                │  │ session_type                    │            │
  │                │  │ duration_minutes                 │            │
  │                │  │ xp_earned                       │            │
  │                │  │ score                           │            │
  │                │  └──────────────────────┘            │            │
  │                │                                      │            │
  │                │  ┌──────────────────────┐             │            │
  │                └──│  daily_stats         │             │            │
  │                   │──────────────────────│             │            │
  │                   │ user_id (FK)         │             │            │
  │                   │ date                 │             │            │
  │                   │ minutes_studied      │             │            │
  │                   │ average_score        │             │            │
  │                   │ xp_earned            │             │            │
  │                   └──────────────────────┘             │            │
  │                                                                  │
  └─────────────────────────────────────────────────────────────────┘
```

### Ringkasan Relasi

| Tabel | Relasi | Tabel Tujuan | Melalui |
|-------|--------|-------------|---------|
| `users` | 1 ─── * | `learning_sessions` | `user_id` |
| `users` | 1 ─── * | `daily_stats` | `user_id` |
| `users` | 1 ─── * | `quiz_results` | `user_id` |
| `subjects` | 1 ─── * | `materials` | `subject_id` |
| `subjects` | 1 ─── * | `quiz_results` | `subject_id` |
| `materials` | 1 ─── * | `learning_sessions` | `material_id` |

---

## 2. Spesifikasi Tabel

### 2.1 `users`

Data utama pengguna. Menyimpan informasi profil, progres level, XP, dan streak.

| Kolom | Tipe | Constraint | Default | Keterangan |
|-------|------|-----------|---------|------------|
| `id` | INT | PK, AUTO_INCREMENT | | ID unik user |
| `username` | VARCHAR(50) | UNIQUE, NOT NULL | | Username login |
| `display_name` | VARCHAR(100) | NULLABLE | | Nama tampilan |
| `avatar_url` | VARCHAR(255) | NULLABLE | | URL foto profil |
| `level` | INT | NOT NULL | `1` | Level saat ini |
| `current_xp` | INT | NOT NULL | `0` | XP terkumpul di level ini |
| `xp_to_next_level` | INT | NOT NULL | `1000` | XP butuh untuk naik level |
| `streak_days` | INT | NOT NULL | `0` | Hari belajar beruntun |
| `last_active_date` | DATE | NULLABLE | | Tanggal terakhir aktivitas |
| `total_minutes_studied` | INT | NOT NULL | `0` | Total menit belajar |
| `total_questions_solved` | INT | NOT NULL | `0` | Total soal dijawab |
| `created_at` | TIMESTAMP | | `CURRENT_TIMESTAMP` | Waktu dibuat |
| `updated_at` | TIMESTAMP | | `CURRENT_TIMESTAMP ON UPDATE` | Waktu diupdate |

**Relationships:**
```python
# be/app/models/user.py → baris 25-27
# Tidak ada relationship langsung di model User,
# relasi ada di model lain yang mengarah ke User:
#   LearningSession.user → relationship("User", backref="learning_sessions")
#   (didefinisikan di learning_session.py baris 26)
```

---

### 2.2 `subjects`

Mata pelajaran yang tersedia di platform.

| Kolom | Tipe | Constraint | Default | Keterangan |
|-------|------|-----------|---------|------------|
| `id` | INT | PK, AUTO_INCREMENT | | ID unik mapel |
| `name` | VARCHAR(50) | NOT NULL | | Nama mapel (Matematika, Fisika, dll) |
| `slug` | VARCHAR(50) | UNIQUE, NOT NULL | | Slug URL (math, physics) |
| `icon` | VARCHAR(50) | NULLABLE | | Nama icon Lucide |
| `color` | VARCHAR(20) | NULLABLE | | Warna tema (#3b82f6) |
| `description` | TEXT | NULLABLE | | Deskripsi mapel |
| `sort_order` | INT | NOT NULL | `0` | Urutan tampilan |
| `created_at` | TIMESTAMP | | `CURRENT_TIMESTAMP` | Waktu dibuat |

**Relationships:**
```python
# Relasi ada di model Material (material.py baris 33):
#   subject = relationship("Subject", backref="materials")
# → Subject bisa akses: subject.materials (semua materi milik mapel ini)
```

---

### 2.3 `materials`

Konten belajar — teks markdown atau video YouTube.

| Kolom | Tipe | Constraint | Default | Keterangan |
|-------|------|-----------|---------|------------|
| `id` | INT | PK, AUTO_INCREMENT | | ID unik materi |
| `subject_id` | INT | FK → `subjects.id`, NOT NULL | | Mapel induk (CASCADE) |
| `title` | VARCHAR(255) | NOT NULL | | Judul materi |
| `sub_category` | VARCHAR(100) | NULLABLE | | Sub-bab (opsional) |
| `level` | VARCHAR(20) | NOT NULL | `Basic` | Fundamental/Basic/Intermediate/Advanced/UTBK |
| `type` | VARCHAR(10) | NOT NULL | `text` | `text` / `video` |
| `content` | TEXT | NULLABLE | | Konten markdown |
| `youtube_id` | VARCHAR(50) | NULLABLE | | ID video YouTube |
| `duration_minutes` | INT | NOT NULL | `10` | Estimasi durasi baca |
| `xp_reward` | INT | NOT NULL | `100` | XP reward selesai |
| `is_active` | BOOLEAN | NOT NULL | `TRUE` | Aktif/sembunyikan |
| `created_at` | TIMESTAMP | | `CURRENT_TIMESTAMP` | |
| `updated_at` | TIMESTAMP | | `CURRENT_TIMESTAMP ON UPDATE` | |

**Relationships:**
```python
# be/app/models/material.py baris 33:
subject = relationship("Subject", backref="materials")
# → material.subject → ambil data Subject (nama, warna, dll)
# → subject.materials → semua materi dari mapel itu
```

**Foreign Key:**
```sql
subject_id → subjects.id (ON DELETE CASCADE)
```

---

### 2.4 `learning_sessions`

Riwayat sesi belajar user — dicatat setiap kali user menyelesaikan materi/kuis/game.

| Kolom | Tipe | Constraint | Default | Keterangan |
|-------|------|-----------|---------|------------|
| `id` | INT | PK, AUTO_INCREMENT | | ID unik sesi |
| `user_id` | INT | FK → `users.id`, NOT NULL | | User (CASCADE) |
| `material_id` | INT | FK → `materials.id`, NULLABLE | | Materi (SET NULL) |
| `session_type` | VARCHAR(20) | NOT NULL | `material` | `material` / `quiz` / `game` |
| `duration_minutes` | INT | NOT NULL | `0` | Durasi sesi (menit) |
| `xp_earned` | INT | NOT NULL | `0` | XP didapat dari sesi ini |
| `score` | INT | NULLABLE | | Skor (0-100) untuk quiz |
| `is_completed` | BOOLEAN | NOT NULL | `FALSE` | Status selesai |
| `completed_at` | TIMESTAMP | NULLABLE | | Waktu selesai |
| `created_at` | TIMESTAMP | | `CURRENT_TIMESTAMP` | Waktu mulai |

**Relationships:**
```python
# be/app/models/learning_session.py baris 26-27:
user = relationship("User", backref="learning_sessions")
material = relationship("Material", backref="learning_sessions")
# → session.user → ambil data User
# → session.material → ambil data Material (judul, mapel, dll)
# → session.material.subject → ambil data Subject (nama mapel)
```

**Foreign Keys:**
```sql
user_id     → users.id     (ON DELETE CASCADE)
material_id → materials.id (ON DELETE SET NULL)
```

---

### 2.5 `daily_stats`

Rangkuman statistik harian per user. Satu baris per user per hari.

| Kolom | Tipe | Constraint | Default | Keterangan |
|-------|------|-----------|---------|------------|
| `id` | INT | PK, AUTO_INCREMENT | | ID unik |
| `user_id` | INT | FK → `users.id`, NOT NULL | | User (CASCADE) |
| `date` | DATE | NOT NULL | | Tanggal |
| `minutes_studied` | INT | NOT NULL | `0` | Total menit belajar hari ini |
| `materials_completed` | INT | NOT NULL | `0` | Jumlah materi selesai |
| `quizzes_taken` | INT | NOT NULL | `0` | Jumlah kuis dikerjakan |
| `average_score` | DECIMAL(5,2) | NULLABLE | | Rata-rata skor hari ini |
| `xp_earned` | INT | NOT NULL | `0` | XP didapat hari ini |
| `created_at` | TIMESTAMP | | `CURRENT_TIMESTAMP` | |

**Unique Constraint:**
```sql
UNIQUE(user_id, date) → satu baris per user per hari
```

**Foreign Key:**
```sql
user_id → users.id (ON DELETE CASCADE)
```

---

### 2.6 `quiz_results`

Riwayat jawaban kuis/soal per user.

| Kolom | Tipe | Constraint | Default | Keterangan |
|-------|------|-----------|---------|------------|
| `id` | INT | PK, AUTO_INCREMENT | | ID unik |
| `user_id` | INT | FK → `users.id`, NOT NULL | | User (CASCADE) |
| `subject_id` | INT | FK → `subjects.id`, NULLABLE | | Mapel (SET NULL) |
| `question_text` | TEXT | NOT NULL | | Teks soal |
| `user_answer` | VARCHAR(255) | NULLABLE | | Jawaban user |
| `correct_answer` | VARCHAR(255) | NULLABLE | | Jawaban benar |
| `is_correct` | BOOLEAN | NULLABLE | | Benar/salah |
| `points` | INT | NOT NULL | `0` | Poin didapat |
| `time_spent_seconds` | INT | NULLABLE | | Waktu pengerjaan (detik) |
| `created_at` | TIMESTAMP | | `CURRENT_TIMESTAMP` | |

**Foreign Keys:**
```sql
user_id    → users.id    (ON DELETE CASCADE)
subject_id → subjects.id (ON DELETE SET NULL)
```

---

## 3. Alur Data (Data Flow)

### 3.1 Flow: User Belajar Materi

```
[User Klik "Tandai Selesai"]
         │
         ▼
┌────────────────────────────┐
│  Frontend: Learn.tsx        │
│  handleComplete()           │
│  (fe/src/components/Learn.tsx  │
│   baris 75-92)              │
│                             │
│  Panggil:                   │
│  POST /api/progress         │
│  Body: {                    │
│    user_id: 1,              │
│    material_id: 3,          │
│    session_type: "material",│
│    duration_minutes: 15,    │
│    xp_earned: 100,          │
│    is_completed: true       │
│  }                          │
└──────────┬─────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────┐
│  Backend: progress.py (router)                       │
│  be/app/routers/progress.py baris 19-78              │
│                                                      │
│  Langkah-langkah:                                     │
│  1. Validasi user ada?  → SELECT * FROM users        │
│  2. Hitung level up    → xp_service.calculate_level_up│
│  3. Update user        → UPDATE users SET level, xp  │
│  4. Update streak      → xp_service.update_streak    │
│  5. INSERT learning_sessions (riwayat)               │
│  6. UPDATE daily_stats  → tambah minutes, xp         │
│  7. COMMIT                                           │
└──────────────────────────────────────────────────────┘
           │
           ▼
┌────────────────────────────────────────────┐
│  Tabel yang berubah:                       │
│                                            │
│  ┌──────────┐      ┌──────────────────┐    │
│  │  users   │      │ learning_sessions│    │
│  │──────────│      │──────────────────│    │
│  │ xp +=100 │      │ +1 baris baru    │    │
│  │ level?   │      │ xp_earned=100    │    │
│  │ streak++ │      │ duration=15      │    │
│  └──────────┘      └──────────────────┘    │
│       │                                     │
│       ▼                                     │
│  ┌──────────────┐                           │
│  │  daily_stats │                           │
│  │──────────────│                           │
│  │ minutes+=15  │                           │
│  │ xp+=100      │                           │
│  │ materials++  │                           │
│  └──────────────┘                           │
└────────────────────────────────────────────┘
```

### 3.2 Flow: Dashboard Statistik

```
[User Buka Dashboard]
         │
         ▼
┌──────────────────────────────┐
│  Frontend: Dashboard.tsx      │
│  useEffect()                 │
│  (fe/src/components/Dashboard.tsx  │
│   baris 35-82)               │
│                              │
│  Panggil 5 API sekaligus:    │
│  ┌─────────────────────────┐ │
│  │ GET /api/stats/daily    │ │
│  │ GET /api/stats/weekly   │ │
│  │ GET /api/graph/activity │ │
│  │ GET /api/graph/scores   │ │
│  │ GET /api/graph/subject-distribution│
│  └─────────────────────────┘ │
└──────────┬───────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────┐
│  Backend: stats_service.py + graph_service.py        │
│                                                     │
│  /api/stats/daily:                                   │
│    → SELECT * FROM daily_stats WHERE user_id=1       │
│      AND date=CURDATE()                              │
│    → SELECT * FROM users WHERE id=1                  │
│    → Return: minutes, xp, streak, level, goal%       │
│                                                     │
│  /api/stats/weekly:                                  │
│    → SELECT * FROM daily_stats WHERE user_id=1       │
│      AND date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) │
│    → Kumpulkan 7 hari → day_by_day[]                 │
│                                                     │
│  /api/graph/subject-distribution:                    │
│    → SELECT * FROM learning_sessions WHERE user_id=1 │
│    → Loop: session.material.subject.name             │
│    → Kumpulkan menit per mapel                       │
└─────────────────────────────────────────────────────┘
```

### 3.3 Flow: Grafik & Visualisasi

```
┌─────────────────────────────────────────────────────────────┐
│                    GRAFIK DI DASHBOARD                       │
│                                                             │
│  ┌─────────────────┐   ┌─────────────────┐                  │
│  │ ActivityBarChart│   │ ScoreLineChart  │                  │
│  │ (bar chart)     │   │ (line chart)    │                  │
│  │                 │   │                 │                  │
│  │ Sumber:         │   │ Sumber:         │                  │
│  │ daily_stats     │   │ daily_stats     │                  │
│  │ minutes_studied │   │ average_score   │                  │
│  │ per hari        │   │ per hari        │                  │
│  └────────┬────────┘   └────────┬────────┘                  │
│           │                    │                            │
│           ▼                    ▼                            │
│  ┌─────────────────────────────────────────┐                │
│  │           SubjectDonutChart              │                │
│  │           (donut chart)                  │                │
│  │                                          │                │
│  │  Sumber: learning_sessions               │                │
│  │   → session.material.subject.name        │                │
│  │   → SUM(duration_minutes) per subject    │                │
│  └──────────────────────────────────────────┘                │
│                                                             │
│  Komponen React: fe/src/components/charts/                   │
│  - ChartShell.tsx (wrapper)                                  │
│  - ActivityBarChart.tsx (Recharts BarChart)                  │
│  - ScoreLineChart.tsx (Recharts LineChart)                   │
│  - SubjectDonutChart.tsx (Recharts PieChart)                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Koneksi Tabel ke Fitur

### 4.1 `users` → Fitur Statistik & Leveling

**Frontend (Dashboard):**
- `fe/src/components/Dashboard.tsx` baris 86-96 — bacaan `stats.level`, `stats.currentXp`, `stats.xp_to_next_level`
- `fe/src/services/statsApi.ts` baris 64-66 — API `GET /api/stats/daily?user_id=1`

**Backend:**
- `be/app/routers/stats.py` baris 17-20 — endpoint `/api/stats/daily`
- `be/app/services/stats_service.py` baris 24 — `db.query(User).filter(User.id == user_id).first()`
- `be/app/services/xp_service.py` baris 14-36 — `calculate_level_up()` membaca & update XP/level

**Data apa yang mengalir:**
```
users.current_xp → Dashboard "XP Progress Bar"
users.level      → Dashboard "Level Badge"
users.streak_days → Dashboard "Streak Hari"
users.total_minutes_studied → Profil statistik
users.total_questions_solved → Profil statistik
```

---

### 4.2 `subjects` → Fitur Pilih Mapel

**Frontend (Materi):**
- `fe/src/components/Learn.tsx` baris 99-113 — render tombol mapel dari `getSubjects()` API
- `fe/src/services/materialsApi.ts` baris 41-43 — API `GET /api/subjects`

**Backend:**
- `be/app/routers/materials.py` baris 24-28 — endpoint `/api/subjects`
- `be/app/services/material_service.py` baris 9-11 — `db.query(Subject).order_by(Subject.sort_order).all()`

**Frontend (Dashboard - donut chart):**
- `fe/src/components/charts/SubjectDonutChart.tsx` baris 27-33 — render legend mapel dengan warna
- Data dari `session.material.subject.name`

---

### 4.3 `materials` → Fitur Materi Belajar (Learn)

**Frontend (Materi):**
- `fe/src/components/Learn.tsx` baris 55-60 — state `materials` dari `getMaterials()` API
- `fe/src/services/materialsApi.ts` baris 45-51 — API `GET /api/materials?subject_id=&level=`
- `fe/src/components/Learn.tsx` baris 148-172 — list kartu materi dari `filteredMaterials`
- `fe/src/components/Learn.tsx` baris 200-286 — detail materi (youtube embed + markdown content)
- `fe/src/components/Learn.tsx` baris 75-92 — `handleComplete()` → `POST /api/progress`

**Backend:**
- `be/app/routers/materials.py` baris 30-40 — endpoint `/api/materials` + `/api/materials/:id`
- `be/app/services/material_service.py` baris 14-37 — query filter by `subject_id` & `level`

**Frontend (Dashboard - learning_sessions via graph):**
- SubjectDonutChart membaca data dari `learning_sessions` → `material` → `subject`

---

### 4.4 `learning_sessions` → Fitur Riwayat & Distribusi Mapel

**Frontend (Dashboard - donut):**
- `fe/src/services/graphApi.ts` baris 36-38 — API `GET /api/graph/subject-distribution?user_id=1`
- `fe/src/components/charts/SubjectDonutChart.tsx` baris 11-45 — render donut chart

**Backend:**
- `be/app/routers/graph.py` baris 27-32 — endpoint `/api/graph/subject-distribution`
- `be/app/services/graph_service.py` baris 98-138 — `get_subject_distribution()`:
  ```python
  # baris 101-104: ambil semua learning sessions user
  sessions = db.query(LearningSession).filter(LearningSession.user_id == user_id).all()
  
  # baris 109-114: kumpulkan menit per subject
  for session in sessions:
      if session.material and session.material.subject:
          subject_name = session.material.subject.name
          subject_minutes[subject_name] += session.duration_minutes
  ```

**Penggunaan di XP Service:**
- `be/app/services/xp_service.py` baris 59-106 — `update_daily_stats()` dipanggil setiap kali `POST /api/progress`
- `be/app/routers/progress.py` baris 46-56 — INSERT `learning_sessions` setiap ada progres

---

### 4.5 `daily_stats` → Fitur Statistik & Grafik

**Frontend (Dashboard):**
- `fe/src/services/statsApi.ts` baris 64-70 — API daily & weekly stats
- `fe/src/components/Dashboard.tsx` baris 92-96 — `displayedScores.daily` dari `dailyStats.average_score`

**Backend:**
- `be/app/routers/stats.py` baris 17-20 — `GET /api/stats/daily?user_id=1`
- `be/app/services/stats_service.py` baris 12-44 — `get_daily_stats()`:
  ```python
  # baris 17-21: ambil daily stat untuk hari ini
  daily = db.query(DailyStat).filter(
      DailyStat.user_id == user_id,
      DailyStat.date == today
  ).first()
  ```
- `be/app/services/stats_service.py` baris 47-107 — `get_weekly_stats()` — 7 hari terakhir

**Grafik Bar & Line:**
- `be/app/routers/graph.py` baris 15-20 — `GET /api/graph/activity`
- `be/app/services/graph_service.py` baris 10-48 — `get_activity_graph()`:
  ```python
  # baris 15-23: ambil daily stats 7 hari
  daily_stats = db.query(DailyStat).filter(
      DailyStat.user_id == user_id,
      DailyStat.date >= seven_days_ago
  ).order_by(DailyStat.date).all()
  ```
- `be/app/services/graph_service.py` baris 51-95 — `get_scores_graph()` — sama, tapi pakai `average_score`

**Update daily_stats:**
- `be/app/routers/progress.py` baris 58-67 — setiap POST /api/progress, update daily_stats
- `be/app/services/xp_service.py` baris 59-106 — `update_daily_stats()` — insert/update baris hari ini

---

### 4.6 `quiz_results` → Fitur Kuis (Future)

**Backend (sudah siap, frontend belum):**
- Model sudah ada di `be/app/models/quiz_result.py`
- Belum ada router khusus untuk CRUD quiz_results
- Belum ada service untuk quiz

**Rencana koneksi (masa depan):**
- `Quiz.tsx` → `POST /api/quiz/submit` → INSERT ke `quiz_results`
- `quiz_results` → hitung rata-rata skor per mapel → tampilkan di Dashboard
- `quiz_results` → update `users.total_questions_solved`

---

## 5. Ringkasan Cepat

| Tabel | Isi | Dibuat Saat | Dipakai Oleh Fitur |
|-------|-----|-------------|-------------------|
| `users` | Data & progres user | Seed data | Dashboard, Leveling, Streak |
| `subjects` | Mata pelajaran | Seed data | Learn (filter mapel), Grafik donut |
| `materials` | Konten belajar | Seed data + AI Generate | Learn (list + detail), XP reward |
| `learning_sessions` | Riwayat sesi belajar | User selesai materi/kuis | Grafik donut distribusi, Riwayat |
| `daily_stats` | Statistik harian | Otomatis dari progres | Dashboard (angka + grafik bar/line) |
| `quiz_results` | Hasil jawaban kuis | User selesai kuis (future) | Analitik kuis (future) |

### Legend: Kode Warna

| Warna | Arti |
|-------|------|
| 🟢 **Hijau** | Tabel dan fitur sudah berfungsi penuh |
| 🟡 **Kuning** | Model sudah ada, frontend/fitur belum selesai |
| 🔴 **Merah** | Belum diimplementasikan |

### Status Tabel

| Tabel | Model (BE) | API (BE) | Service (BE) | Frontend | Status |
|-------|-----------|---------|-------------|----------|--------|
| `users` | ✅ `user.py` | ✅ progress.py | ✅ xp_service.py | ✅ Dashboard | 🟢 |
| `subjects` | ✅ `subject.py` | ✅ materials.py | ✅ material_service.py | ✅ Learn | 🟢 |
| `materials` | ✅ `material.py` | ✅ materials.py | ✅ material_service.py | ✅ Learn | 🟢 |
| `learning_sessions` | ✅ `learning_session.py` | ✅ graph.py | ✅ graph_service.py | ✅ Donut chart | 🟢 |
| `daily_stats` | ✅ `daily_stat.py` | ✅ stats.py | ✅ stats_service.py | ✅ Dashboard | 🟢 |
| `quiz_results` | ✅ `quiz_result.py` | ❌ | ❌ | ❌ | 🟡 |
