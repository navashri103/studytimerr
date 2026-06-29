export type DailyStat = {
  date: string;
  focus_minutes: number;
  tasks_completed: number;
};

function addDays(isoDate: string, delta: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

function hasActivity(stat: DailyStat | undefined): boolean {
  return !!stat && (stat.focus_minutes > 0 || stat.tasks_completed > 0);
}

export function computeStreak(stats: DailyStat[], todayISO: string): number {
  const byDate = new Map(stats.map((s) => [s.date, s]));

  let cursor = hasActivity(byDate.get(todayISO))
    ? todayISO
    : addDays(todayISO, -1);

  let streak = 0;
  while (hasActivity(byDate.get(cursor))) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function sumSince(
  stats: DailyStat[],
  sinceISO: string,
): { focusMinutes: number; tasksCompleted: number } {
  let focusMinutes = 0;
  let tasksCompleted = 0;
  for (const s of stats) {
    if (s.date >= sinceISO) {
      focusMinutes += s.focus_minutes;
      tasksCompleted += s.tasks_completed;
    }
  }
  return { focusMinutes, tasksCompleted };
}

export type HeatmapDay = {
  date: string;
  focusMinutes: number;
  level: 0 | 1 | 2 | 3 | 4;
};

function levelFor(minutes: number): 0 | 1 | 2 | 3 | 4 {
  if (minutes <= 0) return 0;
  if (minutes < 25) return 1;
  if (minutes < 50) return 2;
  if (minutes < 100) return 3;
  return 4;
}

export function buildHeatmap(
  stats: DailyStat[],
  todayISO: string,
  weeks = 13,
): HeatmapDay[][] {
  const byDate = new Map(stats.map((s) => [s.date, s]));
  const totalDays = weeks * 7;

  const days: HeatmapDay[] = [];
  for (let i = totalDays - 1; i >= 0; i--) {
    const dateStr = addDays(todayISO, -i);
    const minutes = byDate.get(dateStr)?.focus_minutes ?? 0;
    days.push({ date: dateStr, focusMinutes: minutes, level: levelFor(minutes) });
  }

  const weekGrid: HeatmapDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weekGrid.push(days.slice(i, i + 7));
  }
  return weekGrid;
}
