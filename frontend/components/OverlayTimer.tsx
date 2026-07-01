"use client";

import { useCallback, useEffect, useReducer, useState } from "react";
import { Pause, Play, SkipForward, X } from "lucide-react";
import type React from "react";

type ElectronStyle = React.CSSProperties & { WebkitAppRegion?: "drag" | "no-drag" };

import {
  POMODORO_DURATIONS,
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
    electron?: { closeOverlay: () => void };
  }
}

export function OverlayTimer() {
  const [expanded, setExpanded] = useState(false);
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

  if (!expanded) {
    // ── Collapsed: small floating icon ───────────────────────────
    return (
      <div
        className="flex h-screen w-screen items-center justify-center"
        style={{ background: "transparent" } as ElectronStyle}
      >
        <button
          type="button"
          onClick={() => setExpanded(true)}
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "rgba(18,18,18,0.92)",
            border: `3px solid ${color}`,
            backdropFilter: "blur(12px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: `0 4px 20px rgba(0,0,0,0.4)`,
            WebkitAppRegion: "drag",
          } as ElectronStyle}
        >
          <span
            style={{
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: 1,
              color,
              textTransform: "uppercase",
              WebkitAppRegion: "no-drag",
            } as ElectronStyle}
          >
            {PHASE_LABEL[state.phase]}
          </span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "white",
              fontVariantNumeric: "tabular-nums",
              WebkitAppRegion: "no-drag",
            } as ElectronStyle}
          >
            {formatTime(state.secondsLeft)}
          </span>
        </button>
      </div>
    );
  }

  // ── Expanded: compact timer strip ─────────────────────────────
  const fraction = state.secondsLeft / POMODORO_DURATIONS[state.phase];

  return (
    <div
      className="flex h-screen w-screen flex-col"
      style={{ background: "transparent" } as ElectronStyle}
    >
      <div
        style={{
          background: "rgba(18,18,18,0.93)",
          backdropFilter: "blur(16px)",
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          padding: "10px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          WebkitAppRegion: "drag",
        } as ElectronStyle}
      >
        {/* Progress bar + phase label + close */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            WebkitAppRegion: "no-drag",
          } as ElectronStyle}
        >
          <span style={{ fontSize: 10, color, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>
            {PHASE_LABEL[state.phase]}
          </span>
          <div style={{ flex: 1, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.1)" }}>
            <div style={{ width: `${fraction * 100}%`, height: "100%", borderRadius: 2, background: color, transition: "width 0.4s linear" }} />
          </div>
          <button
            type="button"
            onClick={() => setExpanded(false)}
            style={{ color: "rgba(255,255,255,0.4)", background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 1 }}
          >
            <X size={13} />
          </button>
        </div>

        {/* Time + controls */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            WebkitAppRegion: "no-drag",
          } as ElectronStyle}
        >
          <span style={{ fontSize: 28, fontWeight: 700, color: "white", fontVariantNumeric: "tabular-nums", letterSpacing: -1 }}>
            {formatTime(state.secondsLeft)}
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              type="button"
              onClick={toggle}
              style={{
                width: 32, height: 32, borderRadius: "50%",
                background: "white", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              {state.isRunning ? <Pause size={14} color="#111" /> : <Play size={14} color="#111" />}
            </button>
            <button
              type="button"
              onClick={() => dispatch({ type: "SKIP" })}
              style={{
                width: 32, height: 32, borderRadius: "50%",
                background: "rgba(255,255,255,0.1)", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <SkipForward size={14} color="white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
