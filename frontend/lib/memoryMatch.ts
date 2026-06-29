export type MemoryCard = {
  id: number;
  symbol: string;
  matched: boolean;
};

export type MemoryState = {
  cards: MemoryCard[];
  flippedIds: number[];
  moves: number;
};

export const MEMORY_SYMBOLS = ["sun", "moon", "star", "heart", "cloud", "leaf"];

export function createMemoryGame(
  shuffle: <T>(items: T[]) => T[] = defaultShuffle,
): MemoryState {
  const deck = [...MEMORY_SYMBOLS, ...MEMORY_SYMBOLS].map((symbol, index) => ({
    id: index,
    symbol,
    matched: false,
  }));
  return { cards: shuffle(deck), flippedIds: [], moves: 0 };
}

export function isComplete(state: MemoryState): boolean {
  return state.cards.every((card) => card.matched);
}

export function flipCard(state: MemoryState, id: number): MemoryState {
  const card = state.cards.find((c) => c.id === id);
  if (!card || card.matched || state.flippedIds.includes(id)) return state;

  if (state.flippedIds.length === 2) {
    return flipCard({ ...state, flippedIds: [] }, id);
  }

  if (state.flippedIds.length === 0) {
    return { ...state, flippedIds: [id] };
  }

  const firstId = state.flippedIds[0];
  const firstCard = state.cards.find((c) => c.id === firstId)!;
  const moves = state.moves + 1;

  if (firstCard.symbol === card.symbol) {
    return {
      ...state,
      cards: state.cards.map((c) =>
        c.id === firstId || c.id === id ? { ...c, matched: true } : c,
      ),
      flippedIds: [],
      moves,
    };
  }

  return { ...state, flippedIds: [firstId, id], moves };
}

export function resolveMismatch(state: MemoryState): MemoryState {
  if (state.flippedIds.length !== 2) return state;
  const [a, b] = state.flippedIds;
  const aMatched = state.cards.find((c) => c.id === a)?.matched;
  const bMatched = state.cards.find((c) => c.id === b)?.matched;
  if (aMatched || bMatched) return state;
  return { ...state, flippedIds: [] };
}

function defaultShuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
