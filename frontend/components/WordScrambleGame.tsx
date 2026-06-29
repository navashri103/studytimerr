"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { isCorrectGuess, pickWord, scrambleWord } from "@/lib/wordScramble";

function newRound() {
  const word = pickWord();
  return { word, scrambled: scrambleWord(word) };
}

export function WordScrambleGame() {
  const [{ word, scrambled }, setRound] = useState(newRound);
  const [guess, setGuess] = useState("");
  const [status, setStatus] = useState<"playing" | "solved" | "wrong">(
    "playing",
  );
  const [revealed, setRevealed] = useState(false);

  function submit() {
    if (!guess.trim()) return;
    if (isCorrectGuess(word, guess)) {
      setStatus("solved");
    } else {
      setStatus("wrong");
    }
  }

  function next() {
    setRound(newRound());
    setGuess("");
    setStatus("playing");
    setRevealed(false);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-2">
        <p className="font-[family-name:var(--font-serif)] text-3xl tracking-widest text-violet-700">
          {revealed ? word : scrambled}
        </p>
        <button
          type="button"
          onClick={next}
          aria-label="New word"
          className="text-black/30 hover:text-black/60"
        >
          <RotateCcw className="size-4" />
        </button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="flex items-center gap-2"
      >
        <input
          value={guess}
          onChange={(e) => {
            setGuess(e.target.value);
            setStatus("playing");
          }}
          placeholder="Unscramble it"
          disabled={status === "solved"}
          className="w-44 rounded-full border border-black/10 bg-white px-4 py-2 text-center text-sm text-black/80 outline-none placeholder:text-black/35 focus:border-black/25"
        />
        <button
          type="submit"
          disabled={status === "solved"}
          className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-black/80 disabled:opacity-40"
        >
          Guess
        </button>
      </form>

      {status === "solved" && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm font-medium text-violet-700">Correct!</p>
          <button
            type="button"
            onClick={next}
            className="rounded-full bg-black/5 px-4 py-1.5 text-xs font-medium text-black/60 hover:bg-black/10"
          >
            Next word
          </button>
        </div>
      )}
      {status === "wrong" && (
        <p className="text-sm text-orange-700">Not quite — try again.</p>
      )}
      {status === "playing" && !revealed && (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="text-xs font-medium uppercase tracking-widest text-black/35 hover:text-black/60"
        >
          Reveal answer
        </button>
      )}
    </div>
  );
}
