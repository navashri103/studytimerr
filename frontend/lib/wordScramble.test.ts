import { describe, expect, it } from "vitest";
import { WORD_LIST, isCorrectGuess, pickWord, scrambleWord } from "./wordScramble";

const reverse = <T>(items: T[]): T[] => [...items].reverse();

describe("scrambleWord", () => {
  it("returns a permutation with the same letters", () => {
    const scrambled = scrambleWord("study", reverse);
    expect(scrambled.split("").sort()).toEqual("study".split("").sort());
  });

  it("returns a different arrangement than the original when possible", () => {
    expect(scrambleWord("study", reverse)).toBe("yduts");
    expect(scrambleWord("study", reverse)).not.toBe("study");
  });

  it("leaves single-letter words unchanged", () => {
    expect(scrambleWord("a", reverse)).toBe("a");
  });

  it("retries if the shuffle happens to return the original word", () => {
    let calls = 0;
    const identityThenReverse = <T>(items: T[]): T[] => {
      calls++;
      return calls === 1 ? items : reverse(items);
    };
    const scrambled = scrambleWord("cat", identityThenReverse);
    expect(scrambled).toBe("tac");
  });
});

describe("pickWord", () => {
  it("picks the word at the index implied by the random function", () => {
    expect(pickWord(WORD_LIST, () => 0)).toBe(WORD_LIST[0]);
    expect(pickWord(WORD_LIST, () => 0.999)).toBe(
      WORD_LIST[WORD_LIST.length - 1],
    );
  });
});

describe("isCorrectGuess", () => {
  it("is case-insensitive and trims whitespace", () => {
    expect(isCorrectGuess("Focus", "  focus  ")).toBe(true);
    expect(isCorrectGuess("focus", "FOCUS")).toBe(true);
  });

  it("rejects wrong guesses", () => {
    expect(isCorrectGuess("focus", "study")).toBe(false);
  });
});
