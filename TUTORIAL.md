# StudyTimer — Tutorial

A plain-language walkthrough of what this website is, how it's built, why
each piece of technology was chosen, and how to run it yourself.

## What it does

StudyTimer is a study-session app built around four well-known time
management techniques. Instead of picking one and hardcoding it, the app
teaches all four and lets you actually use whichever fits the moment:

- **Pomodoro Technique** — 25-minute focus sessions, 5-minute short breaks,
  a 15-minute long break after every 4 sessions.
- **Eisenhower Matrix** — sort tasks into Do / Decide / Delegate / Delete
  based on urgency and importance.
- **Pareto Analysis (80/20 rule)** — separate the "vital few" tasks that
  matter most from the "trivial many."
- **Parkinson's Law** — set yourself a deadline shorter than feels
  comfortable, on the theory that work expands to fill the time you give it.

On top of the four techniques:

- **Workspace** — put several technique widgets on one screen at once
  instead of switching pages.
- **Report** — your daily streak, this week's/month's totals, and a
  GitHub-style heatmap of how much you've focused over the last 13 weeks.
- **Break games** — Memory Match, a Reaction Test, and Word Scramble,
  surfaced automatically during Pomodoro breaks.
- **Music player** — a small floating widget that embeds a Spotify
  playlist (yours or the default), so you don't need to leave the tab to
  put on background music.
- **Accounts** — sign up / log in, and your Eisenhower tasks, Pareto list,
  and daily stats are saved and reload the next time you log in.

## The two halves of the app, and why

The app is split into two projects that talk to each other over HTTP:

```
frontend/   →  what you see in the browser (Next.js)
backend/    →  the API that frontend talks to (FastAPI, Python)
```

**Why split it like this at all?** The project's own ground rules said:
*"if the app needs backend, use Python."* So when login and saved data
were added, the right move was a real Python backend — not bolting a
database client directly onto the React app.

### Frontend: Next.js + TypeScript + Tailwind

- **Next.js** (a React framework) — handles routing (one folder per page
  under `frontend/app/`), bundling, and production builds. It's the
  standard, well-supported choice for a React app today.
- **TypeScript** — catches a whole category of bugs (wrong types, typos in
  property names) before the code ever runs, at the cost of a little extra
  upfront syntax.
- **Tailwind CSS** — utility classes (`flex`, `rounded-2xl`, `text-sm`)
  written directly in the markup instead of separate `.css` files. Faster
  to iterate on a visual design with, which mattered a lot given how many
  rounds of visual feedback this app went through.
- **Framer Motion** — the animation library behind every fade-in, hover
  lift, and the pulsing clock on the dashboard. Handles the kind of
  "animate this when it appears/disappears" logic that's painful to hand-write
  in plain CSS.
- **lucide-react** — the icon set used everywhere (timers, checkmarks,
  arrows). One consistent icon style instead of mixing sources.

### Backend: FastAPI (Python)

- **FastAPI** — a Python web framework for building APIs. Chosen because
  the project rules specifically called for Python on the backend, and
  FastAPI is the modern, fast-to-write-in standard for that.
- **Uvicorn** — the actual server process that runs the FastAPI app
  (FastAPI defines the app; Uvicorn is what executes it and listens on a
  port).
- **Pydantic** — validates the shape of every request body automatically
  (e.g. "email must look like an email, password must be a string") and
  comes bundled with FastAPI.

### Database + accounts: Supabase

- **Supabase** — a hosted Postgres database with built-in user accounts
  (sign up, log in, password handling) and **row-level security (RLS)** —
  a database-level rule that says "a user can only ever see or change
  their own rows." This means even if there were a bug in the backend
  code, the database itself still wouldn't let one user read another
  user's tasks.
- Crucially, **the frontend never talks to Supabase directly** — only the
  backend does, using whatever access token the logged-in user currently
  has. This keeps all the data-access logic in one place (Python) instead
  of split across two languages.

### Testing

- **Vitest** — runs the unit tests for all the "pure logic" code (the
  Pomodoro timer's state machine, the Eisenhower/Pareto data operations,
  the streak/heatmap math, the games). 75 of these tests exist and pass.
  Pure logic means: no UI, no network — just "given this input, is the
  output correct," which makes bugs in core behavior cheap to catch.
- **Playwright** — drives an actual browser to click through real flows
  (sign up, add a task, refresh the page, confirm it's still there) against
  a real production build and a real test account. 8 of these exist.
- **Note:** the backend (Python) currently has no automated tests — see
  `REVIEW.md` for the full list of things worth tightening before this
  goes further.

## How a page actually works, end to end

Take the Eisenhower Matrix page as a concrete example:

1. You load `/eisenhower`. The page asks the backend, "give me this user's
   tasks," sending along the access token from when you logged in.
2. The backend checks that token, then asks Supabase's database for rows
   in the `eisenhower_tasks` table belonging to that user — Supabase's RLS
   rule enforces that it can *only* see that user's rows.
3. You type a task and hit enter. The browser immediately shows it (so it
   feels instant), while in the background it sends a "create this task"
   request to the backend, which saves it to the database.
4. Refresh the page, log out and back in, switch devices — the task is
   still there, because it lives in the database, not just in the
   browser's memory.

The Pomodoro timer and Parkinson's countdown work differently on purpose:
their second-by-second countdown state is *not* saved anywhere. Only the
result — "you focused for 25 minutes" — gets reported to the backend, to
feed into the Report page's streak and totals. Saving a live countdown
mid-tick isn't meaningful the way a task list is.

## Project layout

```
frontend/
  app/                  one folder per page/route
    page.tsx            dashboard
    pomodoro/            Pomodoro page
    eisenhower/          Eisenhower page
    pareto/              Pareto page
    parkinsons/          Parkinson's page
    workspace/           combined-widget page
    report/              streak/heatmap page
    login/               sign up / log in
  components/           reusable UI pieces (cards, headers, the games, etc.)
  lib/                  pure logic + the API client + the auth helper
  e2e/                  Playwright tests
  *.test.ts             Vitest unit tests, next to the code they test

backend/
  main.py               creates the API, wires up CORS and routers
  app/
    config.py           reads Supabase URL/key from environment variables
    deps.py             figures out which user is making the request
    routers/            one file per group of endpoints (auth, eisenhower, ...)
  sql/schema.sql         the database tables + row-level security rules
```

## Running it yourself

You need two things running at once, plus a Supabase project already set up
(see `backend/.env.example` for what credentials it needs).

**Backend:**
```
cd backend
./venv/Scripts/python.exe -m uvicorn main:app --port 8000
```

**Frontend** (separate terminal):
```
cd frontend
npm run dev
```

Then open `http://localhost:3000`.

## Where to look next

- **`PLAN.md`** — the original phase-by-phase build plan, plus the v2
  feature list (backend, Workspace, Report) and what's still possible
  after that.
- **`REVIEW.md`** — a critical look at what should be tightened up before
  a security review (test gaps, config that needs to change for a real
  deployment, etc.) — read this before treating the app as "done."
- **`CLAUDE.MD`** — the original brief this whole project was built from.
