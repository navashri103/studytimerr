# StudyTimer

Four time-management techniques, one app. Pick a method, learn how it works, and run your next study session.

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

- [Next.js](https://nextjs.org/) (React)
- TypeScript
- Tailwind CSS

## Getting Started

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd studytimer
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
studytimer/
├── app/
│   ├── page.tsx          # Landing dashboard
│   ├── workspace/        # Combinable widget workspace
│   ├── report/           # Session reports
│   └── login/            # Authentication
├── components/           # Shared UI components (widgets, timer, etc.)
└── public/
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
