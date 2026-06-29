"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { SiteHeader } from "@/components/SiteHeader";
import { TechniqueCard } from "@/components/TechniqueCard";
import { techniques } from "@/lib/techniques";

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.3 },
  },
};

export default function Home() {
  return (
    <PageShell>
      <SiteHeader />

      <nav className="mt-10 flex flex-wrap gap-x-8 gap-y-2 text-sm text-black/55">
        {techniques.map((technique) => (
          <Link
            key={technique.id}
            href={technique.href}
            className="transition-colors hover:text-black"
          >
            {technique.name}
          </Link>
        ))}
      </nav>

      <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="bg-gradient-to-b from-[#e3bd5c] to-[#a8761f] bg-clip-text pl-1 font-[family-name:var(--font-serif)] text-6xl italic leading-[1.15] text-transparent sm:text-7xl">
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
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-6 top-8 w-44 rounded-2xl border border-white/60 bg-white/50 p-4 shadow-lg backdrop-blur-md"
          >
            <p className="text-xs uppercase tracking-wide text-black/50">
              Technique
            </p>
            <p className="mt-1 font-[family-name:var(--font-serif)] text-xl text-[#1f231a]">
              Pomodoro
            </p>
            <p className="mt-1 text-xs text-black/50">25:00 focus session</p>
          </motion.div>

          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-8 right-6 w-40 rounded-2xl border border-white/60 bg-white/50 p-4 shadow-lg backdrop-blur-md"
          >
            <p className="text-xs uppercase tracking-wide text-black/50">
              Focus streak
            </p>
            <p className="mt-1 font-[family-name:var(--font-serif)] text-xl text-[#1f231a]">
              3 / 4
            </p>
            <p className="mt-1 text-xs text-black/50">sessions today</p>
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
