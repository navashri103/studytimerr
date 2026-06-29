"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import {
  QUADRANT_META,
  addTask,
  createInitialEisenhowerState,
  editTask,
  removeTask,
  type EisenhowerState,
  type Quadrant,
} from "@/lib/eisenhower";

const QUADRANT_STYLE: Record<Quadrant, { chip: string; accent: string }> = {
  do: { chip: "bg-orange-100", accent: "text-orange-700" },
  decide: { chip: "bg-sky-100", accent: "text-sky-700" },
  delegate: { chip: "bg-violet-100", accent: "text-violet-700" },
  delete: { chip: "bg-zinc-200", accent: "text-zinc-600" },
};

const QUADRANT_ORDER: Quadrant[] = ["do", "decide", "delegate", "delete"];

export function EisenhowerBoard() {
  const [state, setState] = useState<EisenhowerState>(
    createInitialEisenhowerState,
  );

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      {QUADRANT_ORDER.map((quadrant) => (
        <QuadrantPanel
          key={quadrant}
          quadrant={quadrant}
          tasks={state[quadrant]}
          onAdd={(text) =>
            setState((prev) =>
              addTask(prev, quadrant, crypto.randomUUID(), text),
            )
          }
          onEdit={(id, text) =>
            setState((prev) => editTask(prev, quadrant, id, text))
          }
          onDelete={(id) =>
            setState((prev) => removeTask(prev, quadrant, id))
          }
        />
      ))}
    </div>
  );
}

function QuadrantPanel({
  quadrant,
  tasks,
  onAdd,
  onEdit,
  onDelete,
}: {
  quadrant: Quadrant;
  tasks: { id: string; text: string }[];
  onAdd: (text: string) => void;
  onEdit: (id: string, text: string) => void;
  onDelete: (id: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const meta = QUADRANT_META[quadrant];
  const style = QUADRANT_STYLE[quadrant];

  function submit() {
    if (!draft.trim()) return;
    onAdd(draft);
    setDraft("");
  }

  return (
    <div className="flex min-h-[260px] flex-col gap-4 rounded-2xl border border-black/5 bg-[#f7f4e8] p-5">
      <div>
        <span
          className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium uppercase tracking-wide ${style.chip} ${style.accent}`}
        >
          {meta.label}
        </span>
        <p className="mt-2 text-xs text-black/45">{meta.subtitle}</p>
      </div>

      <ul className="flex flex-1 flex-col gap-2">
        <AnimatePresence initial={false}>
          {tasks.map((task) => (
            <motion.li
              key={task.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <TaskRow
                text={task.text}
                onSave={(text) => onEdit(task.id, text)}
                onDelete={() => onDelete(task.id)}
              />
            </motion.li>
          ))}
        </AnimatePresence>
        {tasks.length === 0 && (
          <p className="text-sm text-black/35">No tasks yet.</p>
        )}
      </ul>

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
          placeholder="Add a task"
          className="flex-1 rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm text-black/80 outline-none placeholder:text-black/35 focus:border-black/25"
        />
        <button
          type="submit"
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-black text-white transition-colors hover:bg-black/80"
        >
          <Plus className="size-4" />
        </button>
      </form>
    </div>
  );
}

function TaskRow({
  text,
  onSave,
  onDelete,
}: {
  text: string;
  onSave: (text: string) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(text);

  function commit() {
    if (value.trim()) onSave(value);
    else setValue(text);
    setEditing(false);
  }

  if (editing) {
    return (
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") {
            setValue(text);
            setEditing(false);
          }
        }}
        className="w-full rounded-lg border border-black/15 bg-white px-2.5 py-1.5 text-sm text-black/80 outline-none"
      />
    );
  }

  return (
    <div className="group flex items-center justify-between gap-2 rounded-lg bg-white/70 px-2.5 py-1.5">
      <button
        onClick={() => setEditing(true)}
        className="flex-1 truncate text-left text-sm text-black/75"
      >
        {text}
      </button>
      <button
        onClick={onDelete}
        className="text-black/30 opacity-0 transition-opacity group-hover:opacity-100 hover:text-black/60"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
