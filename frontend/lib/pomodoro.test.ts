import { describe, expect, it } from "vitest";
import {
  POMODORO_DURATIONS,
  createInitialPomodoroState,
  formatTime,
  pomodoroReducer,
  type PomodoroState,
} from "./pomodoro";

function tick(state: PomodoroState, times = 1): PomodoroState {
  let next = state;
  for (let i = 0; i < times; i++) {
    next = pomodoroReducer(next, { type: "TICK" });
  }
  return next;
}

describe("pomodoroReducer", () => {
  it("starts paused in the focus phase with full duration", () => {
    const state = createInitialPomodoroState();
    expect(state.phase).toBe("focus");
    expect(state.secondsLeft).toBe(POMODORO_DURATIONS.focus);
    expect(state.isRunning).toBe(false);
    expect(state.completedFocusSessions).toBe(0);
  });

  it("does not tick down while paused", () => {
    const state = createInitialPomodoroState();
    const next = tick(state);
    expect(next.secondsLeft).toBe(POMODORO_DURATIONS.focus);
  });

  it("ticks down by one second while running", () => {
    const state = pomodoroReducer(createInitialPomodoroState(), {
      type: "START",
    });
    const next = tick(state);
    expect(next.secondsLeft).toBe(POMODORO_DURATIONS.focus - 1);
    expect(next.isRunning).toBe(true);
  });

  it("transitions focus -> shortBreak after the first session", () => {
    let state = pomodoroReducer(createInitialPomodoroState(), {
      type: "START",
    });
    state = tick(state, POMODORO_DURATIONS.focus);
    expect(state.phase).toBe("shortBreak");
    expect(state.secondsLeft).toBe(POMODORO_DURATIONS.shortBreak);
    expect(state.completedFocusSessions).toBe(1);
  });

  it("transitions shortBreak -> focus after a break", () => {
    let state = pomodoroReducer(createInitialPomodoroState(), {
      type: "START",
    });
    state = tick(state, POMODORO_DURATIONS.focus); // -> shortBreak
    state = tick(state, POMODORO_DURATIONS.shortBreak); // -> focus
    expect(state.phase).toBe("focus");
    expect(state.secondsLeft).toBe(POMODORO_DURATIONS.focus);
    expect(state.completedFocusSessions).toBe(1);
  });

  it("runs 4 focus/short-break cycles then a long break, then resets", () => {
    let state = pomodoroReducer(createInitialPomodoroState(), {
      type: "START",
    });

    for (let session = 1; session <= 3; session++) {
      state = tick(state, POMODORO_DURATIONS.focus); // focus -> shortBreak
      expect(state.phase).toBe("shortBreak");
      expect(state.completedFocusSessions).toBe(session);
      state = tick(state, POMODORO_DURATIONS.shortBreak); // shortBreak -> focus
      expect(state.phase).toBe("focus");
    }

    state = tick(state, POMODORO_DURATIONS.focus); // 4th focus -> longBreak
    expect(state.phase).toBe("longBreak");
    expect(state.secondsLeft).toBe(POMODORO_DURATIONS.longBreak);
    expect(state.completedFocusSessions).toBe(4);

    state = tick(state, POMODORO_DURATIONS.longBreak); // longBreak -> focus, cycle resets
    expect(state.phase).toBe("focus");
    expect(state.completedFocusSessions).toBe(0);
  });

  it("PAUSE stops the timer without changing secondsLeft", () => {
    let state = pomodoroReducer(createInitialPomodoroState(), {
      type: "START",
    });
    state = tick(state, 5);
    state = pomodoroReducer(state, { type: "PAUSE" });
    const secondsBeforeExtraTicks = state.secondsLeft;
    state = tick(state, 5);
    expect(state.isRunning).toBe(false);
    expect(state.secondsLeft).toBe(secondsBeforeExtraTicks);
  });

  it("RESET returns to the start of the current phase and pauses", () => {
    let state = pomodoroReducer(createInitialPomodoroState(), {
      type: "START",
    });
    state = tick(state, 10);
    state = pomodoroReducer(state, { type: "RESET" });
    expect(state.secondsLeft).toBe(POMODORO_DURATIONS.focus);
    expect(state.isRunning).toBe(false);
  });

  it("SKIP advances to the next phase immediately, even while paused", () => {
    let state = createInitialPomodoroState();
    state = pomodoroReducer(state, { type: "SKIP" });
    expect(state.phase).toBe("shortBreak");
    expect(state.secondsLeft).toBe(POMODORO_DURATIONS.shortBreak);
    expect(state.completedFocusSessions).toBe(1);
    expect(state.isRunning).toBe(false);
  });

  it("SKIP preserves the running state instead of forcing it", () => {
    let state = pomodoroReducer(createInitialPomodoroState(), {
      type: "START",
    });
    state = pomodoroReducer(state, { type: "SKIP" });
    expect(state.isRunning).toBe(true);
    expect(state.phase).toBe("shortBreak");
  });

  it("SKIP through a full cycle reaches longBreak then resets, same as ticking", () => {
    let state = createInitialPomodoroState();
    for (let i = 0; i < 4; i++) {
      state = pomodoroReducer(state, { type: "SKIP" }); // focus -> break
      state = pomodoroReducer(state, { type: "SKIP" }); // break -> focus (or longBreak after 4th)
    }
    expect(state.phase).toBe("focus");
    expect(state.completedFocusSessions).toBe(0);
  });
});

describe("formatTime", () => {
  it("pads minutes and seconds to two digits", () => {
    expect(formatTime(5)).toBe("00:05");
    expect(formatTime(90)).toBe("01:30");
    expect(formatTime(25 * 60)).toBe("25:00");
  });
});
