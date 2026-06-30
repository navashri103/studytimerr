"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { ApiError, apiFetch } from "@/lib/api";

type Session = {
  accessToken: string;
  refreshToken: string;
  userId: string;
  email: string;
};

type SessionResponse = {
  access_token: string;
  refresh_token: string;
  user_id: string;
  email: string;
};

type SignupResult = { confirmEmail: true } | { confirmEmail: false; session: Session };

type AuthState = {
  session: Session | null;
  loading: boolean;
  signup: (email: string, password: string) => Promise<SignupResult>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchWithAuth: <T>(path: string, options?: RequestInit) => Promise<T>;
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

function toSession(result: SessionResponse): Session {
  return {
    accessToken: result.access_token,
    refreshToken: result.refresh_token,
    userId: result.user_id,
    email: result.email,
  };
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

  const logout = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setSession(null);
  }, []);

  const signup = useCallback(
    async (email: string, password: string): Promise<SignupResult> => {
      const result = await apiFetch<SessionResponse | { confirm_email: boolean }>(
        "/auth/signup",
        { method: "POST", body: JSON.stringify({ email, password }) },
      );
      if ("confirm_email" in result && result.confirm_email) {
        return { confirmEmail: true };
      }
      const session = toSession(result as SessionResponse);
      persist(session);
      return { confirmEmail: false, session };
    },
    [persist],
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await apiFetch<SessionResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      persist(toSession(result));
    },
    [persist],
  );

  const refreshSession = useCallback(async (): Promise<Session | null> => {
    if (!session) return null;
    try {
      const result = await apiFetch<SessionResponse>("/auth/refresh", {
        method: "POST",
        body: JSON.stringify({ refresh_token: session.refreshToken }),
      });
      const next = toSession(result);
      persist(next);
      return next;
    } catch {
      logout();
      return null;
    }
  }, [session, persist, logout]);

  const fetchWithAuth = useCallback(
    async <T,>(path: string, options: RequestInit = {}): Promise<T> => {
      if (!session) throw new ApiError(401, "Not authenticated");
      try {
        return await apiFetch<T>(path, { ...options, token: session.accessToken });
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          const refreshed = await refreshSession();
          if (!refreshed) throw err;
          return apiFetch<T>(path, { ...options, token: refreshed.accessToken });
        }
        throw err;
      }
    },
    [session, refreshSession],
  );

  return (
    <AuthContext.Provider
      value={{ session, loading, signup, login, logout, fetchWithAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
