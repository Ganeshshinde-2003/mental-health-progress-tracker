# MindTrack

A daily mental health progress tracker — log your mood, sleep, stress, and more, and see your trends over time.

**Live:** [mental-health-progress-tracker.vercel.app](https://mental-health-progress-tracker.vercel.app)
(backend runs on Render's free tier and sleeps after 15 min idle — the first request may take 30-50s to wake it up)

## Architecture

```
┌────────────────────────┐                      ┌────────────────────────┐
│   Frontend (Vercel)     │                      │    Backend (Render)     │
│   Next.js + React       │   HTTPS + WebSocket   │    Express + Socket.io  │
│   Firebase Auth (UI)    │◀────────────────────▶│    Firebase Admin (verify)│
│   Socket.io client      │                      │                          │
└────────────────────────┘                      └───────────┬──────────────┘
                                                              │
                                          ┌───────────────────┼───────────────────┐
                                          │                   │                   │
                                    SQL over HTTPS        Gemini API          Firebase Auth
                                          │                   │                   │
                                          ▼                   ▼                   ▼
                                  ┌───────────────┐   ┌───────────────┐   ┌───────────────┐
                                  │  Turso         │   │  Google Gemini │   │  Firebase      │
                                  │  (libSQL DB)   │   │  (insight/chat)│   │  (Google login)│
                                  └───────────────┘   └───────────────┘   └───────────────┘
```

Auth: user signs in with Google via Firebase on the frontend; every request sends the Firebase ID token, which the backend verifies with `firebase-admin` and maps to a row in the `users` table.

Real-time: when a log is saved, the backend emits a `newLog` socket event to that user's private room, so the dashboard refetches without a page reload.

AI: the backend calls Gemini server-side only (API key never reaches the browser) for the dashboard insight card and the 10-message-per-user chat assistant, both grounded in the user's own logged data.

## Tech stack

- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind, Recharts, Socket.io-client, Vitest
- **Backend:** Node.js, Express, Socket.io, Zod, Jest
- **Database:** Turso (cloud SQLite / libSQL)
- **Auth:** Firebase Authentication (Google sign-in)
- **AI:** Google Gemini API
- **Deploy:** Vercel (frontend), Render (backend)
- **CI:** GitHub Actions (lint + test on every push/PR, path-scoped per folder)

## Getting started

### Backend

```bash
cd server
npm install
cp .env.example .env   # fill in Turso, Firebase Admin, and Gemini values
npm run dev             # http://localhost:4000
```

Required env vars (see `server/.env.example`): `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `GEMINI_API_KEY`, `CLIENT_URL`.

- `TURSO_*` — create a free database at [turso.tech](https://turso.tech)
- `FIREBASE_*` — service account credentials from Firebase Console → Project Settings → Service Accounts
- `GEMINI_API_KEY` — free key from [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

The database schema and migrations run automatically on server start.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # fill in Firebase web config + API URL
npm run dev                   # http://localhost:3000
```

Required env vars (see `frontend/.env.example`): the six `NEXT_PUBLIC_FIREBASE_*` values from Firebase Console → Project Settings → General → Your apps (Web app config), and `NEXT_PUBLIC_API_URL` pointing at the backend (`http://localhost:4000` locally).

### Tests

```bash
cd server && npm test    # Jest
cd frontend && npm test  # Vitest
```

## CI/CD

Two path-scoped GitHub Actions workflows under `.github/workflows/`:

- `backend-ci.yml` — runs on any change under `server/`: lint + Jest test suite
- `frontend-ci.yml` — runs on any change under `frontend/`: lint + Vitest test suite + `next build` (full typecheck)

Deployment is manual for now (push to `main`, then redeploy on Vercel/Render) — not wired to CI as an auto-deploy gate.
