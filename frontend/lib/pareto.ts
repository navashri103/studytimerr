export type ParetoItem = {
  id: string;
  text: string;
  vital: boolean;
};

export type ParetoState = ParetoItem[];

export function createInitialParetoState(): ParetoState {
  return [];
}

export function addItem(
  state: ParetoState,
  id: string,
  text: string,
): ParetoState {
  const trimmed = text.trim();
  if (!trimmed) return state;
  return [...state, { id, text: trimmed, vital: false }];
}

export function toggleVital(state: ParetoState, id: string): ParetoState {
  return state.map((item) =>
    item.id === id ? { ...item, vital: !item.vital } : item,
  );
}

export function removeItem(state: ParetoState, id: string): ParetoState {
  return state.filter((item) => item.id !== id);
}

export type ParetoSplit = {
  total: number;
  vitalCount: number;
  trivialCount: number;
  vitalPercent: number;
};

export function getSplit(state: ParetoState): ParetoSplit {
  const total = state.length;
  const vitalCount = state.filter((item) => item.vital).length;
  const vitalPercent = total === 0 ? 0 : Math.round((vitalCount / total) * 100);
  return { total, vitalCount, trivialCount: total - vitalCount, vitalPercent };
}
