import { describe, expect, it } from "vitest";
import {
  buildHeatmap,
  computeStreak,
  sumSince,
  type DailyStat,
} from "./reportStats";

const TODAY = "2026-06-29";

function stat(date: string, focusMinutes: number, tasksCompleted = 0): DailyStat {
  return { date, focus_minutes: focusMinutes, tasks_completed: tasksCompleted };
}

describe("computeStreak", () => {
  it("is 0 with no history at all", () => {
    expect(computeStreak([], TODAY)).toBe(0);
  });

  it("counts today plus consecutive prior active days", () => {
    const stats = [
      stat("2026-06-27", 25),
      stat("2026-06-28", 30),
      stat(TODAY, 10),
    ];
    expect(computeStreak(stats, TODAY)).toBe(3);
  });

  it("does not break the streak just because today has no activity yet", () => {
    const stats = [stat("2026-06-27", 25), stat("2026-06-28", 30)];
    expect(computeStreak(stats, TODAY)).toBe(2);
  });

  it("stops at the first gap going backward", () => {
    const stats = [
      stat("2026-06-25", 25),
      // gap on 06-26
      stat("2026-06-27", 25),
      stat("2026-06-28", 25),
      stat(TODAY, 25),
    ];
    expect(computeStreak(stats, TODAY)).toBe(3);
  });

  it("a day with tasks completed but no focus minutes still counts as active", () => {
    const stats = [stat(TODAY, 0, 2)];
    expect(computeStreak(stats, TODAY)).toBe(1);
  });
});

describe("sumSince", () => {
  it("sums only days on or after the given date", () => {
    const stats = [
      stat("2026-06-20", 25, 1),
      stat("2026-06-28", 30, 2),
      stat(TODAY, 10, 1),
    ];
    expect(sumSince(stats, "2026-06-28")).toEqual({
      focusMinutes: 40,
      tasksCompleted: 3,
    });
  });

  it("returns zeros when nothing matches", () => {
    expect(sumSince([], "2026-06-28")).toEqual({
      focusMinutes: 0,
      tasksCompleted: 0,
    });
  });
});

describe("buildHeatmap", () => {
  it("returns the requested number of weeks, each with 7 days", () => {
    const grid = buildHeatmap([], TODAY, 4);
    expect(grid).toHaveLength(4);
    for (const week of grid) expect(week).toHaveLength(7);
  });

  it("the last day of the grid is today", () => {
    const grid = buildHeatmap([], TODAY, 2);
    const lastWeek = grid[grid.length - 1];
    expect(lastWeek[lastWeek.length - 1].date).toBe(TODAY);
  });

  it("assigns increasing levels as focus minutes increase", () => {
    const stats = [stat(TODAY, 0), stat("2026-06-28", 10), stat("2026-06-27", 200)];
    const grid = buildHeatmap(stats, TODAY, 1);
    const days = grid.flat();
    const byDate = new Map(days.map((d) => [d.date, d]));
    expect(byDate.get(TODAY)?.level).toBe(0);
    expect(byDate.get("2026-06-28")?.level).toBe(1);
    expect(byDate.get("2026-06-27")?.level).toBe(4);
  });
});
