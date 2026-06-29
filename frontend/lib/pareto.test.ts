import { describe, expect, it } from "vitest";
import {
  addItem,
  createInitialParetoState,
  getSplit,
  removeItem,
  toggleVital,
} from "./pareto";

describe("pareto list logic", () => {
  it("starts empty", () => {
    expect(createInitialParetoState()).toEqual([]);
  });

  it("adds an item as not vital by default", () => {
    const state = addItem(createInitialParetoState(), "1", "Read chapter 4");
    expect(state).toEqual([{ id: "1", text: "Read chapter 4", vital: false }]);
  });

  it("trims whitespace and ignores empty text", () => {
    let state = addItem(createInitialParetoState(), "1", "  trimmed  ");
    expect(state[0].text).toBe("trimmed");

    state = addItem(state, "2", "   ");
    expect(state).toHaveLength(1);
  });

  it("toggles an item's vital flag without affecting others", () => {
    let state = createInitialParetoState();
    state = addItem(state, "1", "First");
    state = addItem(state, "2", "Second");
    state = toggleVital(state, "1");
    expect(state[0].vital).toBe(true);
    expect(state[1].vital).toBe(false);

    state = toggleVital(state, "1");
    expect(state[0].vital).toBe(false);
  });

  it("removes an item by id", () => {
    let state = createInitialParetoState();
    state = addItem(state, "1", "First");
    state = addItem(state, "2", "Second");
    state = removeItem(state, "1");
    expect(state).toEqual([{ id: "2", text: "Second", vital: false }]);
  });
});

describe("getSplit", () => {
  it("returns zeros for an empty list", () => {
    expect(getSplit(createInitialParetoState())).toEqual({
      total: 0,
      vitalCount: 0,
      trivialCount: 0,
      vitalPercent: 0,
    });
  });

  it("computes counts and rounded percentage", () => {
    let state = createInitialParetoState();
    state = addItem(state, "1", "A");
    state = addItem(state, "2", "B");
    state = addItem(state, "3", "C");
    state = toggleVital(state, "1");

    expect(getSplit(state)).toEqual({
      total: 3,
      vitalCount: 1,
      trivialCount: 2,
      vitalPercent: 33,
    });
  });
});
