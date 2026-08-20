# Next Session Plan — 5 hours before submission

## 1. UI changes (whatever's in your head — bring the list)

## 2. CI/CD
- GitHub Actions: lint + test on push for both `server/` and `frontend/`
- Maybe auto-deploy on merge to main

## 3. Deploy
- Backend → Render (Node/Express/Socket.io)
- Frontend → Vercel (Next.js)
- DB → Turso (already cloud, just point prod env vars at it)
- Firebase Auth → add prod domain to authorized domains in Firebase Console
- Update `CLIENT_URL` on backend to include the deployed frontend URL (comma-separated, already supports multiple)
- Update `NEXT_PUBLIC_API_URL` on frontend to the deployed backend URL

## 4. Final read-through
- Read every line of code end-to-end (backend + frontend) before submission, not just diffs
- Confirm README is accurate and complete for a stranger to clone + run
- Confirm no secrets anywhere in tracked files (`git status`, check `.env*` gitignore coverage on both `server/` and `frontend/`)

## Current state (for context on resume)
- Backend: Express + Turso + Firebase Auth + Socket.io, 30 tests passing, ESLint clean, graceful shutdown, DB-aware health check, request-id logging, consent gating, rate limiting, export/delete endpoints.
- Frontend: Next.js, 3 real routes (`/login`, `/consent`, `/`), Dashboard + LogWizard both refactored into small files, 34 Vitest tests passing, ESLint clean, tsc clean.
- Design system copied from the Claude Design canvas into `app/globals.css`.
- `PRD.md`, `DESIGN_PROMPT.md`, `PRODUCTDETAILS.md` all gitignored (internal planning docs, not part of submission).
