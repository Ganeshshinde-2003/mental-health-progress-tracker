# Product Details — Backend Verification Log

Internal notes on exactly what was run and how, so you can explain/reproduce every step.

## 1. How migrations run

No separate migration command exists. `runMigrations()` in `server/src/db/index.js` runs **automatically every time the server boots**, called from `server/src/server.js`:

```js
await runMigrations();
```

What it does:
1. Reads `server/src/db/schema.sql` as a raw string.
2. Splits it on `;` into individual SQL statements, trims/filters empties.
3. Runs each statement with `db.execute(statement)` against the Turso client.
4. Every `CREATE TABLE` uses `IF NOT EXISTS`, so re-running on every boot is safe/idempotent — it never wipes or duplicates.

Tables created: `users` (id, firebase_uid, email, display_name, created_at) and `logs` (id, user_id FK, date, mood, anxiety, sleep_hours, sleep_quality, sleep_disturbances, activity_type, activity_duration, social_frequency, stress_level, symptoms, created_at), plus an index on `logs(user_id, date)`.

## 2. How the server was started

```bash
cd server
node src/server.js
```

Ran as a background process so I could keep issuing curl commands against it in the same session. `server.js` does, in order:
1. Creates an HTTP server wrapping the Express `app`.
2. Calls `initSockets(httpServer, env.CLIENT_URL)` — attaches Socket.io to that same HTTP server.
3. Awaits `runMigrations()`.
4. Calls `httpServer.listen(env.PORT, ...)` — logs `Server listening on port 4000`.

Env vars are loaded via `dotenv/config` at the top of `server/src/config/env.js`, then validated with a Zod schema (`envSchema.safeParse(process.env)`) — if anything required is missing/malformed, the process exits immediately with a clear error instead of booting into a broken state.

One hiccup during testing: an earlier background run left a process still bound to port 4000 (`EADDRINUSE` on the second start). Fixed by finding the PID with `netstat -ano | grep ':4000'` and killing it with `taskkill //PID <pid> //F`, then restarting cleanly.

## 3. How APIs were called (verification)

Used `curl` from the same machine, since server was running on `localhost:4000`:

**Health check:**
```bash
curl -s http://localhost:4000/health
```
Response: `{"status":"ok"}`

**Auth-protected endpoint with a deliberately invalid token:**
```bash
curl -s http://localhost:4000/api/logs -H "Authorization: Bearer invalidtoken"
```
Response: `{"error":"Invalid or expired token"}`

This confirmed `requireAuth` middleware (`server/src/middleware/auth.js`) is actually verifying tokens via `firebaseAuth.verifyIdToken(token)` and rejecting bad ones with 401 — not a no-op / not silently letting requests through.

**Not yet tested:** a real successful `POST /log` / `GET /logs` round trip — that requires a real Firebase ID token, which only exists once the frontend does a real Google sign-in. That's the next milestone once the client exists.

## 4. How to inspect the database yourself

- Turso dashboard → your `healthtracker` DB → **Studio / SQL Console** tab → run `SELECT * FROM users;` / `SELECT * FROM logs;`.
- Or via CLI (if installed): `turso db shell healthtracker` then `.tables` and standard SQL.

Currently both tables exist and are empty — no user has signed in yet since there's no frontend.

## 5. Security & compliance hardening added after the initial backend

Beyond the base CRUD + auth, six things were added deliberately to match the PRD's "Security & Compliance Considerations" section (patient data, not just generic app data):

1. **Consent gating.** Added a `consented_at TEXT` column to `users` (via an additive migration — SQLite/libSQL has no `ADD COLUMN IF NOT EXISTS`, so `addColumnIfMissing()` in `db/index.js` probes with `ALTER TABLE` and swallows the "duplicate column" error on repeat boots). `POST /api/auth/consent` sets it. A new `requireConsent` middleware blocks `POST /log` with `403` until it's set — a user can't log data before explicitly consenting, not just be shown a UI checkbox that does nothing server-side.
2. **Rate limiting.** `express-rate-limit`, 300 requests/15min per IP, applied to all `/api` routes in `app.js`.
3. **Security headers.** `helmet()` applied globally — HSTS, no-sniff, frame-ancestors, etc. (visible in the response headers when you curl `/health` — CSP, X-Frame-Options, etc. all present).
4. **Data export.** `GET /api/export` returns every log for the authenticated user as JSON, so "export my data" is a real, working endpoint, not just a PRD bullet point.
5. **Account deletion.** `DELETE /api/auth/me` deletes the Turso `users` row (which cascades to `logs` via `ON DELETE CASCADE` — this only actually enforces once `PRAGMA foreign_keys = ON` is run, which happens at the top of `runMigrations()`) **and** calls `firebaseAuth.deleteUser(uid)` to remove the actual Firebase Auth account. Originally this only deleted the DB row — caught in review that logging back in with Google would just silently recreate the user, so the Firebase deletion was added second.
6. **Foreign keys enforced.** SQLite/libSQL doesn't enforce `FOREIGN KEY` constraints by default per-connection — `PRAGMA foreign_keys = ON` had to be explicitly run, otherwise the `ON DELETE CASCADE` on `logs.user_id` would silently do nothing and deleted users would leave orphaned logs behind.

## 6. Seeding test data

To get a real-looking trend chart without manually submitting 20 daily entries through the UI, wrote `server/scripts/seed.js` — calls `upsertLog()` directly (the same service function the real `POST /log` route uses) for every date from 2026-08-01 to 2026-08-20, with a gentle upward mood trend and randomized-but-plausible values for the rest. Ran via `node scripts/seed.js` from `server/`. Confirmed via a one-off script: `SELECT count(*) FROM logs WHERE user_id=1` returned 20.

