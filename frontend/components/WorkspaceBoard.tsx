"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Hourglass,
  LayoutGrid,
  Plus,
  Timer,
  X,
  type LucideIcon,
} from "lucide-react";
import { PomodoroTimer } from "@/components/PomodoroTimer";
import { EisenhowerBoard } from "@/components/EisenhowerBoard";
import { ParetoList } from "@/components/ParetoList";
import { ParkinsonsTimer } from "@/components/ParkinsonsTimer";

type WidgetType = "pomodoro" | "eisenhower" | "pareto" | "parkinsons";

const WIDGETS: {
  type: WidgetType;
  label: string;
  icon: LucideIcon;
  accent: string;
  render: () => React.ReactNode;
}[] = [
  {
    type: "pomodoro",
    label: "Pomodoro Technique",
    icon: Timer,
    accent: "text-orange-700",
    render: () => <PomodoroTimer />,
  },
  {
    type: "eisenhower",
    label: "Eisenhower Matrix",
    icon: LayoutGrid,
    accent: "text-sky-700",
    render: () => <EisenhowerBoard />,
  },
  {
    type: "pareto",
    label: "Pareto Analysis",
    icon: BarChart3,
    accent: "text-amber-700",
    render: () => <ParetoList />,
  },
  {
    type: "parkinsons",
    label: "Parkinson's Law",
    icon: Hourglass,
    accent: "text-violet-700",
    render: () => <ParkinsonsTimer />,
  },
];

export function WorkspaceBoard() {
  const [active, setActive] = useState<WidgetType[]>(["pomodoro"]);
  const [pickerOpen, setPickerOpen] = useState(false);

  const available = WIDGETS.filter((w) => !active.includes(w.type));

  function add(type: WidgetType) {
    setActive((prev) => [...prev, type]);
    setPickerOpen(false);
  }

  function remove(type: WidgetType) {
    setActive((prev) => prev.filter((t) => t !== type));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="relative flex justify-end">
        <button
          type="button"
          onClick={() => setPickerOpen((v) => !v)}
          disabled={available.length === 0}
          className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-black/80 disabled:opacity-40"
        >
          <Plus className="size-4" />
          Add widget
        </button>

        {pickerOpen && available.length > 0 && (
          <div className="absolute right-0 top-12 z-10 w-56 rounded-2xl border border-black/5 bg-white p-2 shadow-xl">
            {available.map((widget) => {
              const Icon = widget.icon;
              return (
                <button
                  key={widget.type}
                  type="button"
                  onClick={() => add(widget.type)}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-black/75 hover:bg-black/5"
                >
                  <Icon className={`size-4 ${widget.accent}`} />
                  {widget.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {active.length === 0 && (
        <p className="text-sm text-black/40">
          No widgets yet — add one to get started.
        </p>
      )}

      <div className="flex flex-col gap-6">
        <AnimatePresence>
          {active.map((type) => {
            const widget = WIDGETS.find((w) => w.type === type)!;
            const Icon = widget.icon;
            return (
              <motion.div
                key={type}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.2 }}
                className="rounded-2xl border border-black/5 bg-[#fdfcf8] p-6"
              >
                <div className="mb-5 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-medium text-black/70">
                    <Icon className={`size-4 ${widget.accent}`} />
                    {widget.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(type)}
                    aria-label={`Remove ${widget.label}`}
                    className="text-black/30 hover:text-black/60"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <div className="flex justify-center">{widget.render()}</div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
