"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function ExplanationBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-2xl border border-black/5 bg-[#f7f4e8] p-6">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 text-left"
      >
        <span className="font-[family-name:var(--font-serif)] text-xl text-[#1f231a]">
          {title}
        </span>
        <ChevronDown
          className={`size-5 shrink-0 text-black/40 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-black/60">
          {children}
        </div>
      )}
    </div>
  );
}
