import { describe, expect, it } from "vitest";
import { pickTechnique, scoreAnswers, type QuizOption } from "./techniqueQuiz";

function option(scores: QuizOption["scores"]): QuizOption {
  return { label: "test", scores };
}

describe("scoreAnswers", () => {
  it("sums scores across all answers per technique", () => {
    const totals = scoreAnswers([
      option({ pomodoro: 2 }),
      option({ pomodoro: 1, eisenhower: 1 }),
    ]);
    expect(totals).toEqual({
      pomodoro: 3,
      eisenhower: 1,
      pareto: 0,
      parkinsons: 0,
    });
  });

  it("returns all zeros for no answers", () => {
    expect(scoreAnswers([])).toEqual({
      pomodoro: 0,
      eisenhower: 0,
      pareto: 0,
      parkinsons: 0,
    });
  });
});

describe("pickTechnique", () => {
  it("picks the technique with the highest total score", () => {
    const answers = [
      option({ eisenhower: 2 }),
      option({ eisenhower: 2, pareto: 1 }),
      option({ pomodoro: 1 }),
    ];
    expect(pickTechnique(answers)).toBe("eisenhower");
  });

  it("breaks ties using a fixed priority order", () => {
    const answers = [option({ pomodoro: 2, parkinsons: 2 })];
    expect(pickTechnique(answers)).toBe("pomodoro");
  });

  it("defaults to pomodoro when there are no answers at all", () => {
    expect(pickTechnique([])).toBe("pomodoro");
  });
});
