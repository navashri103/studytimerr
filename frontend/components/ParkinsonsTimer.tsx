"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Pause, Play, RotateCcw } from "lucide-react";
import { formatTime } from "@/lib/pomodoro";
import { useAuth } from "@/lib/auth";
import {
  createInitialParkinsonsState,
  parkinsonsReducer,
} from "@/lib/parkinsons";

const COLOR = "#7c3aed";
const WARNING_SECONDS = 5;
const SOUND_SRC = "/timer-microwave.mp3";
const RADIUS = 88;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ParkinsonsTimer() {
  const { session, fetchWithAuth } = useAuth();
  const [state, dispatch] = useReducer(
    parkinsonsReducer,
    undefined,
    createInitialParkinsonsState,
  );
  const prevSecondsLeft = useRef(0);

  useEffect(() => {
    if (!state.isRunning) return;
    const id = setInterval(() => dispatch({ type: "TICK" }), 1000);
    return () => clearInterval(id);
  }, [state.isRunning]);

  useEffect(() => {
    if (!state.isRunning || state.secondsLeft !== WARNING_SECONDS) return;
    new Audio(SOUND_SRC).play().catch(() => {});
  }, [state.isRunning, state.secondsLeft]);

  useEffect(() => {
    if (
      state.isSetup &&
      state.secondsLeft === 0 &&
      prevSecondsLeft.current > 0 &&
      session
    ) {
      fetchWithAuth("/daily-stats/focus-minutes", {
        method: "POST",
        body: JSON.stringify({ minutes: Math.round(state.totalSeconds / 60) }),
      }).catch(() => {});
    }
    prevSecondsLeft.current = state.secondsLeft;
  }, [state.secondsLeft, state.isSetup, state.totalSeconds, session, fetchWithAuth]);

  if (!state.isSetup) {
    return <SetupForm onSetup={(taskName, totalSeconds) => dispatch({ type: "SETUP", taskName, totalSeconds })} />;
  }

  const fraction = state.secondsLeft / state.totalSeconds;
  const dashOffset = CIRCUMFERENCE * (1 - fraction);
  const timeIsUp = state.secondsLeft === 0;

  return (
    <div className="flex flex-col items-center gap-8">
      <p className="max-w-xs text-center text-sm font-medium uppercase tracking-widest text-violet-700">
        {state.taskName}
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
            stroke={COLOR}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 0.4, ease: "linear" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-[family-name:var(--font-serif)] text-5xl text-[#1f231a]">
            {timeIsUp ? "Time's up" : formatTime(state.secondsLeft)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() =>
            dispatch({ type: state.isRunning ? "PAUSE" : "START" })
          }
          disabled={timeIsUp}
          className="inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {state.isRunning ? (
            <Pause className="size-4" />
          ) : (
            <Play className="size-4" />
          )}
          {state.isRunning ? "Pause" : "Start"}
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: "RESET" })}
          className="inline-flex items-center gap-2 rounded-full bg-black/5 px-5 py-3 text-sm font-medium text-black/60 transition-colors hover:bg-black/10"
        >
          <RotateCcw className="size-4" />
          Reset
        </button>
      </div>

      <button
        type="button"
        onClick={() => dispatch({ type: "NEW_TASK" })}
        className="text-xs font-medium uppercase tracking-widest text-black/40 hover:text-black/70"
      >
        New task
      </button>
    </div>
  );
}

function SetupForm({
  onSetup,
}: {
  onSetup: (taskName: string, totalSeconds: number) => void;
}) {
  const [taskName, setTaskName] = useState("");
  const [minutes, setMinutes] = useState(20);

  const submit = useCallback(() => {
    if (!taskName.trim() || minutes <= 0) return;
    onSetup(taskName, minutes * 60);
  }, [taskName, minutes, onSetup]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="flex w-full max-w-sm flex-col gap-5"
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="task-name" className="text-xs font-medium uppercase tracking-widest text-black/45">
          What are you working on?
        </label>
        <input
          id="task-name"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          placeholder="e.g. Outline the essay"
          className="rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm text-black/80 outline-none placeholder:text-black/35 focus:border-black/25"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="task-minutes" className="text-xs font-medium uppercase tracking-widest text-black/45">
          Give yourself this many minutes
        </label>
        <input
          id="task-minutes"
          type="number"
          min={1}
          value={minutes}
          onChange={(e) => setMinutes(Number(e.target.value))}
          className="rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm text-black/80 outline-none focus:border-black/25"
        />
        <p className="text-xs text-black/40">
          Pick something shorter than you think you need — that&apos;s the
          point.
        </p>
      </div>

      <button
        type="submit"
        className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-black/80"
      >
        Start the deadline
      </button>
    </form>
  );
}
