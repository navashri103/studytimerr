"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import {
  addItem,
  createInitialParetoState,
  removeItem,
  toggleVital,
  type ParetoItem,
  type ParetoState,
} from "@/lib/pareto";

export function ParetoList() {
  const [state, setState] = useState<ParetoState>(createInitialParetoState);
  const [draft, setDraft] = useState("");

  const vital = state.filter((item) => item.vital);
  const trivial = state.filter((item) => !item.vital);

  function submit() {
    if (!draft.trim()) return;
    setState((prev) => addItem(prev, crypto.randomUUID(), draft));
    setDraft("");
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="flex items-center gap-2"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a task or topic"
          className="flex-1 rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm text-black/80 outline-none placeholder:text-black/35 focus:border-black/25"
        />
        <button
          type="submit"
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-black text-white transition-colors hover:bg-black/80"
        >
          <Plus className="size-4" />
        </button>
      </form>

      <Section
        title="Vital few"
        subtitle="The ~20% that drives most of your results"
        chip="bg-amber-100"
        accent="text-amber-700"
        items={vital}
        emptyHint="Mark an item below as vital to move it here."
        moveIcon={<ArrowDown className="size-3.5" />}
        moveLabel="Move to trivial many"
        onMove={(id) =>
          setState((prev) => toggleVital(prev, id))
        }
        onRemove={(id) => setState((prev) => removeItem(prev, id))}
      />

      <Section
        title="Trivial many"
        subtitle="The rest — lower impact, lower priority"
        chip="bg-zinc-200"
        accent="text-zinc-600"
        items={trivial}
        emptyHint="Add a task or topic above to get started."
        moveIcon={<ArrowUp className="size-3.5" />}
        moveLabel="Move to vital few"
        onMove={(id) => setState((prev) => toggleVital(prev, id))}
        onRemove={(id) => setState((prev) => removeItem(prev, id))}
      />
    </div>
  );
}

function Section({
  title,
  subtitle,
  chip,
  accent,
  items,
  emptyHint,
  moveIcon,
  moveLabel,
  onMove,
  onRemove,
}: {
  title: string;
  subtitle: string;
  chip: string;
  accent: string;
  items: ParetoItem[];
  emptyHint: string;
  moveIcon: React.ReactNode;
  moveLabel: string;
  onMove: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-black/5 bg-[#f7f4e8] p-5">
      <span
        className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium uppercase tracking-wide ${chip} ${accent}`}
      >
        {title}
      </span>
      <p className="mt-2 text-xs text-black/45">{subtitle}</p>

      <ul className="mt-4 flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="group flex items-center gap-2 rounded-lg bg-white/70 px-2.5 py-1.5"
            >
              <span className="flex-1 truncate text-sm text-black/75">
                {item.text}
              </span>
              <button
                type="button"
                onClick={() => onMove(item.id)}
                aria-label={moveLabel}
                className="text-black/30 opacity-0 transition-opacity group-hover:opacity-100 hover:text-black/60"
              >
                {moveIcon}
              </button>
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                aria-label="Remove"
                className="text-black/30 opacity-0 transition-opacity group-hover:opacity-100 hover:text-black/60"
              >
                <X className="size-3.5" />
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
        {items.length === 0 && (
          <li className="px-2.5 text-sm text-black/35">{emptyHint}</li>
        )}
      </ul>
    </div>
  );
}
