# Aksara EdTech

A gamified learning platform for Indonesian UTBK/SNBT exam preparation.

## Features

### Dashboard (Working)
Daily learning progress tracker with real-time stats — materials completed, study duration, monthly progress, and global clock.

*More features (Learn, Quiz, GameZone, Forum, Leaderboard, AI Chat) are under development.*

## Screenshots

![Dashboard](img/dashboard.png)

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Framer Motion
- **Backend**: FastAPI (Python), SQLAlchemy, MySQL
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
cd be && venv\Scripts\activate && uvicorn app.main:app --port 8000

# Terminal 2 — Frontend
cd fe && npm run dev
```

Open **http://localhost:3000**

### Seed Data (Optional)

```bash
cd be && venv\Scripts\activate && python seed_data.py
```

## Project Structure

```
├── fe/               # React frontend
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── charts/       # Chart components
│   │   ├── contexts/     # Auth context
│   │   └── services/     # API services
│   └── server.ts
├── be/               # FastAPI backend
│   ├── app/
│   │   ├── routers/      # API endpoints
│   │   ├── models/       # Database models
│   │   ├── services/     # Business logic
│   │   └── schemas/      # Pydantic schemas
│   └── seed_data.py
└── img/              # App screenshots
```

## Contributing

This project is open source. Contributions are welcome — feel free to open issues or submit pull requests.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request
