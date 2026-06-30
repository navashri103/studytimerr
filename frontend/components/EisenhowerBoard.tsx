"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Pencil, Plus, Save, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  QUADRANT_META,
  addTask,
  createInitialEisenhowerState,
  editTask,
  removeTask,
  toggleTaskCompleted,
  type EisenhowerState,
  type Quadrant,
  type Task,
} from "@/lib/eisenhower";

const QUADRANT_STYLE: Record<Quadrant, { chip: string; accent: string }> = {
  do: { chip: "bg-orange-100", accent: "text-orange-700" },
  decide: { chip: "bg-sky-100", accent: "text-sky-700" },
  delegate: { chip: "bg-violet-100", accent: "text-violet-700" },
  delete: { chip: "bg-zinc-200", accent: "text-zinc-600" },
};

const QUADRANT_ORDER: Quadrant[] = ["do", "decide", "delegate", "delete"];

type Mode = "edit" | "results";

type ApiTask = {
  id: string;
  quadrant: Quadrant;
  text: string;
  completed: boolean;
};

export function EisenhowerBoard() {
  const { session, fetchWithAuth } = useAuth();
  const [state, setState] = useState<EisenhowerState>(
    createInitialEisenhowerState,
  );
  const [mode, setMode] = useState<Mode>("edit");

  useEffect(() => {
    if (!session) return;
    fetchWithAuth<ApiTask[]>("/eisenhower-tasks")
      .then((tasks) => {
        setState((prev) => {
          const next = createInitialEisenhowerState();
          const knownIds = new Set(QUADRANT_ORDER.flatMap((q) => prev[q].map((t) => t.id)));
          for (const quadrant of QUADRANT_ORDER) {
            next[quadrant] = [...prev[quadrant]];
          }
          for (const task of tasks) {
            if (knownIds.has(task.id)) continue;
            next[task.quadrant].push({
              id: task.id,
              text: task.text,
              completed: task.completed,
            });
          }
          return next;
        });
      })
      .catch(() => {});
  }, [session, fetchWithAuth]);

  function addRemoteTask(quadrant: Quadrant, text: string) {
    if (!session) return;
    fetchWithAuth<ApiTask>("/eisenhower-tasks", {
      method: "POST",
      body: JSON.stringify({ quadrant, text }),
    })
      .then((task) => {
        setState((prev) => addTask(prev, quadrant, task.id, task.text));
      })
      .catch(() => {});
  }

  function editRemoteTask(quadrant: Quadrant, id: string, text: string) {
    if (!session) return;
    setState((prev) => editTask(prev, quadrant, id, text));
    fetchWithAuth(`/eisenhower-tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ text }),
    }).catch(() => {});
  }

  function toggleCompleted(quadrant: Quadrant, id: string) {
    if (!session) return;
    const task = state[quadrant].find((t) => t.id === id);
    if (!task) return;
    const nextCompleted = !task.completed;
    setState((prev) => toggleTaskCompleted(prev, quadrant, id));
    fetchWithAuth(`/eisenhower-tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ completed: nextCompleted }),
    }).catch(() => {});
    fetchWithAuth("/daily-stats/tasks-completed", {
      method: "POST",
      body: JSON.stringify({ delta: nextCompleted ? 1 : -1 }),
    }).catch(() => {});
  }

  function deleteRemoteTask(quadrant: Quadrant, id: string) {
    if (!session) return;
    setState((prev) => removeTask(prev, quadrant, id));
    fetchWithAuth(`/eisenhower-tasks/${id}`, {
      method: "DELETE",
    }).catch(() => {});
  }

  return (
    <AnimatePresence mode="wait">
      {mode === "edit" ? (
        <motion.div
          key="edit"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {QUADRANT_ORDER.map((quadrant) => (
              <QuadrantPanel
                key={quadrant}
                quadrant={quadrant}
                tasks={state[quadrant]}
                onAdd={(text) => addRemoteTask(quadrant, text)}
                onEdit={(id, text) => editRemoteTask(quadrant, id, text)}
                onToggleCompleted={(id) => toggleCompleted(quadrant, id)}
                onDelete={(id) => deleteRemoteTask(quadrant, id)}
              />
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => setMode("results")}
              className="inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-black/80"
            >
              <Save className="size-4" />
              Save
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="results"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-black/45">
              Click a task to mark it done.
            </p>
            <button
              type="button"
              onClick={() => setMode("edit")}
              className="inline-flex items-center gap-2 rounded-full bg-black/5 px-5 py-2.5 text-sm font-medium text-black/60 transition-colors hover:bg-black/10"
            >
              <Pencil className="size-3.5" />
              Edit board
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {QUADRANT_ORDER.map((quadrant) => (
              <ResultsPanel
                key={quadrant}
                quadrant={quadrant}
                tasks={state[quadrant]}
                onToggleCompleted={(id) => toggleCompleted(quadrant, id)}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function QuadrantPanel({
  quadrant,
  tasks,
  onAdd,
  onEdit,
  onToggleCompleted,
  onDelete,
}: {
  quadrant: Quadrant;
  tasks: Task[];
  onAdd: (text: string) => void;
  onEdit: (id: string, text: string) => void;
  onToggleCompleted: (id: string) => void;
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
                completed={task.completed}
                onSave={(text) => onEdit(task.id, text)}
                onToggleCompleted={() => onToggleCompleted(task.id)}
                onDelete={() => onDelete(task.id)}
              />
            </motion.li>
          ))}
        </AnimatePresence>
        {tasks.length === 0 && (
          <li className="text-sm text-black/35">No tasks yet.</li>
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
  completed,
  onSave,
  onToggleCompleted,
  onDelete,
}: {
  text: string;
  completed: boolean;
  onSave: (text: string) => void;
  onToggleCompleted: () => void;
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
    <div className="group flex items-center gap-2 rounded-lg bg-white/70 px-2.5 py-1.5">
      <button
        type="button"
        onClick={onToggleCompleted}
        aria-label={completed ? "Mark as not completed" : "Mark as completed"}
        className={`flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
          completed
            ? "border-black/60 bg-black/80 text-white"
            : "border-black/25 text-transparent"
        }`}
      >
        <Check className="size-3" />
      </button>
      <button
        type="button"
        onClick={() => setEditing(true)}
        className={`flex-1 truncate text-left text-sm ${
          completed ? "text-black/35 line-through" : "text-black/75"
        }`}
      >
        {text}
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="text-black/30 opacity-0 transition-opacity group-hover:opacity-100 hover:text-black/60"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}

function ResultsPanel({
  quadrant,
  tasks,
  onToggleCompleted,
}: {
  quadrant: Quadrant;
  tasks: Task[];
  onToggleCompleted: (id: string) => void;
}) {
  const meta = QUADRANT_META[quadrant];
  const style = QUADRANT_STYLE[quadrant];

  return (
    <div className="flex min-h-[220px] flex-col gap-4 rounded-2xl border border-black/5 bg-white p-5">
      <div>
        <span
          className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium uppercase tracking-wide ${style.chip} ${style.accent}`}
        >
          {meta.label}
        </span>
        <p className="mt-2 text-xs text-black/45">{meta.subtitle}</p>
      </div>

      <ul className="flex flex-1 flex-col gap-1.5">
        {tasks.map((task) => (
          <li key={task.id}>
            <button
              type="button"
              onClick={() => onToggleCompleted(task.id)}
              className={`block w-full truncate rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors ${
                task.completed
                  ? "text-black/35 line-through"
                  : "text-black/75 hover:bg-black/[0.03]"
              }`}
            >
              {task.text}
            </button>
          </li>
        ))}
        {tasks.length === 0 && (
          <li className="px-2.5 text-sm text-black/35">Nothing here.</li>
        )}
      </ul>
    </div>
  );
}
