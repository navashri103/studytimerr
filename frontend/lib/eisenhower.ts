export type Quadrant = "do" | "decide" | "delegate" | "delete";

export type Task = {
  id: string;
  text: string;
};

export type EisenhowerState = Record<Quadrant, Task[]>;

export const QUADRANT_META: Record<
  Quadrant,
  { label: string; subtitle: string }
> = {
  do: { label: "Do", subtitle: "Urgent and important" },
  decide: { label: "Decide", subtitle: "Important, not urgent" },
  delegate: { label: "Delegate", subtitle: "Urgent, not important" },
  delete: { label: "Delete", subtitle: "Neither urgent nor important" },
};

export function createInitialEisenhowerState(): EisenhowerState {
  return { do: [], decide: [], delegate: [], delete: [] };
}

export function addTask(
  state: EisenhowerState,
  quadrant: Quadrant,
  id: string,
  text: string,
): EisenhowerState {
  const trimmed = text.trim();
  if (!trimmed) return state;
  return {
    ...state,
    [quadrant]: [...state[quadrant], { id, text: trimmed }],
  };
}

export function editTask(
  state: EisenhowerState,
  quadrant: Quadrant,
  id: string,
  text: string,
): EisenhowerState {
  const trimmed = text.trim();
  if (!trimmed) return state;
  return {
    ...state,
    [quadrant]: state[quadrant].map((task) =>
      task.id === id ? { ...task, text: trimmed } : task,
    ),
  };
}

export function removeTask(
  state: EisenhowerState,
  quadrant: Quadrant,
  id: string,
): EisenhowerState {
  return {
    ...state,
    [quadrant]: state[quadrant].filter((task) => task.id !== id),
  };
}
