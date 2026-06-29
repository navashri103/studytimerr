"use client";

import { useState } from "react";
import { MemoryMatchGame } from "@/components/MemoryMatchGame";
import { ReactionTimeGame } from "@/components/ReactionTimeGame";
import { WordScrambleGame } from "@/components/WordScrambleGame";

type GameKey = "memory" | "reaction" | "scramble";

const GAMES: { key: GameKey; label: string }[] = [
  { key: "memory", label: "Memory match" },
  { key: "reaction", label: "Reaction test" },
  { key: "scramble", label: "Word scramble" },
];

export function BreakGames() {
  const [active, setActive] = useState<GameKey>("memory");

  return (
    <div className="mt-8 w-full max-w-sm rounded-2xl border border-black/5 bg-[#f7f4e8] p-5">
      <p className="text-xs font-medium uppercase tracking-widest text-black/45">
        Play while you wait
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {GAMES.map((game) => (
          <button
            key={game.key}
            type="button"
            onClick={() => setActive(game.key)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              active === game.key
                ? "bg-black text-white"
                : "bg-black/5 text-black/55 hover:bg-black/10"
            }`}
          >
            {game.label}
          </button>
        ))}
      </div>

      <div className="mt-5 flex justify-center">
        {active === "memory" && <MemoryMatchGame />}
        {active === "reaction" && <ReactionTimeGame />}
        {active === "scramble" && <WordScrambleGame />}
      </div>
    </div>
  );
}
