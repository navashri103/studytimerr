"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { apiFetch } from "@/lib/api";

type Session = {
  accessToken: string;
  refreshToken: string;
  userId: string;
  email: string;
};

type AuthState = {
  session: Session | null;
  loading: boolean;
  signup: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const STORAGE_KEY = "studytimer:session";

const AuthContext = createContext<AuthState | null>(null);

function readStoredSession(): Session | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(() =>
    typeof window === "undefined" ? null : readStoredSession(),
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Marks hydration complete so the server-rendered (session-less) markup
    // and the client's first paint agree before AuthGate makes a redirect
    // decision based on localStorage.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(false);
  }, []);

  const persist = useCallback((next: Session) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSession(next);
  }, []);

  const signup = useCallback(
    async (email: string, password: string) => {
      const result = await apiFetch<{
        access_token: string;
        refresh_token: string;
        user_id: string;
        email: string;
      }>("/auth/signup", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      persist({
        accessToken: result.access_token,
        refreshToken: result.refresh_token,
        userId: result.user_id,
        email: result.email,
      });
    },
    [persist],
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await apiFetch<{
        access_token: string;
        refresh_token: string;
        user_id: string;
        email: string;
      }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      persist({
        accessToken: result.access_token,
        refreshToken: result.refresh_token,
        userId: result.user_id,
        email: result.email,
      });
    },
    [persist],
  );

  const logout = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
