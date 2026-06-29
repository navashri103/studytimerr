"use client";

import { useEffect, useReducer } from "react";
import {
  createInitialReactionState,
  reactionReducer,
} from "@/lib/reactionTest";

const PHASE_COPY: Record<string, { label: string; bg: string }> = {
  idle: { label: "Click start, then click as soon as it turns green", bg: "bg-violet-100" },
  waiting: { label: "Wait for green...", bg: "bg-zinc-200" },
  ready: { label: "Click now!", bg: "bg-green-500" },
  tooSoon: { label: "Too soon — try again", bg: "bg-orange-200" },
  result: { label: "Click start to try again", bg: "bg-violet-100" },
};

export function ReactionTimeGame() {
  const [state, dispatch] = useReducer(
    reactionReducer,
    undefined,
    createInitialReactionState,
  );

  useEffect(() => {
    if (state.phase !== "waiting") return;
    const delay = 1000 + Math.random() * 2000;
    const id = setTimeout(() => {
      dispatch({ type: "BECOME_READY", readyAt: Date.now() });
    }, delay);
    return () => clearTimeout(id);
  }, [state.phase]);

  const copy = PHASE_COPY[state.phase];

  function handleClick() {
    if (state.phase === "idle" || state.phase === "tooSoon" || state.phase === "result") {
      dispatch({ type: "START_WAITING" });
      return;
    }
    dispatch({ type: "CLICK", clickedAt: Date.now() });
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        type="button"
        onClick={handleClick}
        className={`flex size-48 flex-col items-center justify-center rounded-2xl text-center text-sm font-medium text-black/70 transition-colors ${copy.bg}`}
      >
        {state.phase === "idle" || state.phase === "tooSoon" || state.phase === "result" ? (
          <span className="rounded-full bg-black px-5 py-2.5 text-white">
            {state.phase === "idle" ? "Start" : "Try again"}
          </span>
        ) : (
          <span className="px-6">{copy.label}</span>
        )}
      </button>

      {state.phase === "result" && state.lastResultMs !== null && (
        <p className="text-sm text-black/60">
          {state.lastResultMs} ms
          {state.bestMs !== null && (
            <span className="text-black/40"> · best {state.bestMs} ms</span>
          )}
        </p>
      )}
      {state.phase === "tooSoon" && (
        <p className="text-sm text-orange-700">
          You clicked before it turned green.
        </p>
      )}
    </div>
  );
}
