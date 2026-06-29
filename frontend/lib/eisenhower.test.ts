import { describe, expect, it } from "vitest";
import {
  addTask,
  createInitialEisenhowerState,
  editTask,
  removeTask,
} from "./eisenhower";

describe("eisenhower matrix logic", () => {
  it("starts with all four quadrants empty", () => {
    const state = createInitialEisenhowerState();
    expect(state.do).toEqual([]);
    expect(state.decide).toEqual([]);
    expect(state.delegate).toEqual([]);
    expect(state.delete).toEqual([]);
  });

  it("adds a task to the given quadrant only", () => {
    const state = addTask(createInitialEisenhowerState(), "do", "1", "Ship the report");
    expect(state.do).toEqual([{ id: "1", text: "Ship the report" }]);
    expect(state.decide).toEqual([]);
  });

  it("trims whitespace and ignores empty text", () => {
    let state = addTask(createInitialEisenhowerState(), "do", "1", "  trimmed  ");
    expect(state.do[0].text).toBe("trimmed");

    state = addTask(state, "do", "2", "   ");
    expect(state.do).toHaveLength(1);
  });

  it("edits a task's text in place without affecting others", () => {
    let state = createInitialEisenhowerState();
    state = addTask(state, "decide", "1", "First");
    state = addTask(state, "decide", "2", "Second");
    state = editTask(state, "decide", "1", "First, edited");
    expect(state.decide).toEqual([
      { id: "1", text: "First, edited" },
      { id: "2", text: "Second" },
    ]);
  });

  it("ignores edits that would leave empty text", () => {
    let state = addTask(createInitialEisenhowerState(), "do", "1", "Keep me");
    state = editTask(state, "do", "1", "   ");
    expect(state.do[0].text).toBe("Keep me");
  });

  it("removes a task from its quadrant only", () => {
    let state = createInitialEisenhowerState();
    state = addTask(state, "delegate", "1", "Ask Sam");
    state = addTask(state, "delegate", "2", "Ask Lee");
    state = removeTask(state, "delegate", "1");
    expect(state.delegate).toEqual([{ id: "2", text: "Ask Lee" }]);
  });

  it("keeps quadrants independent of each other", () => {
    let state = createInitialEisenhowerState();
    state = addTask(state, "do", "1", "Do task");
    state = addTask(state, "delete", "1", "Delete task");
    state = removeTask(state, "do", "1");
    expect(state.do).toEqual([]);
    expect(state.delete).toEqual([{ id: "1", text: "Delete task" }]);
  });
});
