"use client";

import { useCallback, useEffect, useReducer } from "react";
import { GripHorizontal, Pause, Play, SkipForward } from "lucide-react";
import type React from "react";

// WebkitAppRegion is Electron-specific — not in standard CSSProperties.
type ElectronStyle = React.CSSProperties & { WebkitAppRegion?: "drag" | "no-drag" };
import {
  POMODORO_DURATIONS,
  SESSIONS_BEFORE_LONG_BREAK,
  createInitialPomodoroState,
  formatTime,
  pomodoroReducer,
  type PomodoroPhase,
} from "@/lib/pomodoro";

const PHASE_COLOR: Record<PomodoroPhase, string> = {
  focus: "#c2622b",
  shortBreak: "#0d9488",
  longBreak: "#7c3aed",
};

const PHASE_LABEL: Record<PomodoroPhase, string> = {
  focus: "Focus",
  shortBreak: "Break",
  longBreak: "Long break",
};

declare global {
  interface Window {
    electron?: { closeOverlay: () => void; isOverlay: () => boolean };
  }
}

export function OverlayTimer() {
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

  const color = PHASE_COLOR[state.phase];
  const fraction = state.secondsLeft / POMODORO_DURATIONS[state.phase];

  function closeOverlay() {
    window.electron?.closeOverlay();
  }

  return (
    <div
      className="flex h-screen w-screen select-none flex-col items-center justify-center gap-2 rounded-2xl"
      style={{
        background: "rgba(18, 18, 18, 0.92)",
        backdropFilter: "blur(12px)",
        WebkitAppRegion: "drag",
      } as ElectronStyle}
    >
      {/* Drag handle + close */}
      <div
        className="flex w-full items-center justify-between px-3 pt-1"
        style={{ WebkitAppRegion: "drag" } as ElectronStyle}
      >
        <GripHorizontal className="size-3.5 text-white/30" />
        <button
          type="button"
          onClick={closeOverlay}
          className="text-white/30 hover:text-white/70"
          style={{ WebkitAppRegion: "no-drag" } as ElectronStyle}
        >
          ✕
        </button>
      </div>

      {/* Progress bar */}
      <div className="mx-4 h-1 w-full rounded-full bg-white/10">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${fraction * 100}%`, backgroundColor: color }}
        />
      </div>

      {/* Timer display */}
      <div className="flex flex-col items-center gap-0.5">
        <p className="text-[10px] font-medium uppercase tracking-widest" style={{ color }}>
          {PHASE_LABEL[state.phase]}
        </p>
        <p className="font-[family-name:var(--font-serif)] text-4xl text-white">
          {formatTime(state.secondsLeft)}
        </p>
      </div>

      {/* Session dots */}
      <div className="flex items-center gap-1.5">
        {Array.from({ length: SESSIONS_BEFORE_LONG_BREAK }).map((_, i) => (
          <span
            key={i}
            className="size-1.5 rounded-full"
            style={{
              backgroundColor: i < state.completedFocusSessions ? color : "rgba(255,255,255,0.2)",
            }}
          />
        ))}
      </div>

      {/* Controls */}
      <div
        className="flex items-center gap-2"
        style={{ WebkitAppRegion: "no-drag" } as ElectronStyle}
      >
        <button
          type="button"
          onClick={toggle}
          className="flex size-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
        >
          {state.isRunning ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: "SKIP" })}
          className="flex size-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
        >
          <SkipForward className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
