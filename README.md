# 🚀 Achivinly — Aksara Tech App

**Aksara EdTech** adalah platform pembelajaran gamifikasi interaktif untuk persiapan **UTBK/SNBT** yang dibangun dengan React SPA + Express backend dan FastAPI Python backend.

---

## ✨ Fitur Saat Ini

### 📊 Dashboard
- Statistik & target belajar harian (materi + durasi)
- Nama target, intensitas, dan fokus mata pelajaran
- Progress bulanan berbasis intensitas
- **Jam digital real-time** dengan pemilih zona waktu global (UTC-12 sampai UTC+14)

### 📚 Belajar (Learn)
- Jelajahi materi belajar per mata pelajaran & tingkat kesulitan
- Video YouTube embedded & konten markdown
- Progress hanya terhitung jika materi sesuai **fokus mapel**

### 🎮 Quiz & GameZone
- Kuis timed UTBK dengan AI-generated questions
- 2D adventure map dengan node-based battles

### 💬 Forum & Leaderboard
- Social feed dengan post, reply, dan upvote
- Ranking leaderboard nasional

### 🤖 AI Chat Tutor
- Chat dengan AI tutor (mock — real API coming soon)

### ⚙️ Pengaturan
- Atur target belajar (nama, durasi, intensitas, fokus mapel)
- Edit profil & upload avatar (base64)
- Mode gelap/terang
- Mode assistive floating navigation

---

## 🛠️ Cara Menjalankan

### Prasyarat
- **Node.js** 18+
- **Python** 3.11+
- **MySQL** (XAMPP / standalone)
- Database `aksara_db` sudah dibuat

### 1. Clone & Install

```bash
# Frontend
cd fe
npm install

# Backend Python
cd ../be
python -m venv venv
venv\Scripts\activate   # Windows
# atau source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
```

### 2. Konfigurasi

Salin `.env.example` ke `.env` di folder `be/`:

```
GEMINI_API_KEY=your_gemini_api_key   # opsional
APP_URL=http://localhost:3000
```

Database URL default: `mysql+mysqlconnector://root:@localhost:3306/aksara_db`

### 3. Jalankan

```bash
# Terminal 1 — Backend Python (FastAPI)
cd be
venv\Scripts\activate
uvicorn app.main:app --port 8000

# Terminal 2 — Frontend (Vite + Express)
cd fe
npm run dev
```

Buka **http://localhost:3000**

### 4. Seed Data (Opsional)

```bash
cd be
venv\Scripts\activate
python seed_data.py
```

---

## 🧱 Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Frontend** | React 19, Vite, Tailwind CSS v4, Framer Motion, Lucide Icons |
| **Backend (FE)** | Express (Vite middleware) |
| **Backend (BE)** | FastAPI, SQLAlchemy, MySQL |
| **Auth** | JWT (bcrypt + python-jose) |
| **AI** | Google Gemini API |

---

## 📁 Struktur Proyek

```
achiving/
├── fe/               # Frontend React SPA
│   ├── src/
│   │   ├── components/   # Dashboard, Learn, Quiz, Forum, dll
│   │   ├── charts/       # Komponen grafik
│   │   ├── contexts/     # AuthContext
│   │   └── services/     # API client & services
│   └── server.ts         # Express dev server
├── be/               # Backend Python FastAPI
│   ├── app/
│   │   ├── routers/      # API endpoints
│   │   ├── models/       # SQLAlchemy models
│   │   ├── services/     # Business logic
│   │   └── schemas/      # Pydantic schemas
│   └── seed_data.py      # Data seeder
├── CLAUDE.md         # Panduan untuk Claude Code
└── riviewbug.md      # Dokumentasi bug & fixes
```

---

## 🌟 Open Source

Proyek ini adalah **open source**! Kami sangat terbuka untuk kontribusi dari siapa pun.

**Ingin berkontribusi?**
1. Fork repository ini
2. Buat branch fitur: `git checkout -b fitur-keren`
3. Commit perubahan: `git commit -m 'feat: tambah fitur keren'`
4. Push ke branch: `git push origin fitur-keren`
5. Buat Pull Request

Atau [buat issue](https://github.com/your-username/achivinly-aksara-tech-app/issues) untuk laporan bug, saran fitur, atau diskusi.

---

Dibuat dengan ❤️ untuk pendidikan Indonesia.
