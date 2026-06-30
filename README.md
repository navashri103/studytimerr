# StudyTimer

![Next.js](https://img.shields.io/badge/Next.js-React-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-blue?logo=typescript)
![Python](https://img.shields.io/badge/Backend-Python-yellow?logo=python)
![Tested with Playwright](https://img.shields.io/badge/E2E-Playwright-2EAD33?logo=playwright)
![Tested with Vitest](https://img.shields.io/badge/Unit-Vitest-6E9F18?logo=vitest)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

Four time-management techniques, one app. Pick a method, learn how it works, and run your next study session.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Usage](#usage)
- [Roadmap](#roadmap)
- [License](#license)

## Features

- **Landing dashboard** — quick stats on focused time and tasks completed today, plus a 30-second quiz to help you pick a technique if you're not sure which one to use.
- **Multiple techniques** — choose between:
  - Pomodoro Technique
  - Eisenhower Matrix
  - Pareto Analysis
  - Parkinson's Law
- **Workspace** — combine techniques on one screen instead of switching between pages. Add or remove widgets on the fly with the "Add widget" menu.
- **Reports** — track session history and progress over time.
- **Authentication** — log in to pick up where you left off, or sign up for a new account.

## Tech Stack

**Frontend**
- [Next.js](https://nextjs.org/) (React, App Router) + TypeScript
- Tailwind CSS
- [Vitest](https://vitest.dev/) for unit testing
- [Playwright](https://playwright.dev/) for end-to-end testing

**Backend**
- Python (FastAPI-style `main.py`)
- SQL database

## Getting Started

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # on Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Testing

```bash
cd frontend
npm run test        # unit tests (Vitest)
npx playwright test # end-to-end tests
```

## Project Structure

```
WEEK2/
├── .claude/
│   └── settings.local.json
├── backend/
│   ├── sql/                # database schema/queries
│   ├── venv/
│   ├── .env
│   ├── main.py             # backend entrypoint
│   └── requirements.txt
└── frontend/
    ├── app/                 # Next.js app router pages
    ├── components/          # shared UI components
    ├── e2e/                 # Playwright end-to-end tests
    ├── lib/                 # utilities/helpers
    ├── public/
    ├── next.config.ts
    ├── playwright.config.ts
    ├── vitest.config.ts
    ├── tsconfig.json
    └── package.json
```

## Usage

1. From the dashboard, click **Start a session** or choose a technique from the "Choose your method" section.
2. In the **Workspace**, use **Add widget** to bring in additional techniques (Eisenhower Matrix, Pareto Analysis, Parkinson's Law) alongside your active timer.
3. Use **Start**, **Reset**, and **Skip** to control the active timer.
4. Check the **Report** tab to review your focused time and completed tasks.

## Roadmap

- [ ] Persist workspace layout per user
- [ ] Add more time-management techniques
- [ ] Export session reports

## License

MIT
