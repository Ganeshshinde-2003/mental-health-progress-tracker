# PRD — Mental Health Progress Tracker

## 1. Objective
Web app for patients to log daily mental health status and view trends over time. Secure, patient-sensitive UX. Built for LunaJoy full-stack assessment.

## 2. Users
Multi-user. Each patient authenticates individually (Google login) and sees only their own logs.

## 3. Scope

### 3.1 Frontend (React)
- **Auth:** Google login via Firebase Auth.
- **Daily Log Form** (one submission per day), fields:
  - Mood rating (scale, very sad → very happy)
  - Anxiety level (scale)
  - Sleep: hours, quality, disturbances (notes/tags)
  - Physical activity: type + duration
  - Social interaction frequency
  - Stress level (scale)
  - Symptoms of depression/anxiety: presence + severity
- **Trend Visualization:** chart, weekly/monthly toggle, 3 selected parameters plotted.
- **Real-time updates:** chart updates live via WebSocket when a new log is submitted (no refresh).
- **UX:** modals, tooltips, transitions guiding user through daily log flow. Calm, low-friction, mental-health-appropriate tone.

### 3.2 Backend (Node.js)
- **Auth endpoints:** verify Google/Firebase identity server-side.
- `POST /log` — submit daily log (authenticated).
- `GET /logs` — retrieve authenticated user's logs for visualization.
- **DB:** Turso (cloud-hosted SQLite-compatible) — stores user records + daily logs, scoped by user_id.
- **Realtime:** Socket.io, per-user room, emits on successful log submission.

### 3.3 Out of scope
- Admin/clinician dashboard.
- Multi-day-per-day editing/backfill (v1: one log per day, latest write per date).
- Push notifications / reminders.

## 4. Non-functional requirements
- Security: server-side token verification on every protected route; no client-trusted user IDs; parameterized queries only.
- Privacy: user data isolated by user_id at DB and socket level.
- No secrets committed; `.env.example` only.

## 5. Tech stack (locked)
| Layer | Choice |
|---|---|
| Frontend | React + Vite |
| Auth | Firebase Auth (Google) |
| Backend | Node.js + Express |
| Realtime | Socket.io |
| DB | Turso (cloud SQLite) |
| Chart | Recharts |
| Validation | Zod |
| Testing | Jest + Supertest |
| Backend hosting | Render |
| Frontend hosting | Vercel |

## 6. API contract

### POST /log
Request (auth header required):
```json
{
  "date": "2026-08-19",
  "mood": 4,
  "anxiety": 2,
  "sleepHours": 7,
  "sleepQuality": 3,
  "sleepDisturbances": "none",
  "activityType": "walk",
  "activityDuration": 30,
  "socialFrequency": 2,
  "stressLevel": 3,
  "symptoms": [{"name": "low energy", "severity": 2}]
}
```
Response: `201` with saved log object.

### GET /logs
Query params: `range=week|month`
Response: array of log objects for authenticated user.

## 7. Deliverable
GitHub repo link, working deployed demo (backend on Render, frontend on Vercel, DB on Turso), README with setup + architecture.

## 8. Security & Compliance Considerations

**HIPAA status:** This app is not a HIPAA-covered entity — no clinician, hospital, or insurer integration in scope, so no PHI is handled on behalf of a covered entity. Built with PHI-handling best practices in mind regardless, since mood/anxiety/symptom data is sensitive even outside HIPAA's legal scope.

**Implemented in this build:**
- Encryption in transit: TLS by default across Firebase Auth, Turso, Render, Vercel — no plaintext transport anywhere.
- Auth: server-side verification of Firebase ID tokens on every protected route; client never dictates its own user_id.
- Data isolation: every query scoped by user_id; Socket.io emits to per-user rooms only — no cross-user data leakage, even at the realtime layer.
- Explicit consent: checkbox at signup before symptom data collection begins.
- Disclaimer: UI footer + README state this is not a diagnostic tool and not medical advice.
- No PHI in logs/error messages; parameterized queries only (no injection surface).

**Not implemented (out of scope for assessment, required if this became a real clinical product):**
- BAA-covered infrastructure (e.g. AWS/GCP HIPAA-eligible services) if ever integrated with a covered entity.
- Encryption at rest with managed key rotation.
- Audit logging of all PHI access (who viewed what, when).
- Formal access controls / role-based permissions (clinician vs. patient roles).
- Data retention & deletion policy, breach notification process.
- Business Associate Agreements with all third-party vendors (Firebase, Turso, Render, Vercel) before handling real PHI.

## 9. Design Direction (reference: LunaJoy + Mito Health)

**Inspiration sources:**
- [hellolunajoy.com](https://hellolunajoy.com) — soft/warm/muted palette, compassionate plain-language copy, progressive disclosure (assessment → booking → matching), generous whitespace, bold-but-gentle typography, no clinical-cold tone.
- [mitohealth.com](https://mitohealth.com) — card-based modular dashboard layout, expandable/accordion sections, clear CTA hierarchy, chatbot-style guided interaction.

**Applied to this app:**

| PDF requirement | Design choice |
|---|---|
| Modals | Daily log opens in a modal overlay, not a full page nav — keeps the flow light and non-intrusive |
| Tooltips | Every scaled field (mood, anxiety, stress) has a tooltip/info icon explaining what the scale means, in calm supportive language |
| Transitions | Multi-step form wizard (mood → sleep → activity → social → stress → symptoms) with slide/fade transitions between steps + progress indicator |
| Guided daily log | Step-by-step modal wizard instead of one long form — mirrors LunaJoy's progressive disclosure pattern |
| Dashboard / data viz | Card-based grid, one card per trend chart, Mito-style modular layout |
| Overall tone | Warm neutrals, muted blues/lavenders/creams — never clinical white/harsh red — compassionate microcopy throughout |

See `DESIGN_PROMPT.md` for the full screen-by-screen spec to paste into Claude Design.

## 10. Open questions for sign-off
- Log scales: numeric 1–5 for mood/anxiety/stress/social, or labeled scale? (default: 1–5 numeric with labels)
- Symptom list: fixed checklist or free text? (default: fixed checklist + severity 0–3)
