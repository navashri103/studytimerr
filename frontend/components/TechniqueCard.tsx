"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Technique } from "@/lib/techniques";

export function TechniqueCard({
  technique,
  offset = false,
}: {
  technique: Technique;
  offset?: boolean;
}) {
  const Icon = technique.icon;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0 },
      }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={offset ? "sm:mt-10" : ""}
    >
      <Link
        href={technique.href}
        className={`group relative flex h-full flex-col gap-5 border border-black/10 bg-[#faf9f6] p-7 transition-colors duration-300 ${technique.border}`}
      >
        <div className="flex items-start justify-between">
          <span className="font-mono text-xs tracking-widest text-black/40">
            {technique.index}
          </span>
          <Icon className={`size-6 ${technique.accent}`} strokeWidth={1.5} />
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold uppercase tracking-tight text-[#14130f]">
            {technique.name}
          </h2>
          <p className="text-sm leading-relaxed text-black/55">
            {technique.description}
          </p>
        </div>

        <span
          className={`flex items-center gap-1 text-xs font-medium uppercase tracking-widest ${technique.accent}`}
        >
          Open
          <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </Link>
    </motion.div>
  );
}
