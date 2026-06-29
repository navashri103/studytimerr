import { describe, expect, it } from "vitest";
import {
  createInitialReactionState,
  reactionReducer,
} from "./reactionTest";

describe("reactionReducer", () => {
  it("starts idle with no recorded times", () => {
    const state = createInitialReactionState();
    expect(state.phase).toBe("idle");
    expect(state.bestMs).toBeNull();
  });

  it("START_WAITING moves to the waiting phase", () => {
    const state = reactionReducer(createInitialReactionState(), {
      type: "START_WAITING",
    });
    expect(state.phase).toBe("waiting");
  });

  it("BECOME_READY only applies while waiting", () => {
    const idle = createInitialReactionState();
    expect(
      reactionReducer(idle, { type: "BECOME_READY", readyAt: 1000 }).phase,
    ).toBe("idle");

    const waiting = reactionReducer(idle, { type: "START_WAITING" });
    const ready = reactionReducer(waiting, {
      type: "BECOME_READY",
      readyAt: 1000,
    });
    expect(ready.phase).toBe("ready");
    expect(ready.readyAt).toBe(1000);
  });

  it("clicking while waiting is a false start", () => {
    let state = reactionReducer(createInitialReactionState(), {
      type: "START_WAITING",
    });
    state = reactionReducer(state, { type: "CLICK", clickedAt: 500 });
    expect(state.phase).toBe("tooSoon");
  });

  it("clicking while ready records the reaction time", () => {
    let state = reactionReducer(createInitialReactionState(), {
      type: "START_WAITING",
    });
    state = reactionReducer(state, { type: "BECOME_READY", readyAt: 1000 });
    state = reactionReducer(state, { type: "CLICK", clickedAt: 1230 });
    expect(state.phase).toBe("result");
    expect(state.lastResultMs).toBe(230);
    expect(state.bestMs).toBe(230);
  });

  it("keeps the lower of two results as best", () => {
    let state = createInitialReactionState();
    state = reactionReducer(state, { type: "START_WAITING" });
    state = reactionReducer(state, { type: "BECOME_READY", readyAt: 0 });
    state = reactionReducer(state, { type: "CLICK", clickedAt: 300 });
    expect(state.bestMs).toBe(300);

    state = reactionReducer(state, { type: "RESET" });
    state = reactionReducer(state, { type: "START_WAITING" });
    state = reactionReducer(state, { type: "BECOME_READY", readyAt: 0 });
    state = reactionReducer(state, { type: "CLICK", clickedAt: 180 });
    expect(state.lastResultMs).toBe(180);
    expect(state.bestMs).toBe(180);

    state = reactionReducer(state, { type: "RESET" });
    state = reactionReducer(state, { type: "START_WAITING" });
    state = reactionReducer(state, { type: "BECOME_READY", readyAt: 0 });
    state = reactionReducer(state, { type: "CLICK", clickedAt: 400 });
    expect(state.lastResultMs).toBe(400);
    expect(state.bestMs).toBe(180);
  });

  it("RESET returns to idle but preserves the best time", () => {
    let state = createInitialReactionState();
    state = reactionReducer(state, { type: "START_WAITING" });
    state = reactionReducer(state, { type: "BECOME_READY", readyAt: 0 });
    state = reactionReducer(state, { type: "CLICK", clickedAt: 250 });
    state = reactionReducer(state, { type: "RESET" });
    expect(state.phase).toBe("idle");
    expect(state.lastResultMs).toBeNull();
    expect(state.bestMs).toBe(250);
  });
});
