# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Aksara EdTech — an Indonesian gamified EdTech platform for UTBK exam preparation. Built as a Google AI Studio app with a React SPA frontend and Express backend. Features include timed quizzes, AI-generated study materials (via Gemini), an adventure game for learning, discussion forum, leaderboard, and an AI chat tutor.

All source code is under the `fe/` directory. The `be/` directory exists but is empty — there is no separate backend.

### Gemini AI Integration Notes

- Uses model `"gemini-3.5-flash"` with structured JSON output (`responseMimeType: "application/json"` + `responseSchema`)
- Quiz generation prompts produce arrays of questions; material generation produces a single material object
- All AI prompts are in Indonesian (Bahasa Indonesia)
- Falls back to hardcoded templates when the API key is missing or the API call fails

## Commands

- **Dev server**: `npm run dev` (from `fe/`) — starts Vite + Express backend on port 3000
- **Build**: `npm run build` — builds Vite frontend + bundles server with esbuild into `dist/`
- **Start production**: `npm run start` — runs the compiled server from `dist/`
- **Type-check**: `npm run lint` — runs `tsc --noEmit` (no ESLint/Prettier configured)
- **Clean**: `npm run clean` — removes `dist/` and `server.js`

## Architecture

### Frontend (React 19 + Vite + Tailwind CSS v4 + Framer Motion)

- **Entry**: `src/main.tsx` → renders `App` component
- **App.tsx**: Root component with tab-based navigation (7 tabs), dark mode toggle, XP/level state management, and an assistive floating navigation mode
- **Components** (in `src/components/`):
  - `Dashboard.tsx` — Daily progress stats, weekly activity chart, badges, news/promo carousels, social share
  - `Learn.tsx` — Subject/material browser with YouTube video embeds and markdown text content; two views (list + detail)
  - `Quiz.tsx` — Timed quiz/UTBK tryout with AI generation prompt, timer, answer scoring
  - `GameZone.tsx` — 2D adventure map with node-based battles (answer questions to defeat enemies)
  - `Forum.tsx` — Social feed with stories, posts, likes; Instagram/Threads-style UI
  - `Leaderboard.tsx` — Ranked national leaderboard fetched from API, with animated podium effects
  - `AiChat.tsx` — AI tutor chat interface (currently uses mock setTimeout responses, not real API)
- **Types**: `src/types.ts` — `UserStats`, `Badge`, `Material`, `Question`, `QuizSession`, `ForumPost`, `ForumReply`, `ChatMessage`, `LearnLevel`, `LeaderboardUser`
- **Styling**: Tailwind CSS v4 with custom animations (star field, golden waves, fire glow effects) in `src/index.css`

### Backend (Express server — single file `server.ts`)

- Serves the SPA via Vite middleware (dev) or static files (production)
- **In-memory data store** (resets on server restart): leaderboard, forum posts, chat messages
- **API endpoints**:
  - `GET /api/health` — health check
  - `GET /api/leaderboard` / `POST /api/leaderboard/submit` — leaderboard CRUD
  - `GET /api/forum` / `POST /api/forum/post` / `POST /api/forum/post/:id/reply` / `POST /api/forum/post/:id/upvote` — forum CRUD
  - `GET /api/chat/:channel` / `POST /api/chat/send` — group chat
  - `POST /api/generate` — Gemini AI quiz/material generation with offline fallback
- **Gemini AI**: Uses `@google/genai` SDK with structured output (`responseMimeType: "application/json"`). Lazy-initializes client from `GEMINI_API_KEY` env var. Falls back to hardcoded templates if API is unavailable.

### Configuration

- **Environment**: `.env.example` — requires `GEMINI_API_KEY` and `APP_URL`
- **Vite config**: `vite.config.ts` — React plugin, Tailwind CSS v4, `@/` path alias, HMR toggle via `DISABLE_HMR` env var (used in AI Studio)
- **TypeScript**: `tsconfig.json` — ES2022 target, bundler module resolution, `@/*` path alias

### State Management

All state is managed via React `useState` in parent components (no external state library). `App.tsx` holds the canonical `UserStats` object and passes state-down/callbacks-up to children. Leveling/XP logic is duplicated across `handleCompleteMaterial`, `handleCompleteQuiz`, and `handleEarnXp` in App.tsx.

### Key Observations

- AI Chat (`AiChat.tsx`) uses mock responses (setTimeout) — not wired to the Gemini API yet
- `Material` interface in `types.ts` is missing the `subCategory` field that `Learn.tsx` uses on materials
- Forum posts and chat messages also use client-side mock data (separate from the server's `/api/forum` and `/api/chat` endpoints used by Leaderboard)
- No testing framework, ESLint, or Prettier configured
- No database — all data is ephemeral in-memory

### MCP Server (be/)

Custom MCP server (Model Context Protocol) untuk agent, tersedia otomatis saat coding di repo ini (didaftarkan di config.toml).

- **Lokasi**: `be/src/index.js` (Entry), `be/src/db.js` (SQLite database)
- **Database**: SQLite via better-sqlite3, tersimpan di `be/data/aksara.db`
- **Transport**: stdio (standar MCP)

**Tool yang tersedia** (via agent):
- `leaderboard_*` ? CRUD leaderboard, cari rank
- `forum_*` ? CRUD forum posts dan replies
- `chat_*` ? Chat messaging per channel
- `materials_*` ? CRUD materi belajar
- `quiz_*` ? Quiz session, questions, scoring
- `user_stats_*` ? XP, level, streak tracking
- `project_*` ? Status build, DB stats

**Run**: `node be/src/index.js` (standalone), atau agent panggil tools via MCP.
