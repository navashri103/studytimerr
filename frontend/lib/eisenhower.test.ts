import { describe, expect, it } from "vitest";
import {
  addTask,
  createInitialEisenhowerState,
  editTask,
  removeTask,
  toggleTaskCompleted,
} from "./eisenhower";

describe("eisenhower matrix logic", () => {
  it("starts with all four quadrants empty", () => {
    const state = createInitialEisenhowerState();
    expect(state.do).toEqual([]);
    expect(state.decide).toEqual([]);
    expect(state.delegate).toEqual([]);
    expect(state.delete).toEqual([]);
  });

  it("adds a task to the given quadrant only, uncompleted", () => {
    const state = addTask(createInitialEisenhowerState(), "do", "1", "Ship the report");
    expect(state.do).toEqual([
      { id: "1", text: "Ship the report", completed: false },
    ]);
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
      { id: "1", text: "First, edited", completed: false },
      { id: "2", text: "Second", completed: false },
    ]);
  });

  it("ignores edits that would leave empty text", () => {
    let state = addTask(createInitialEisenhowerState(), "do", "1", "Keep me");
    state = editTask(state, "do", "1", "   ");
    expect(state.do[0].text).toBe("Keep me");
  });

  it("toggles a task's completed state without affecting others", () => {
    let state = createInitialEisenhowerState();
    state = addTask(state, "do", "1", "First");
    state = addTask(state, "do", "2", "Second");
    state = toggleTaskCompleted(state, "do", "1");
    expect(state.do[0].completed).toBe(true);
    expect(state.do[1].completed).toBe(false);

    state = toggleTaskCompleted(state, "do", "1");
    expect(state.do[0].completed).toBe(false);
  });

  it("removes a task from its quadrant only", () => {
    let state = createInitialEisenhowerState();
    state = addTask(state, "delegate", "1", "Ask Sam");
    state = addTask(state, "delegate", "2", "Ask Lee");
    state = removeTask(state, "delegate", "1");
    expect(state.delegate).toEqual([
      { id: "2", text: "Ask Lee", completed: false },
    ]);
  });

  it("keeps quadrants independent of each other", () => {
    let state = createInitialEisenhowerState();
    state = addTask(state, "do", "1", "Do task");
    state = addTask(state, "delete", "1", "Delete task");
    state = removeTask(state, "do", "1");
    expect(state.do).toEqual([]);
    expect(state.delete).toEqual([
      { id: "1", text: "Delete task", completed: false },
    ]);
  });
});
