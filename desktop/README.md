# StudyTimer — Desktop App

A native desktop wrapper for [StudyTimer](https://studytimerrr.vercel.app) — a time management app built around four proven study techniques: Pomodoro, Eisenhower Matrix, Pareto Analysis, and Parkinson's Law.

Built with Electron so the app runs natively on Windows, macOS, and Linux — no browser tab required.

---

## Features

- Full StudyTimer experience in a native desktop window
- Works on Windows, macOS, and Linux
- Your session and data stay in sync with the web app (same account)
- Built-in keyboard shortcuts (Ctrl+Q to quit, Ctrl+R to reload)
- Custom app icon in the taskbar

---

## Prerequisites

Make sure you have these installed before getting started:

- [Node.js](https://nodejs.org) — version 18 or higher
- [Git](https://git-scm.com)
- npm (comes bundled with Node.js)

To verify:
```bash
node --version
npm --version
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/navashri103/focusly-desktop-app.git
cd focusly-desktop-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the app

```bash
npm start
```

The app will open a desktop window loading the live StudyTimer site. Log in with your account and everything syncs automatically.

---

## Build an Installer

To package the app into a distributable installer:

### Windows (.exe)
```bash
npm run build:win
```

### macOS (.dmg)
```bash
npm run build:mac
```

### Linux (.AppImage)
```bash
npm run build:linux
```

The output will be in the `dist/` folder.

> **Windows note:** If the build fails with a symlink error, enable **Developer Mode** in Windows Settings → System → For developers, then retry.

---

## Project Structure

```
focusly-desktop-app/
├── main.js          # Electron main process — creates the window
├── package.json     # Dependencies and build config
├── assets/
│   ├── icon.png     # App icon (256×256)
│   └── tray-icon.png
└── dist/            # Built installers (generated, not committed)
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop shell | [Electron](https://electronjs.org) v28 |
| Packaging | [electron-builder](https://www.electron.build) |
| Web app | [StudyTimer](https://studytimerrr.vercel.app) (Next.js + FastAPI) |

---

## Web App Repositories

The desktop app loads the live web app. Source code for the full project:

- **Web frontend + backend:** [studytimerr](https://github.com/navashri103/studytimerr)

---

## Usage

1. Run the app with `npm start` or install the built `.exe`
2. **Sign up or log in** with your email and password
3. Choose a study technique from the dashboard
4. Track your progress in the Report page
5. Use the Workspace page to combine multiple techniques on one screen

---

## License

MIT — free to use, modify, and distribute.
