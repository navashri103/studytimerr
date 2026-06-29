import { describe, expect, it } from "vitest";
import {
  createMemoryGame,
  flipCard,
  isComplete,
  resolveMismatch,
  type MemoryState,
} from "./memoryMatch";

const identity = <T>(items: T[]): T[] => items;

describe("memory match game", () => {
  it("creates a shuffled deck with each symbol appearing twice", () => {
    const state = createMemoryGame(identity);
    expect(state.cards).toHaveLength(12);
    expect(state.flippedIds).toEqual([]);
    expect(state.moves).toBe(0);

    const counts: Record<string, number> = {};
    for (const card of state.cards) {
      counts[card.symbol] = (counts[card.symbol] ?? 0) + 1;
    }
    expect(Object.values(counts)).toEqual([2, 2, 2, 2, 2, 2]);
  });

  it("flips the first card without affecting moves", () => {
    let state = createMemoryGame(identity);
    state = flipCard(state, 0);
    expect(state.flippedIds).toEqual([0]);
    expect(state.moves).toBe(0);
  });

  it("matches two cards with the same symbol and marks them matched", () => {
    // identity shuffle: cards[0] and cards[6] are both "sun"
    let state = createMemoryGame(identity);
    state = flipCard(state, 0);
    state = flipCard(state, 6);
    expect(state.moves).toBe(1);
    expect(state.flippedIds).toEqual([]);
    expect(state.cards.find((c) => c.id === 0)?.matched).toBe(true);
    expect(state.cards.find((c) => c.id === 6)?.matched).toBe(true);
  });

  it("keeps mismatched cards flipped until resolved, and counts the move", () => {
    let state = createMemoryGame(identity);
    state = flipCard(state, 0); // sun
    state = flipCard(state, 1); // moon
    expect(state.moves).toBe(1);
    expect(state.flippedIds).toEqual([0, 1]);
    expect(state.cards.some((c) => c.matched)).toBe(false);
  });

  it("resolveMismatch clears flipped ids only when they did not match", () => {
    let state = createMemoryGame(identity);
    state = flipCard(state, 0);
    state = flipCard(state, 1);
    state = resolveMismatch(state);
    expect(state.flippedIds).toEqual([]);
  });

  it("ignores clicks on an already matched or already-flipped card", () => {
    let state = createMemoryGame(identity);
    state = flipCard(state, 0);
    state = flipCard(state, 6); // matches, both id 0 and 6 now matched
    const afterMatch = state;
    state = flipCard(state, 0); // already matched, ignored
    expect(state).toEqual(afterMatch);
  });

  it("starts a new pair if a third card is clicked after a mismatch", () => {
    let state = createMemoryGame(identity);
    state = flipCard(state, 0); // sun
    state = flipCard(state, 1); // moon - mismatch, still flipped
    state = flipCard(state, 2); // star - should clear mismatch and start fresh
    expect(state.flippedIds).toEqual([2]);
  });

  it("isComplete is true only once every card is matched", () => {
    let state: MemoryState = createMemoryGame(identity);
    expect(isComplete(state)).toBe(false);

    for (let i = 0; i < 6; i++) {
      state = flipCard(state, i);
      state = flipCard(state, i + 6);
    }
    expect(isComplete(state)).toBe(true);
  });
});
