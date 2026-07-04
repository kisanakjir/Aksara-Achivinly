# Aksara EdTech

A gamified learning platform designed to help Indonesian high school students prepare for the UTBK/SNBT university entrance exams. Think of it as a study companion that turns exam prep into something that actually feels rewarding.

## The Story

Back when I was grinding for UTBK, I noticed something: there are tons of learning resources out there, but almost all of them feel like a chore. You watch videos, read materials, do practice questions -- and it gets boring fast. The ones that try to gamify things either look like theyre from 2010 or charge a monthly fee that high school students cant afford.

So I built Aksara. A platform where learning feels less like studying and more like progressing through a game. Track your daily streak, earn XP, level up, and actually see yourself improving -- without burning a hole in your pocket.

Right now, the platform is in its early stages. The main focus is the **Materials (Learn)** module -- 22 subjects with real YouTube video content, fully browsable. Other features (quizzes, adventure game, forum, leaderboard) are planned but not yet active, as Im prioritizing a solid foundation before spreading too thin.

## What Works Now

### Dashboard
Your daily command center. See how many minutes you've studied today, your monthly progress, current streak, and XP. It updates in real-time as you complete materials. Also features a global clock widget that supports all timezones (UTC-12 to UTC+14).

### Learning Materials
The core feature right now. Browse through 22 subjects organized into curriculum groups:

- **Wajib (Nasional)** -- Pendidikan Agama, Pancasila, Bahasa Indonesia, Matematika, Bahasa Inggris, PJOK, Informatika, Sejarah, Seni Budaya
- **MIPA** -- Fisika, Kimia, Biologi, Matematika Tingkat Lanjut
- **IPS** -- Ekonomi, Sosiologi, Geografi, Antropologi
- **Bahasa & Budaya** -- Bahasa Indonesia Tingkat Lanjut, Bahasa Inggris Tingkat Lanjut, Bahasa Asing
- **Vokasi** -- Prakarya & Kewirausahaan
- **Seleksi Masuk PT** -- UTBK / SNBT (Penalaran Umum, Pengetahuan Kuantitatif, Penalaran Matematika)

Each subject has at least one material with an embedded YouTube video. Pick a subject, watch a video, mark it complete, and earn XP. The sidebar shows your place in the playlist so you can jump between videos.

### What is Disabled (For Now)

The following features exist in the codebase but are hidden from the navigation to keep the scope focused. They will be enabled one by one as they mature:

- Quiz/Tryout module
- Adventure game map
- Discussion forum
- Leaderboard
- AI Chat tutor
- IQ Report analytics

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Framer Motion
- **Backend API**: FastAPI (Python), SQLAlchemy, MySQL
- **Dev Server**: Express (Vite middleware)
- **Authentication**: JWT with bcrypt
- **AI**: Google Gemini API (optional, for content generation)

## Getting Started

You need Node.js 18+, Python 3.11+, and a MySQL database named `aksara_db`.

### Setup

```bash
# Frontend
cd fe
npm install

# Backend
cd be
python -m venv venv
source venv/bin/activate   # Linux/Mac
venv\Scripts\activate      # Windows
pip install -r requirements.txt
```

Copy `be/.env.example` to `be/.env` and fill in your settings (at minimum, the database URL).

### Running

Open two terminals:

```bash
# Terminal 1 — Backend API (port 8000)
cd be && venv\Scripts\activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 — Frontend (port 5173)
cd fe && npm run dev
```

Then open **http://localhost:5173**.

Login with the seeded account: `IqbalMustafa` / `aksara123`.

### Database Seeding

```bash
cd be && venv\Scripts\activate && python seed_data.py
```

This populates the database with:
- 1 user account
- 22 subjects mapped to the Indonesian curriculum
- 31 learning materials with YouTube video IDs
- 7 days of sample daily stats

## Performance Notes

- Background uses a solid color instead of animated gradients or particle effects. This was a deliberate choice -- animated backgrounds chew through battery on laptops and make mobile devices stutter. The app should run smoothly even on older hardware.
- Framer Motion is only used for interactive elements (the floating assistive nav), not for idle animations.
- Disabled components are not imported at all -- they dont affect bundle size or load time.
- All intervals and timeouts have proper cleanup. No memory leaks.

## Project Structure

```
├── fe/                   # React frontend + Express dev server
│   ├── src/
│   │   ├── components/   # UI components (Dashboard, Learn, etc.)
│   │   ├── charts/       # Chart components (activity, score, distribution)
│   │   ├── contexts/     # Auth context provider
│   │   ├── services/     # API client functions
│   │   ├── App.tsx       # Root app with navigation
│   │   ├── main.tsx      # Entry point
│   │   ├── types.ts      # Shared TypeScript types
│   │   └── index.css     # Global styles
│   └── server.ts         # Express server (dev mode)
├── be/                   # FastAPI backend
│   ├── app/
│   │   ├── routers/      # API endpoints (auth, stats, materials, etc.)
│   │   ├── models/       # SQLAlchemy models
│   │   ├── services/     # Business logic
│   │   └── schemas/      # Pydantic request/response schemas
│   └── seed_data.py      # Database seeder
├── .gitignore
├── README.md
└── CLAUDE.md
```

## Roadmap

The immediate focus is stabilizing the learning module and adding more materials per subject. After that, the next features to enable are the Quiz system and the leaderboard -- those two have the most code already written and just need polishing.

Everything else (game zone, AI chat, forum) will come later as the platform finds its audience.

## Contributing

This is an open source project. Feel free to open issues, suggest features, or submit pull requests. The codebase is still young, so theres plenty of room to shape its direction.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes
4. Push and open a Pull Request
