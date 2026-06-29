"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Flame, TrendingUp, type LucideIcon } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { ReportHeatmap } from "@/components/ReportHeatmap";
import { SiteHeader } from "@/components/SiteHeader";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import {
  buildHeatmap,
  computeStreak,
  sumSince,
  type DailyStat,
} from "@/lib/reportStats";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export default function ReportPage() {
  const { session } = useAuth();
  const [history, setHistory] = useState<DailyStat[] | null>(null);

  useEffect(() => {
    if (!session) return;
    apiFetch<DailyStat[]>("/daily-stats/history", {
      token: session.accessToken,
    })
      .then(setHistory)
      .catch(() => setHistory([]));
  }, [session]);

  const today = todayISO();
  const streak = history ? computeStreak(history, today) : null;
  const week = history ? sumSince(history, isoDaysAgo(6)) : null;
  const month = history ? sumSince(history, isoDaysAgo(29)) : null;
  const heatmapWeeks = history ? buildHeatmap(history, today, 13) : null;

  return (
    <PageShell>
      <SiteHeader backLink />

      <h1 className="mt-10 font-[family-name:var(--font-serif)] text-4xl italic text-[#1f231a] sm:text-5xl">
        Report
      </h1>
      <p className="mt-2 max-w-lg text-sm text-black/55">
        How much you&apos;ve been studying, day by day.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard
          icon={Flame}
          chipBg="bg-amber-100"
          accent="text-amber-700"
          label="Day streak"
          value={streak === null ? "—" : `${streak}`}
          sub={streak === null ? undefined : streak === 1 ? "day" : "days"}
        />
        <StatCard
          icon={TrendingUp}
          chipBg="bg-sky-100"
          accent="text-sky-700"
          label="This week"
          value={week === null ? "—" : `${week.focusMinutes} min`}
          sub={week === null ? undefined : `${week.tasksCompleted} tasks`}
        />
        <StatCard
          icon={CalendarDays}
          chipBg="bg-violet-100"
          accent="text-violet-700"
          label="This month"
          value={month === null ? "—" : `${month.focusMinutes} min`}
          sub={month === null ? undefined : `${month.tasksCompleted} tasks`}
        />
      </div>

      <div className="mt-8 rounded-2xl border border-black/5 bg-[#f7f4e8] p-6">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-widest text-black/45">
            Last 13 weeks
          </p>
          <div className="flex items-center gap-1.5 text-[10px] text-black/40">
            <span>Less</span>
            <span className="size-2.5 rounded-sm bg-black/5" />
            <span className="size-2.5 rounded-sm bg-amber-200" />
            <span className="size-2.5 rounded-sm bg-amber-400" />
            <span className="size-2.5 rounded-sm bg-amber-600" />
            <span className="size-2.5 rounded-sm bg-amber-800" />
            <span>More</span>
          </div>
        </div>
        <div className="mt-4">
          {heatmapWeeks ? (
            <ReportHeatmap weeks={heatmapWeeks} />
          ) : (
            <div className="flex gap-1">
              {Array.from({ length: 13 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-1">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <div
                      key={j}
                      className="size-3 animate-pulse rounded-sm bg-black/5"
                    />
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}

function StatCard({
  icon: Icon,
  chipBg,
  accent,
  label,
  value,
  sub,
}: {
  icon: LucideIcon;
  chipBg: string;
  accent: string;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5">
      <div className={`flex size-9 items-center justify-center rounded-xl ${chipBg}`}>
        <Icon className={`size-[18px] ${accent}`} strokeWidth={1.5} />
      </div>
      <p className="mt-3 text-xs font-medium uppercase tracking-widest text-black/45">
        {label}
      </p>
      <p className="mt-1 font-[family-name:var(--font-serif)] text-3xl text-[#1f231a]">
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-black/45">{sub}</p>}
    </div>
  );
}
