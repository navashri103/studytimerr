"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, RotateCcw, Sparkles } from "lucide-react";
import {
  QUIZ_QUESTIONS,
  pickTechnique,
  type QuizOption,
} from "@/lib/techniqueQuiz";
import { techniques } from "@/lib/techniques";

export function TechniqueQuiz() {
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<QuizOption[]>([]);

  const step = answers.length;
  const done = step >= QUIZ_QUESTIONS.length;
  const result = done ? techniques.find((t) => t.id === pickTechnique(answers)) : null;

  function reset() {
    setAnswers([]);
    setStarted(false);
  }

  if (!started) {
    return (
      <button
        type="button"
        onClick={() => setStarted(true)}
        className="flex w-full items-center justify-between rounded-2xl border border-black/5 bg-[#f7f4e8] px-6 py-4 text-left transition-colors hover:bg-[#f1edd9]"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-black/70">
          <Sparkles className="size-4 text-[#a8761f]" />
          Not sure which technique to use? Take a 30-second quiz.
        </span>
        <ArrowRight className="size-4 text-black/40" />
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-black/5 bg-[#f7f4e8] p-6">
      <AnimatePresence mode="wait">
        {!done ? (
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-xs font-medium uppercase tracking-widest text-black/40">
              Question {step + 1} of {QUIZ_QUESTIONS.length}
            </p>
            <p className="mt-2 font-[family-name:var(--font-serif)] text-xl text-[#1f231a]">
              {QUIZ_QUESTIONS[step].question}
            </p>
            <div className="mt-4 flex flex-col gap-2">
              {QUIZ_QUESTIONS[step].options.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setAnswers((prev) => [...prev, option])}
                  className="rounded-xl border border-black/10 bg-white px-4 py-2.5 text-left text-sm text-black/75 transition-colors hover:border-black/25"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-xs font-medium uppercase tracking-widest text-black/40">
                Try this one
              </p>
              <p className="mt-2 font-[family-name:var(--font-serif)] text-2xl italic text-[#1f231a]">
                {result.name}
              </p>
              <p className="mt-1 text-sm text-black/55">{result.description}</p>
              <div className="mt-4 flex items-center gap-3">
                <Link
                  href={result.href}
                  className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-black/80"
                >
                  Open {result.name}
                  <ArrowRight className="size-4" />
                </Link>
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-black/40 hover:text-black/70"
                >
                  <RotateCcw className="size-3.5" />
                  Try again
                </button>
              </div>
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  );
}
