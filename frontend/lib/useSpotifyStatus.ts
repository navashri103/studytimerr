"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";

type SpotifyStatus = {
  connected: boolean;
  premium: boolean;
  loading: boolean;
  refresh: () => void;
};

type Data = { connected: boolean; premium: boolean; loading: boolean };

const INITIAL: Data = { connected: false, premium: false, loading: true };
const DISCONNECTED: Data = { connected: false, premium: false, loading: false };

export function useSpotifyStatus(): SpotifyStatus {
  const { session, fetchWithAuth } = useAuth();
  const searchParams = useSearchParams();
  const [data, setData] = useState<Data>(INITIAL);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!session) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setData(DISCONNECTED);
      return;
    }
    let cancelled = false;
    fetchWithAuth<{ connected: boolean; premium: boolean }>("/spotify/status")
      .then((status) => {
        if (!cancelled) setData({ ...status, loading: false });
      })
      .catch(() => {
        if (!cancelled) setData(DISCONNECTED);
      });
    return () => {
      cancelled = true;
    };
  }, [session, fetchWithAuth, searchParams, tick]);

  return { ...data, refresh };
}
