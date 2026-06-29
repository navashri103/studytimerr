import type { HeatmapDay } from "@/lib/reportStats";

const LEVEL_COLOR: Record<HeatmapDay["level"], string> = {
  0: "bg-black/5",
  1: "bg-amber-200",
  2: "bg-amber-400",
  3: "bg-amber-600",
  4: "bg-amber-800",
};

export function ReportHeatmap({ weeks }: { weeks: HeatmapDay[][] }) {
  return (
    <div className="flex gap-1 overflow-x-auto pb-2">
      {weeks.map((week, i) => (
        <div key={i} className="flex flex-col gap-1">
          {week.map((day) => (
            <div
              key={day.date}
              title={`${day.date}: ${day.focusMinutes} min`}
              className={`size-3 rounded-sm ${LEVEL_COLOR[day.level]}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
