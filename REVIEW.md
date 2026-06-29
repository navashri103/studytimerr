# StudyTimer — Project Review

A review of the current state of the app before a security check. Covers what's
built, what's verified working, and what should be addressed first.

## What this is

A Next.js (App Router) frontend + FastAPI backend, using Supabase as the
Postgres + Auth provider behind the backend (not called directly from the
frontend). Four time-management techniques, a combined workspace view, an
activity report, and a Spotify player widget, gated behind login.

## Architecture

- **`frontend/`** — Next.js 16, TypeScript, Tailwind v4, client-rendered.
  Talks only to the FastAPI backend (`lib/api.ts`), never to Supabase
  directly. Auth session (access/refresh token) is kept in `localStorage`
  via `lib/auth.tsx`.
- **`backend/`** — FastAPI (Python), proxies signup/login to Supabase Auth
  and runs per-request Postgrest queries using the caller's own access
  token, so Supabase's row-level security enforces per-user data ownership.
  No service-role key is used anywhere.
- **Supabase** — Postgres + Auth only. Schema in `backend/sql/schema.sql`:
  `daily_stats`, `eisenhower_tasks`, `pareto_items`, all with RLS policies
  scoped to `auth.uid() = user_id`.

## Features built

- Pomodoro, Eisenhower Matrix, Pareto Analysis, Parkinson's Law — each with
  an explanation block and the interactive tool, per the original spec.
- Three break-time mini-games (Memory Match, Reaction Test, Word Scramble),
  surfaced during Pomodoro breaks.
- Per-phase/per-event sound cues 5 seconds before a Pomodoro phase or
  Parkinson's countdown ends.
- Login/signup, dashboard with real "today" stats, Eisenhower tasks and
  Pareto items persisted server-side.
- Workspace page: combine multiple technique widgets on one screen.
- Report page: day streak, weekly/monthly totals, 13-week activity heatmap.
- Spotify player widget: any public playlist, switchable by the end user
  with inline instructions, choice persisted in `localStorage`.

## Test coverage

- **Frontend unit tests (Vitest):** 75 passing, covering all `lib/` pure
  logic — Pomodoro state machine, Eisenhower/Pareto data ops, report stats
  (streak/totals/heatmap), playlist-link parsing, memory match, reaction
  test, word scramble.
- **Frontend integration tests (Playwright):** 8 passing against a real
  production build and a real (test) Supabase-backed account — dashboard
  nav, Pomodoro phase transitions, Eisenhower CRUD + Save/Results, Pareto
  reclassification, Parkinson's setup, break games.
  - Note: two of these (`eisenhower.spec.ts`, `pareto.spec.ts`) have shown
    intermittent failures this session due to live Supabase network
    latency, not application bugs — confirmed by rerunning in isolation
    each time. Worth knowing about before treating a red run as a real
    regression.
- **Backend (Python):** **no automated tests exist.** Every backend
  endpoint has only been verified manually via `curl` and ad-hoc Playwright
  scripts during development. This is the biggest test-coverage gap.

## Recommended fixes before a security review

### High priority

1. **No backend tests.** Add at minimum: auth endpoint tests (signup/login
   success and failure paths), and CRUD tests per router with a real or
   mocked Supabase client. A security reviewer will expect some coverage
   here, especially around the auth dependency (`app/deps.py`).
2. **Email confirmation is disabled** in Supabase Auth (turned off during
   development so signup returns a session immediately). This means
   anyone can sign up with an email address they don't own. Decide
   explicitly: re-enable confirmation for real users, or document this as
   an accepted MVP tradeoff — don't leave it as an unexamined default.
3. **Unpinned backend dependencies** (`backend/requirements.txt` has no
   version constraints). Pin versions before any production deploy so a
   `pip install` six months from now doesn't silently pull in breaking or
   vulnerable releases.
4. **Tokens stored in `localStorage`** (`lib/auth.tsx`), not an `httpOnly`
   cookie. This is simple and was a deliberate choice for this build, but
   it means any successful XSS on the frontend can exfiltrate a user's
   session. Worth a conscious decision: accept it for this MVP's risk
   profile, or migrate to cookie-based sessions.

### Medium priority

5. **No input bounds-checking** on `daily-stats` endpoints — a client can
   POST arbitrary `minutes` or `delta` values (e.g. negative numbers or
   absurdly large ones). RLS means a user can only corrupt their *own*
   stats, so this is a data-integrity issue, not a cross-user
   vulnerability, but still worth clamping server-side.
6. **CORS origins are hardcoded** to `localhost:3000`/`3001`
   (`backend/main.py`). Must be updated to the real production origin(s)
   before deploy, and the dev origins removed.
7. **No rate limiting** on `/auth/signup` or `/auth/login` in our own
   backend. Supabase Auth has its own platform-level limits, but confirm
   they're sufficient, or add limiting at the FastAPI layer too.

### Low priority / housekeeping

8. **`.hintrc`** at the project root looks IDE-generated (webhint), not
   something intentionally added — confirm it's wanted or delete it.
9. No HTTPS enforcement anywhere yet, since everything runs on
   `localhost`. Standard for local dev, but flag it as a pre-deploy
   checklist item, not something to fix now.

## Worth knowing, not fixing

- **`app/deps.py` decodes the JWT payload without verifying its
  signature**, just to read the `sub` claim for use as `user_id`. This
  looks alarming out of context, but it's safe: the *actual* bearer token
  (not the decoded value) is what gets sent to Supabase's PostgREST on the
  real data call via `client.postgrest.auth(token)`, and Supabase
  independently verifies that token's signature server-side. A forged
  payload would simply fail there. This was a deliberate fix earlier in
  the build (a separate `client.auth.get_user()` round-trip was causing
  intermittent 401s right after signup); flagging it here so it's
  understood rather than re-discovered as a false alarm during review.
