# Aksara EdTech

A gamified learning platform for Indonesian UTBK/SNBT exam preparation.

## Status

**MVP Clear** — Fokus utama saat ini adalah modul **Belajar (Materi)** dengan 22 mata pelajaran dan 31 materi video YouTube.

Menu lain (Kuis, Petualangan, Diskusi, Peringkat, AI Chat) dinonaktifkan sementara sampai fitur siap dikembangkan.

## Features

### ✅ Beranda (Dashboard)
Daily learning progress tracker dengan statistik real-time — materi selesai, durasi belajar, progress bulanan, dan jam digital global (UTC-12 sampai UTC+14).

### ✅ Materi (Learn)
22 mata pelajaran lengkap kurikulum merdeka + UTBK dengan 31 materi video YouTube asli:
- **Wajib (Nasional)**: Agama, Pancasila, Bahasa Indonesia, Matematika, Bahasa Inggris, PJOK, Informatika, Sejarah, Seni Budaya
- **MIPA**: Fisika, Kimia, Biologi, Matematika Tingkat Lanjut
- **IPS**: Ekonomi, Sosiologi, Geografi, Antropologi
- **Bahasa & Budaya**: Bahasa Indonesia Tingkat Lanjut, Bahasa Inggris Tingkat Lanjut, Bahasa Asing
- **Vokasi**: Prakarya & Kewirausahaan
- **Seleksi PT**: UTBK / SNBT (Penalaran Umum, Pengetahuan Kuantitatif, Penalaran Matematika)

### ⏸️ Menu Dinonaktifkan
Kuis, Petualangan, Diskusi, Peringkat, AI Pribadi, IQ Report — kode masih utuh, tinggal aktifkan via tab di `App.tsx`.

## Screenshots

![Dashboard](img/dashboard.png)

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Framer Motion
- **Backend**: FastAPI (Python), SQLAlchemy, MySQL
- **Express**: Frontend server (Vite middleware + API proxy)
- **Authentication**: JWT (bcrypt + python-jose)
- **AI**: Google Gemini API (optional)

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- MySQL database named `aksara_db`

### Setup

```bash
# Frontend
cd fe
npm install

# Backend
cd be
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt
```

Copy `be/.env.example` to `be/.env` and configure your settings.

### Run

```bash
# Terminal 1 — Backend
cd be && venv\Scripts\activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 — Frontend
cd fe && npm run dev
```

Open **http://localhost:5173**

Login: `IqbalMustafa` / `aksara123`

### Seed Data

```bash
cd be && venv\Scripts\activate && python seed_data.py
```

Seed akan mengisi: 1 user, 22 subject, 31 materi dengan video YouTube.

## Performance Notes

- Background menggunakan **warna solid** (tanpa animasi/gradient) untuk performa maksimal di perangkat low-end dan mobile
- Framer Motion hanya digunakan untuk elemen interaktif (floating nav), bukan idle animation
- Bundle size diminimalkan dengan menghapus import komponen yang dinonaktifkan
- Tidak ada `setInterval` tanpa cleanup atau infinite animation loop

## Project Structure

```
├── fe/               # React frontend + Express server
│   ├── src/
│   │   ├── components/   # UI components (Dashboard, Learn, dll)
│   │   ├── charts/       # Chart components
│   │   ├── contexts/     # Auth context
│   │   └── services/     # API services
│   └── server.ts      # Express dev server
├── be/               # FastAPI backend
│   ├── app/
│   │   ├── routers/      # API endpoints
│   │   ├── models/       # Database models
│   │   ├── services/     # Business logic
│   │   └── schemas/      # Pydantic schemas
│   └── seed_data.py   # Database seeder (22 subjects, 31 materials)
├── matapelajaran.md  # Reference daftar mata pelajaran
├── riviewbug.md      # Dokumentasi bug & fix
└── img/              # App screenshots
```

## Contributing

This project is open source. Contributions are welcome — feel free to open issues or submit pull requests.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request
