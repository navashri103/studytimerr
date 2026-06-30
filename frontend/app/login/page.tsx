"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        const result = await signup(email, password);
        if (result.confirmEmail) {
          setAwaitingConfirmation(true);
        }
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (awaitingConfirmation) {
    return (
      <main className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-[2rem] bg-[#fdfcf8] p-8 shadow-2xl shadow-black/15 text-center">
          <h1 className="font-[family-name:var(--font-serif)] text-3xl text-[#1f231a]">
            Check your email
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-black/55">
            We sent a confirmation link to{" "}
            <strong className="text-black/80">{email}</strong>. Click it to
            verify your account, then come back here to log in.
          </p>
          <button
            type="button"
            onClick={() => {
              setAwaitingConfirmation(false);
              setMode("login");
              setPassword("");
            }}
            className="mt-6 text-xs font-medium uppercase tracking-widest text-black/40 hover:text-black/70"
          >
            Go to log in
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-[2rem] bg-[#fdfcf8] p-8 shadow-2xl shadow-black/15">
        <h1 className="font-[family-name:var(--font-serif)] text-3xl text-[#1f231a]">
          StudyTimer
        </h1>
        <p className="mt-2 text-sm text-black/55">
          {mode === "login"
            ? "Log in to pick up where you left off."
            : "Create an account to save your progress."}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm text-black/80 outline-none placeholder:text-black/35 focus:border-black/25"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm text-black/80 outline-none placeholder:text-black/35 focus:border-black/25"
          />
          {mode === "signup" && (
            <p className="px-1 text-xs text-black/40">Use at least 6 characters.</p>
          )}

          {error && <p className="text-sm text-orange-700">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-full bg-black px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-black/80 disabled:opacity-50"
          >
            {submitting
              ? "Please wait..."
              : mode === "login"
                ? "Log in"
                : "Sign up"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setError(null);
          }}
          className="mt-4 text-xs font-medium uppercase tracking-widest text-black/40 hover:text-black/70"
        >
          {mode === "login"
            ? "Need an account? Sign up"
            : "Already have an account? Log in"}
        </button>
      </div>
    </main>
  );
}
