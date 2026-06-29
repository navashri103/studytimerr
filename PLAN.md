# StudyTimer — Detailed Build Plan

Each phase below has a goal, detailed scope, explicit success criteria, and a "review checkpoint" — after a phase is built, the dev server will be running and you check it off before the next phase starts.

---

## Phase 0 — Project Scaffolding

**Goal:** A running, empty Next.js shell with the right foundations so every later phase is just adding pages/components, not fighting config.

**Scope:**
- Create `frontend/` with Next.js (latest stable), App Router, TypeScript, ESLint.
- Client-rendered: no server components doing data fetching (there's no data to fetch — no persistence, no backend).
- Install and configure:
  - Tailwind CSS (latest) for styling — fast to make "gorgeous" UIs without hand-rolling CSS.
  - Framer Motion — for page/element animation (cards, transitions, timer pulses).
  - A clean icon set (lucide-react) — no emojis anywhere per your requirement.
- Set up base `layout.tsx`: global fonts (a distinctive pairing, not default system font), global background, metadata (title "StudyTimer", no tracking/analytics).
- Folder structure:
  - `app/` — routes: `/` (dashboard), `/pomodoro`, `/eisenhower`, `/pareto`, `/parkinsons`.
  - `components/` — shared UI (Card, Button, Timer primitives, PageHeader, etc).
  - `lib/` — pure logic (timer state machine, matrix data shape) kept separate from UI so it's unit-testable.
- `.gitignore` covering `node_modules`, `.next`, `.env*`, OS/editor cruft.
- Initialize git repo at project root (currently not a git repo) — needed for sane history and later Playwright/test diffing.
- Root `README.md` (minimal — install/run instructions only, no fluff).
- Testing setup: Vitest + React Testing Library wired up (config + one smoke test) so Phase-by-phase logic can get unit tests as it's written, not bolted on at the end.

**Success criteria:**
- [ ] `npm run dev` in `frontend/` serves a blank styled page at `localhost:3000` with no console errors.
- [ ] TypeScript strict mode on, `npm run build` succeeds with zero errors.
- [ ] `npm run lint` passes clean.
- [ ] Vitest smoke test runs and passes (`npm run test`).
- [ ] Git repo initialized, first commit made, `.gitignore` correctly excludes `node_modules`/`.next`.

**Review checkpoint:** You open `localhost:3000`, see a styled (not default-Next-template) blank shell with correct fonts/background — confirms the foundation before any real feature work.

---

## Phase 1 — Dashboard Shell

**Goal:** The home page users land on — a hub that sells the four techniques and routes into them. This is the first real "wow" UI moment, since you emphasized "slick, professional, gorgeous."

**Scope:**
- Animated hero/header area (subtle motion — not distracting, e.g. soft gradient shift or floating shapes, using Framer Motion + CSS).
- Four technique cards, one each for Pomodoro, Eisenhower Matrix, Pareto Analysis, Parkinson's Law:
  - Each card: name, one-line description, a distinct accent color/icon, hover animation (lift/glow), click → navigates to that technique's page.
  - Cards animate in on load (staggered fade/slide via Framer Motion).
- No search bar, no filters, no extra chrome — exactly four clear choices, per your "keep it simple" instruction.
- Fully responsive grid (stacks on mobile, grid on desktop).
- Color/theme direction: warm, distinctive palette (not default purple/indigo SaaS look) — exact palette finalized in Phase 7, but Phase 1 establishes the working direction so it doesn't look like a template.

**Success criteria:**
- [ ] All four cards render with correct routes wired (verified by clicking — even if destination pages are placeholder stubs at this point).
- [ ] Animations run at 60fps, no layout shift/jank.
- [ ] Responsive from 375px mobile width up to 1440px+ desktop.
- [ ] Zero emojis anywhere in copy or UI.

**Review checkpoint:** You browse the dashboard, resize the window, click each card (even if landing on a stub) — confirms the look/feel and navigation skeleton before deep-building each technique.

---

## Phase 2 — Pomodoro Technique Page

**Goal:** A correct, satisfying Pomodoro timer — your most detailed spec, so this gets the most precise state machine.

**Scope:**
- **Explanation block:** plain-language summary of the Pomodoro Technique at the top of the page (what it is, why it works, the 25/5/15 + 4-cycle structure), collapsible/dismissible so it doesn't crowd the timer once a user knows it.
- **Timer state machine** (in `lib/pomodoro.ts`, unit-tested in isolation from UI):
  - States: `focus` (25:00) → `shortBreak` (5:00) → repeat 3 more times → after the 4th focus session, `longBreak` (15:00) → cycle resets.
  - Tracks completed focus-session count within the current set of 4.
  - Pause/resume/reset controls; reset returns to the start of the *current* phase (not the whole cycle) — standard Pomodoro app behavior, confirm if you'd rather full-reset.
  - Auto-advances to the next phase when the timer hits zero, with a visual + (optional, mutable) sound cue.
- **Visual timer:** large circular/radial progress indicator (not just a digit countdown) animating smoothly, color-coded by phase (focus vs short break vs long break get distinct accent colors).
- **Cycle indicator:** 4 small dots/segments showing progress through the current set of focus sessions (e.g., 2 of 4 filled).
- Link/prompt into the break-game (Phase 6) appears here once that phase exists — stubbed for now.

**Success criteria:**
- [ ] Unit tests cover: phase transitions (focus→short break ×3, then →long break, then cycle resets), pause/resume correctness, countdown accuracy.
- [ ] Manual run: full 25/5/25/5/25/5/25/15 cycle visibly progresses correctly (sped up via a dev-only time-multiplier for testing, not shipped to users).
- [ ] Page is keyboard-accessible (space to pause/resume, at minimum).

**Review checkpoint:** You run a real (or accelerated) cycle, confirm timing and the 4-short-then-1-long pattern feels right, and read the explanation copy for tone/accuracy.

---

## Phase 3 — Eisenhower Matrix Page

**Goal:** A genuinely useful, editable 2x2 matrix — not just a static diagram.

**Scope:**
- **Explanation block:** what urgent/important means, and what Do/Decide/Delegate/Delete mean in this context.
- **Layout:** 2x2 grid, axes labeled (Urgent ↔ Not Urgent, Important ↔ Not Important), each quadrant clearly titled:
  - Important + Urgent → **Do**
  - Important + Not Urgent → **Decide** (schedule)
  - Not Important + Urgent → **Delegate**
  - Not Important + Not Urgent → **Delete**
- **Editable items per quadrant:**
  - Add a task (text input + enter/button).
  - Edit task text inline.
  - Delete a task.
  - Optionally drag a task between quadrants (nice-to-have — confirm if in scope or cut for MVP simplicity).
- State lives in React state only (no persistence per spec — refresh clears it; this should be obvious to the user, maybe a small inline note, not a warning banner).
- Empty-state styling per quadrant so it doesn't look broken with zero tasks.

**Success criteria:**
- [ ] Add/edit/delete works in all four quadrants independently.
- [ ] Unit tests for the matrix's data logic (`lib/eisenhower.ts`): add/edit/delete/move operations behave correctly without UI.
- [ ] No data persists across refresh (confirms correct "no persistence" behavior, not a bug).

**Review checkpoint:** You add a handful of real tasks, edit and delete a few, refresh to confirm it clears — confirms the interaction model before polish.

---

## Phase 4 — Pareto Analysis (80/20) Page

**Goal:** Explain the 80/20 rule and give a lightweight interactive tool to apply it.

**Scope:**
- **Explanation block:** what Pareto Analysis is, the 80/20 principle, how it applies to studying (e.g., 20% of topics/effort often drive 80% of results).
- **Interactive tool:** a simple ranked task/topic list where the user:
  - Adds items they're considering.
  - Marks/flags the high-impact ~20% (e.g., a toggle or drag-to-top "vital few" section vs "trivial many" section).
  - Visual split (e.g., two stacked lists: "Vital Few" / "Trivial Many") so the 80/20 framing is visually obvious, mirroring the Eisenhower interaction pattern for consistency.
- Kept intentionally lighter than Pomodoro/Eisenhower since Pareto is more of a thinking framework than a timer — avoid over-building this one.

**Success criteria:**
- [ ] User can add items and move/flag them between "Vital Few" and "Trivial Many".
- [ ] Unit tests for the list logic.
- [ ] Explanation copy reviewed for clarity (this page leans more on the explanation than mechanics).

**Review checkpoint:** You try the tool with a real study-topic list, confirm the framing makes sense and isn't over-engineered.

---

## Phase 5 — Parkinson's Law Page

**Goal:** Explain "work expands to fill the time available for its completion" and give a tool that lets the user *deliberately compress* a deadline.

**Scope:**
- **Explanation block:** what Parkinson's Law is, why artificially shortening deadlines can increase focus/output.
- **Interactive tool:** user enters a task name and a self-imposed deadline (a duration, e.g. "I'll finish this in 20 minutes" rather than their realistic estimate); a countdown starts, similar visual language to the Pomodoro radial timer (for consistency) but framed around a single user-defined task rather than fixed phases.
- Optional light touch: a prompt encouraging the user to set a deadline shorter than they think they need (the core mechanic of the law) — copy-only nudge, not enforced.

**Success criteria:**
- [ ] User can set an arbitrary countdown duration and task label, start/pause/reset it.
- [ ] Unit tests for the countdown logic (likely reuses/extends the Pomodoro timer primitive from `lib/`, not a duplicate implementation).
- [ ] Explanation copy clear and distinct from the Pomodoro explanation (avoid the two pages reading as near-duplicates).

**Review checkpoint:** You set a custom deadline, run the countdown, confirm it feels distinct from Pomodoro despite shared timer visuals.

---

## Phase 6 — Break Mini-Game (Snake)

**Goal:** A small, polished diversion during Pomodoro breaks — purely for fun, kept intentionally minimal in scope.

**Before building:** confirm with you — Snake is the default pick (classic, simple, well-understood scope: grid, arrow-key controls, growing snake, food, game-over on collision, score). Alternatives if you'd rather: a simple breakout/pong, or a quick reaction-time game. I'll proceed with Snake unless you say otherwise when we reach this phase.

**Scope (assuming Snake):**
- Canvas or CSS-grid based snake game, keyboard controls (arrow keys / WASD).
- Score tracking (session-only, no persistence).
- Pause when the break timer ends, with a prompt to return to focus mode.
- Accessible from the Pomodoro page during `shortBreak`/`longBreak` phases (e.g., a "play while you wait" panel/modal) — not a separate nav item, since it's a break companion, not a standalone technique.

**Success criteria:**
- [ ] Game is playable end-to-end (move, grow, lose, restart).
- [ ] No interference with the underlying break timer (timer keeps running correctly while game is in view).
- [ ] Basic unit test on game logic (collision/growth rules) if logic is non-trivial enough to warrant it; otherwise covered by manual/Playwright testing only.

**Review checkpoint:** You play a round during a real break cycle, confirm it's fun-enough and doesn't break the timer flow.

---

## Phase 7 — Visual Polish & Animation Pass

**Goal:** Take the now-functionally-complete app from "working" to "gorgeous" — this is where your "nano banana" / AI-image color scheme direction comes in.

**Scope:**
- **Color scheme finalization:** I'll give you a short, concrete brief you can feed to an image-gen tool (e.g., Nano Banana) to produce a moodboard/palette reference — things like: desired vibe (calm-focused vs energetic), 2-3 reference aesthetics, light/dark preference. You generate the image(s) and share them back; I translate them into an actual Tailwind theme (CSS variables, gradients, accent colors per technique) — replacing the placeholder palette from Phase 1.
- **Micro-animations pass:** button press feedback, timer phase-transition animations, card hover states, page-transition animations between dashboard and technique pages (Framer Motion `AnimatePresence`).
- **Typography pass:** confirm font pairing reads well at all sizes used.
- **Responsive audit:** every page re-checked at mobile/tablet/desktop breakpoints.
- **Empty/loading/edge states:** confirm nothing looks broken in unusual states (e.g., very long task text in Eisenhower/Pareto lists).
- Explicit no-emoji audit across all copy.

**Success criteria:**
- [ ] Final palette applied consistently across all 5 pages (dashboard + 4 techniques).
- [ ] All interactive elements have hover/active/focus states.
- [ ] No layout breakage at 375px–1920px widths.
- [ ] No emojis anywhere (final grep check).

**Review checkpoint:** Full visual walkthrough of every page — this is the "does it look gorgeous" gate before final testing.

---

## Phase 8 — Testing & Final Hardening

**Goal:** Confidence the MVP is solid before calling it done, per your stated strategy (unit tests throughout + integration testing at the end).

**Scope:**
- **Unit test coverage review:** confirm `lib/` logic for Pomodoro, Eisenhower, Pareto, Parkinson's, and Snake (if applicable) all have tests written incrementally in earlier phases — fill any gaps here.
- **Playwright integration tests:**
  - Dashboard → each technique page navigation.
  - Pomodoro: start a session, verify phase transitions over an accelerated/mocked clock.
  - Eisenhower: add/edit/delete a task in each quadrant.
  - Pareto: add and reclassify an item.
  - Parkinson's: set and run a custom countdown.
  - Snake (if built): basic playability smoke test.
- **Defect fixing:** triage and fix anything Playwright or manual review surfaces.
- **Production build check:** `npm run build` + `npm run start`, confirm the production build behaves identically to dev.
- Leave the dev (or production) server running for your final review per your stated workflow preference.

**Success criteria:**
- [ ] All unit tests pass.
- [ ] All Playwright integration tests pass.
- [ ] Production build succeeds and runs cleanly.
- [ ] No console errors/warnings across any page in either dev or production mode.

**Review checkpoint:** Final full sign-off — you use the live app end-to-end across all techniques and the break game, then we close out the MVP.

---

## Open questions to resolve before/at the relevant phase
1. **Phase 3:** Is drag-and-drop between Eisenhower quadrants in scope, or is add/edit/delete within a quadrant enough for MVP? — Resolved: add/edit/delete/complete within a quadrant, no drag-and-drop, plus a Save → read-only Results view.
2. **Phase 6:** Confirm Snake as the break game, or pick an alternative.
3. **Phase 7:** Your Nano Banana palette/mood images — needed before this phase can be finished.

---

## V2 (after the MVP, phases 0–8, is complete and tested)

Both items below were explicitly deferred — see CLAUDE.MD for the matching note. Do not start either before Phase 8 sign-off.

1. **Backend + auth (Supabase):** add login so each user's data (Pomodoro stats, Eisenhower matrix, Pareto list, Parkinson's tasks) saves and reloads per account instead of resetting on refresh. This overrides the MVP's "No persistence" / "No user management" rules — intentionally, for v2 only.
2. **Combined "all techniques at once" view:** a separate page where the user adds technique widgets (Pomodoro, Eisenhower, Pareto, Parkinson's) onto one screen via a plus icon, to run them side by side instead of navigating between separate pages. Needs real design work: shared/lifted state per widget, a layout/arrangement model, and responsive behavior with multiple simultaneous timers running.
