"use client";

import { useCallback, useEffect, useReducer } from "react";
import { motion } from "framer-motion";
import { Pause, Play, RotateCcw } from "lucide-react";
import {
  POMODORO_DURATIONS,
  SESSIONS_BEFORE_LONG_BREAK,
  createInitialPomodoroState,
  formatTime,
  pomodoroReducer,
  type PomodoroPhase,
} from "@/lib/pomodoro";

const PHASE_LABEL: Record<PomodoroPhase, string> = {
  focus: "Focus",
  shortBreak: "Short break",
  longBreak: "Long break",
};

const PHASE_COLOR: Record<PomodoroPhase, string> = {
  focus: "#c2622b",
  shortBreak: "#0d9488",
  longBreak: "#7c3aed",
};

const RADIUS = 88;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function PomodoroTimer() {
  const [state, dispatch] = useReducer(
    pomodoroReducer,
    undefined,
    createInitialPomodoroState,
  );

  useEffect(() => {
    if (!state.isRunning) return;
    const id = setInterval(() => dispatch({ type: "TICK" }), 1000);
    return () => clearInterval(id);
  }, [state.isRunning]);

  const toggle = useCallback(() => {
    dispatch({ type: state.isRunning ? "PAUSE" : "START" });
  }, [state.isRunning]);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.code !== "Space") return;
      if (event.target instanceof HTMLElement && event.target.tagName === "BUTTON") {
        return;
      }
      event.preventDefault();
      toggle();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [toggle]);

  const fraction = state.secondsLeft / POMODORO_DURATIONS[state.phase];
  const dashOffset = CIRCUMFERENCE * (1 - fraction);
  const color = PHASE_COLOR[state.phase];

  return (
    <div className="flex flex-col items-center gap-8">
      <p
        className="text-sm font-medium uppercase tracking-widest"
        style={{ color }}
      >
        {PHASE_LABEL[state.phase]}
      </p>

      <div className="relative size-64">
        <svg viewBox="0 0 200 200" className="size-full -rotate-90">
          <circle
            cx="100"
            cy="100"
            r={RADIUS}
            fill="none"
            stroke="#e9e6da"
            strokeWidth="12"
          />
          <motion.circle
            cx="100"
            cy="100"
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 0.4, ease: "linear" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-[family-name:var(--font-serif)] text-5xl text-[#1f231a]">
            {formatTime(state.secondsLeft)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {Array.from({ length: SESSIONS_BEFORE_LONG_BREAK }).map((_, i) => (
          <span
            key={i}
            className="size-2.5 rounded-full transition-colors"
            style={{
              backgroundColor:
                i < state.completedFocusSessions ? color : "#e9e6da",
            }}
          />
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-black/80"
        >
          {state.isRunning ? (
            <Pause className="size-4" />
          ) : (
            <Play className="size-4" />
          )}
          {state.isRunning ? "Pause" : "Start"}
        </button>
        <button
          onClick={() => dispatch({ type: "RESET" })}
          className="inline-flex items-center gap-2 rounded-full bg-black/5 px-5 py-3 text-sm font-medium text-black/60 transition-colors hover:bg-black/10"
        >
          <RotateCcw className="size-4" />
          Reset
        </button>
      </div>
    </div>
  );
}
