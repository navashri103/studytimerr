export type PomodoroPhase = "focus" | "shortBreak" | "longBreak";

export const POMODORO_DURATIONS: Record<PomodoroPhase, number> = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export const SESSIONS_BEFORE_LONG_BREAK = 4;

export type PomodoroState = {
  phase: PomodoroPhase;
  secondsLeft: number;
  isRunning: boolean;
  completedFocusSessions: number;
};

export function createInitialPomodoroState(): PomodoroState {
  return {
    phase: "focus",
    secondsLeft: POMODORO_DURATIONS.focus,
    isRunning: false,
    completedFocusSessions: 0,
  };
}

export type PomodoroAction =
  | { type: "START" }
  | { type: "PAUSE" }
  | { type: "RESET" }
  | { type: "TICK" };

function advancePhase(
  phase: PomodoroPhase,
  completedFocusSessions: number,
): { phase: PomodoroPhase; completedFocusSessions: number } {
  if (phase === "focus") {
    const completed = completedFocusSessions + 1;
    if (completed >= SESSIONS_BEFORE_LONG_BREAK) {
      return { phase: "longBreak", completedFocusSessions: completed };
    }
    return { phase: "shortBreak", completedFocusSessions: completed };
  }
  if (phase === "shortBreak") {
    return { phase: "focus", completedFocusSessions };
  }
  return { phase: "focus", completedFocusSessions: 0 };
}

export function pomodoroReducer(
  state: PomodoroState,
  action: PomodoroAction,
): PomodoroState {
  switch (action.type) {
    case "START":
      return { ...state, isRunning: true };
    case "PAUSE":
      return { ...state, isRunning: false };
    case "RESET":
      return {
        ...state,
        secondsLeft: POMODORO_DURATIONS[state.phase],
        isRunning: false,
      };
    case "TICK": {
      if (!state.isRunning) return state;
      if (state.secondsLeft > 1) {
        return { ...state, secondsLeft: state.secondsLeft - 1 };
      }
      const { phase, completedFocusSessions } = advancePhase(
        state.phase,
        state.completedFocusSessions,
      );
      return {
        phase,
        completedFocusSessions,
        secondsLeft: POMODORO_DURATIONS[phase],
        isRunning: true,
      };
    }
    default:
      return state;
  }
}

export function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}
