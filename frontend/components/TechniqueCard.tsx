"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Technique } from "@/lib/techniques";

export function TechniqueCard({ technique }: { technique: Technique }) {
  const Icon = technique.icon;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Link
        href={technique.href}
        className="group flex h-full flex-col gap-5 rounded-2xl border border-black/5 bg-[#f7f4e8] p-6 shadow-sm transition-shadow duration-300 hover:shadow-lg"
      >
        <div
          className={`flex size-12 items-center justify-center rounded-xl ${technique.chipBg}`}
        >
          <Icon className={`size-6 ${technique.accent}`} strokeWidth={1.5} />
        </div>

        <div className="flex flex-1 flex-col gap-1.5">
          <h2 className="font-[family-name:var(--font-serif)] text-2xl text-[#1f231a]">
            {technique.name}
          </h2>
          <p className="text-sm leading-relaxed text-black/55">
            {technique.description}
          </p>
        </div>

        <span className="inline-flex items-center gap-1 self-start rounded-full bg-black/5 px-3 py-1 text-xs font-medium uppercase tracking-wide text-black/60 transition-colors group-hover:bg-[#b9872a] group-hover:text-white">
          Open
          <ArrowUpRight className="size-3.5" />
        </span>
      </Link>
    </motion.div>
  );
}
