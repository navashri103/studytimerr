# StudyTimer

A study-session web app built around four time-management techniques. Pick the one that fits your work style, use the timer or matrix directly in the browser, and check your progress on the report page.

## Techniques

- **Pomodoro** — 25-minute focus sprints, 5-minute breaks, long break after four rounds
- **Eisenhower Matrix** — sort tasks into Do / Decide / Delegate / Delete quadrants
- **Pareto Analysis** — identify the 20% of tasks that drive 80% of your results
- **Parkinson's Law** — set a shorter deadline than you think you need and let pressure do the work

## Features

- Workspace view — run multiple technique widgets side by side
- Report page — heatmap and stats (streak, weekly/monthly focus minutes)
- Spotify player — paste any public playlist link to study with music
- Break games — memory match, reaction test, word scramble during Pomodoro breaks
- Accounts — sign up to save tasks and history across sessions (Supabase)

## Stack

- **Frontend** — Next.js 16, TypeScript, Tailwind CSS v4, Framer Motion
- **Backend** — FastAPI (Python), proxies auth and data to Supabase
- **Database / Auth** — Supabase (Postgres + Auth)

## Running locally

**Backend**

```bash
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env   # fill in SUPABASE_URL and SUPABASE_ANON_KEY
uvicorn main:app --reload
```

**Frontend**

```bash
cd frontend
npm install
cp .env.local.example .env.local   # set NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
