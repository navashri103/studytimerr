"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { SiteHeader } from "@/components/SiteHeader";
import { TechniqueCard } from "@/components/TechniqueCard";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { techniques } from "@/lib/techniques";

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.3 },
  },
};

type DailyStats = {
  date: string;
  focus_minutes: number;
  tasks_completed: number;
};

export default function Home() {
  const { session } = useAuth();
  const [stats, setStats] = useState<DailyStats | null>(null);

  useEffect(() => {
    if (!session) return;
    apiFetch<DailyStats>("/daily-stats/today", { token: session.accessToken })
      .then(setStats)
      .catch(() => setStats(null));
  }, [session]);

  return (
    <PageShell>
      <SiteHeader large />

      <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="pl-1 font-[family-name:var(--font-serif)] text-5xl font-semibold italic leading-[1.15] text-[#a8761f] sm:text-6xl">
            Just focus
            <br />
            on your time.
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-black/55">
            Four time-management methods, each with its own page. Pick one,
            learn how it works, and use it to run your next study session.
          </p>
          <Link
            href="/pomodoro"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-black/80"
          >
            Start a session
            <ArrowUpRight className="size-4" />
          </Link>
        </motion.div>

        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-gradient-to-br from-orange-100 via-sky-100 to-violet-100">
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="flex size-40 items-center justify-center rounded-full border-2 border-black/30"
            >
              <div className="flex size-28 items-center justify-center rounded-full border border-black/20 bg-black/5">
                <Clock className="size-10 text-black/70" strokeWidth={1.5} />
              </div>
            </motion.div>
          </div>

          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-6 top-8 w-44 rounded-2xl border border-white/60 bg-white/50 p-4 shadow-lg backdrop-blur-md"
          >
            <p className="text-xs uppercase tracking-wide text-black/50">
              Today
            </p>
            <p className="mt-1 font-[family-name:var(--font-serif)] text-xl text-[#1f231a]">
              {stats ? `${stats.focus_minutes} min` : "—"}
            </p>
            <p className="mt-1 text-xs text-black/50">focused</p>
          </motion.div>

          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-8 right-6 w-40 rounded-2xl border border-white/60 bg-white/50 p-4 shadow-lg backdrop-blur-md"
          >
            <p className="text-xs uppercase tracking-wide text-black/50">
              Today
            </p>
            <p className="mt-1 font-[family-name:var(--font-serif)] text-xl text-[#1f231a]">
              {stats ? stats.tasks_completed : "—"}
            </p>
            <p className="mt-1 text-xs text-black/50">tasks completed</p>
          </motion.div>
        </div>
      </div>

      <div className="mt-16 flex items-center gap-4">
        <span className="font-[family-name:var(--font-serif)] text-xl italic text-[#b9872a]">
          Choose your method
        </span>
        <span className="h-px flex-1 bg-[#b9872a]/25" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mt-8 grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {techniques.map((technique) => (
          <TechniqueCard key={technique.id} technique={technique} />
        ))}
      </motion.div>
    </PageShell>
  );
}
