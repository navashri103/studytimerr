import { describe, expect, it } from "vitest";
import {
  createInitialParkinsonsState,
  parkinsonsReducer,
  type ParkinsonsState,
} from "./parkinsons";

function tick(state: ParkinsonsState, times = 1): ParkinsonsState {
  let next = state;
  for (let i = 0; i < times; i++) {
    next = parkinsonsReducer(next, { type: "TICK" });
  }
  return next;
}

describe("parkinsonsReducer", () => {
  it("starts not set up, with no task or time", () => {
    const state = createInitialParkinsonsState();
    expect(state.isSetup).toBe(false);
    expect(state.taskName).toBe("");
    expect(state.totalSeconds).toBe(0);
  });

  it("SETUP configures the task name and duration, trimmed", () => {
    const state = parkinsonsReducer(createInitialParkinsonsState(), {
      type: "SETUP",
      taskName: "  Write the report  ",
      totalSeconds: 600,
    });
    expect(state.isSetup).toBe(true);
    expect(state.taskName).toBe("Write the report");
    expect(state.totalSeconds).toBe(600);
    expect(state.secondsLeft).toBe(600);
    expect(state.isRunning).toBe(false);
  });

  it("SETUP ignores empty task name or non-positive duration", () => {
    const initial = createInitialParkinsonsState();
    expect(
      parkinsonsReducer(initial, { type: "SETUP", taskName: "  ", totalSeconds: 600 }),
    ).toEqual(initial);
    expect(
      parkinsonsReducer(initial, { type: "SETUP", taskName: "Task", totalSeconds: 0 }),
    ).toEqual(initial);
  });

  it("does not START until set up", () => {
    const state = parkinsonsReducer(createInitialParkinsonsState(), {
      type: "START",
    });
    expect(state.isRunning).toBe(false);
  });

  it("START runs the countdown, TICK decrements it", () => {
    let state = parkinsonsReducer(createInitialParkinsonsState(), {
      type: "SETUP",
      taskName: "Task",
      totalSeconds: 10,
    });
    state = parkinsonsReducer(state, { type: "START" });
    state = tick(state, 3);
    expect(state.secondsLeft).toBe(7);
    expect(state.isRunning).toBe(true);
  });

  it("stops running automatically when the countdown reaches zero", () => {
    let state = parkinsonsReducer(createInitialParkinsonsState(), {
      type: "SETUP",
      taskName: "Task",
      totalSeconds: 3,
    });
    state = parkinsonsReducer(state, { type: "START" });
    state = tick(state, 5);
    expect(state.secondsLeft).toBe(0);
    expect(state.isRunning).toBe(false);
  });

  it("PAUSE stops the countdown without changing secondsLeft", () => {
    let state = parkinsonsReducer(createInitialParkinsonsState(), {
      type: "SETUP",
      taskName: "Task",
      totalSeconds: 10,
    });
    state = parkinsonsReducer(state, { type: "START" });
    state = tick(state, 4);
    state = parkinsonsReducer(state, { type: "PAUSE" });
    const secondsBeforeExtraTicks = state.secondsLeft;
    state = tick(state, 4);
    expect(state.isRunning).toBe(false);
    expect(state.secondsLeft).toBe(secondsBeforeExtraTicks);
  });

  it("RESET returns to the full configured duration and pauses", () => {
    let state = parkinsonsReducer(createInitialParkinsonsState(), {
      type: "SETUP",
      taskName: "Task",
      totalSeconds: 10,
    });
    state = parkinsonsReducer(state, { type: "START" });
    state = tick(state, 6);
    state = parkinsonsReducer(state, { type: "RESET" });
    expect(state.secondsLeft).toBe(10);
    expect(state.isRunning).toBe(false);
  });

  it("NEW_TASK clears everything back to the initial state", () => {
    let state = parkinsonsReducer(createInitialParkinsonsState(), {
      type: "SETUP",
      taskName: "Task",
      totalSeconds: 10,
    });
    state = parkinsonsReducer(state, { type: "NEW_TASK" });
    expect(state).toEqual(createInitialParkinsonsState());
  });
});
