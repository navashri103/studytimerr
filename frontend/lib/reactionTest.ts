export type ReactionPhase = "idle" | "waiting" | "ready" | "tooSoon" | "result";

export type ReactionState = {
  phase: ReactionPhase;
  readyAt: number | null;
  lastResultMs: number | null;
  bestMs: number | null;
};

export function createInitialReactionState(): ReactionState {
  return { phase: "idle", readyAt: null, lastResultMs: null, bestMs: null };
}

export type ReactionAction =
  | { type: "START_WAITING" }
  | { type: "BECOME_READY"; readyAt: number }
  | { type: "CLICK"; clickedAt: number }
  | { type: "RESET" };

export function reactionReducer(
  state: ReactionState,
  action: ReactionAction,
): ReactionState {
  switch (action.type) {
    case "START_WAITING":
      return { ...state, phase: "waiting", readyAt: null, lastResultMs: null };
    case "BECOME_READY":
      if (state.phase !== "waiting") return state;
      return { ...state, phase: "ready", readyAt: action.readyAt };
    case "CLICK": {
      if (state.phase === "waiting") {
        return { ...state, phase: "tooSoon" };
      }
      if (state.phase === "ready" && state.readyAt !== null) {
        const ms = action.clickedAt - state.readyAt;
        const bestMs = state.bestMs === null ? ms : Math.min(state.bestMs, ms);
        return { ...state, phase: "result", lastResultMs: ms, bestMs };
      }
      return state;
    }
    case "RESET":
      return { ...createInitialReactionState(), bestMs: state.bestMs };
    default:
      return state;
  }
}
