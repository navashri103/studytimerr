"use client";

import { useEffect, useState } from "react";
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
        <StatCard label="Day streak" value={streak === null ? "—" : `${streak}`} />
        <StatCard
          label="This week"
          value={week === null ? "—" : `${week.focusMinutes} min`}
          sub={week === null ? undefined : `${week.tasksCompleted} tasks`}
        />
        <StatCard
          label="This month"
          value={month === null ? "—" : `${month.focusMinutes} min`}
          sub={month === null ? undefined : `${month.tasksCompleted} tasks`}
        />
      </div>

      <div className="mt-8 rounded-2xl border border-black/5 bg-[#f7f4e8] p-6">
        <p className="text-xs font-medium uppercase tracking-widest text-black/45">
          Last 13 weeks
        </p>
        <div className="mt-4">
          {heatmapWeeks ? (
            <ReportHeatmap weeks={heatmapWeeks} />
          ) : (
            <p className="text-sm text-black/40">Loading...</p>
          )}
        </div>
      </div>
    </PageShell>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-widest text-black/45">
        {label}
      </p>
      <p className="mt-1 font-[family-name:var(--font-serif)] text-3xl text-[#1f231a]">
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-black/45">{sub}</p>}
    </div>
  );
}
