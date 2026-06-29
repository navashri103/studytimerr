"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Cloud,
  Heart,
  Leaf,
  Moon,
  RotateCcw,
  Star,
  Sun,
  type LucideIcon,
} from "lucide-react";
import {
  createMemoryGame,
  flipCard,
  isComplete,
  resolveMismatch,
  type MemoryState,
} from "@/lib/memoryMatch";

const SYMBOL_ICON: Record<string, LucideIcon> = {
  sun: Sun,
  moon: Moon,
  star: Star,
  heart: Heart,
  cloud: Cloud,
  leaf: Leaf,
};

export function MemoryMatchGame() {
  const [state, setState] = useState<MemoryState>(() => createMemoryGame());

  useEffect(() => {
    if (state.flippedIds.length !== 2) return;
    const [a] = state.flippedIds;
    if (state.cards.find((c) => c.id === a)?.matched) return;
    const id = setTimeout(() => {
      setState((prev) => resolveMismatch(prev));
    }, 700);
    return () => clearTimeout(id);
  }, [state.flippedIds, state.cards]);

  const won = isComplete(state);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex w-full items-center justify-between text-xs uppercase tracking-widest text-black/45">
        <span>Moves: {state.moves}</span>
        <button
          type="button"
          onClick={() => setState(createMemoryGame())}
          className="inline-flex items-center gap-1.5 text-black/45 hover:text-black/75"
        >
          <RotateCcw className="size-3.5" />
          Restart
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {state.cards.map((card) => {
          const faceUp = card.matched || state.flippedIds.includes(card.id);
          const Icon = SYMBOL_ICON[card.symbol];
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => setState((prev) => flipCard(prev, card.id))}
              disabled={faceUp}
              className="relative size-14"
              style={{ perspective: 600 }}
            >
              <motion.div
                animate={{ rotateY: faceUp ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 rounded-xl bg-violet-700"
                style={{ backfaceVisibility: "hidden" }}
              />
              <motion.div
                animate={{ rotateY: faceUp ? 0 : -180 }}
                transition={{ duration: 0.3 }}
                className={`absolute inset-0 flex items-center justify-center rounded-xl border ${
                  card.matched
                    ? "border-violet-300 bg-violet-50"
                    : "border-black/10 bg-white"
                }`}
                style={{ backfaceVisibility: "hidden" }}
              >
                {Icon && <Icon className="size-6 text-violet-700" />}
              </motion.div>
            </button>
          );
        })}
      </div>

      {won && (
        <p className="text-sm font-medium text-violet-700">
          Solved in {state.moves} moves.
        </p>
      )}
    </div>
  );
}