**Important gotcha this surfaced:** the seed script bypasses `log.controller.js` entirely (it calls the service layer directly), so it never triggers `emitNewLog()` → the Socket.io "new entry" pulse animation doesn't fire for seeded data, and the dashboard needs a manual reload to show it. That's expected and correct — only real `POST /api/log` requests (i.e. actual user submissions through the wizard) go through the controller and emit the socket event.

## 7. Frontend build (Next.js + Firebase + Turso, all wired to the real backend)

Built in `frontend/` (Next.js 16 / React 19 / TypeScript / Tailwind v4, via `create-next-app`):

- **`lib/firebase.ts`** — initializes Firebase Web SDK from `NEXT_PUBLIC_FIREBASE_*` env vars (`.env.local`, gitignored; `.env.example` has placeholders).
- **`lib/auth-context.tsx`** — `AuthProvider` wraps the app, listens to `onAuthStateChanged`, and on every sign-in automatically calls `GET /api/auth/me` with the Firebase ID token — this is what actually creates/finds the user row in Turso via the backend's `requireAuth` middleware. Firebase Auth alone never touches the DB; the DB row only exists because of this explicit sync call.
- **`lib/api.ts`** — thin `apiFetch()` wrapper adding the `Authorization: Bearer <token>` header to every backend call.
- **`app/page.tsx`** — routes between three states based on real backend state: Login (not signed in) → Consent (signed in, `dbUser.consented_at` is null) → Dashboard (signed in and consented). The consent screen posts to `POST /api/auth/consent` for real, then refetches the user record to transition.
- **`components/Dashboard.tsx`** — hero band with time-of-day greeting, `GET /api/logs?range=month` on load (always fetches the month; "week" is a client-side `useMemo` slice of the same data, not a second network call — added after noticing the week/month toggle felt laggy when it re-fetched from the server every click), a live Socket.io connection (`auth: { token }` in the handshake, matching the backend's per-user-room auth), and trend charts (see below).
- **`components/LogWizard.tsx`** — the real 6-step + review daily log form (mood, anxiety, sleep, activity, social + stress, symptoms), posting to `POST /api/log` on submit. Detects if today's entry already exists (`todayLog` computed in `Dashboard.tsx`) and pre-fills all fields for editing instead of creating a duplicate — relies on the backend's `ON CONFLICT(user_id, date) DO UPDATE` upsert behavior.
- **`components/Tooltip.tsx`** — real hover/focus/click tooltips (not just static hint text) on every scaled field. Went through two rounds of fixes: first version positioned the bubble via CSS `bottom: 100%` inside a `overflow-y: auto` scroll container, which silently clipped it off-screen near the top of the modal; rewrote it to use `position: fixed` with coordinates computed from `getBoundingClientRect()` on the icon, so it's immune to any ancestor's scroll/overflow clipping. Later added a `placement` prop (`"right"` default for the wizard, `"top-left"` for the dashboard's delta badges) since a single hardcoded direction broke one usage while fixing the other.
- **Trend visualization** — evolved from one combined line chart (mood/anxiety/stress) into an asymmetric layout matching the DESIGN_PROMPT spec: one large primary Mood chart + two smaller Anxiety/Stress sparkline tiles (each with a day-over-day delta arrow + tooltip explaining it) + a separate Sleep Hours bar chart, covering 4 metrics instead of 3.
- **Settings dropdown** — gear icon in the hero band opens Export/Delete/Sign out, replacing an earlier version that put those buttons in a crowded footer bar.

## 8. Design system integration

The actual visual design (colors, fonts, component classes) was authored in a separate Claude Design canvas (`Mental Health Progress Tracker/Mental Health Tracker.dc.html` + its `_ds/organic-*/styles.css`), gitignored/kept local. Its CSS custom properties (`--color-accent: #c67139`, `--font-heading: "Caprasimo"`, etc.) and component classes (`.btn`, `.card`, `.dialog`, `.tag`, `.seg`) were copied verbatim into `frontend/app/globals.css` as the actual source of truth for the app's look — the canvas file itself was only a design reference/prototype (login, consent, empty dashboard, a partial 2-field log modal), not the shipped code.

## 9. Testing

Backend test suite grew from 3 tests (service-layer only) to 22 tests across 6 files, run via `NODE_OPTIONS=--experimental-vm-modules npx jest` in `server/`:
- `log.service.test.js` — upsert/query logic (mocked `db.execute`)
- `user.service.test.js` — find-or-create, consent, delete (mocked `db.execute`)
- `auth.middleware.test.js` — missing header, wrong scheme, bad token, happy path (mocked `firebaseAuth` + `user.service`)
- `requireConsent.middleware.test.js` — blocks/allows based on `consented_at`
- `validate.middleware.test.js` — Zod rejection/pass-through behavior
- `app.integration.test.js` — real `supertest` requests through the actual Express `app` (Firebase + DB mocked at the module level), covering `/health`, 401s with no token, 400s on invalid log payloads, 403 before consent, and a successful `/api/auth/me`.

Frontend has no automated tests yet — verification so far has been manual (dev server + real Google sign-in + real Turso writes), not unit/integration tests.

## 10. Known open items

- No GitHub push has happened yet as part of this session's automated actions — any push was done manually by the user.
- Frontend has zero automated test coverage (no Jest/RTL/Playwright setup in `frontend/`).
- `errorHandler.js` doesn't yet distinguish operational errors (expected, safe to detail) from unexpected crashes (should stay generic) — every thrown error without an explicit `.status` currently becomes a bare 500.
