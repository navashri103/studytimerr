"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { Technique } from "@/lib/techniques";

export function TechniqueCard({ technique }: { technique: Technique }) {
  const Icon = technique.icon;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0 },
      }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Link
        href={technique.href}
        className={`group flex h-full flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-lg transition-colors duration-300 ${technique.glow}`}
      >
        <Icon className={`size-8 ${technique.accent}`} strokeWidth={1.5} />
        <div className="flex flex-1 flex-col gap-2">
          <h2 className="text-xl font-semibold text-zinc-50">{technique.name}</h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            {technique.description}
          </p>
        </div>
        <span
          className={`flex items-center gap-1 text-sm font-medium ${technique.accent} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
        >
          Open
          <ArrowRight className="size-4" />
        </span>
      </Link>
    </motion.div>
  );
}
