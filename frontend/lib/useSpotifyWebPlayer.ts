"use client";

import { useEffect, useRef, useState } from "react";

type SpotifyTrack = {
  name: string;
  artists: { name: string }[];
  album: { images: { url: string }[] };
};

type SpotifyPlaybackState = {
  paused: boolean;
  position: number;
  duration: number;
  track_window: { current_track: SpotifyTrack };
};

interface SpotifyPlayerInstance {
  connect(): Promise<boolean>;
  disconnect(): void;
  togglePlay(): Promise<void>;
  nextTrack(): Promise<void>;
  previousTrack(): Promise<void>;
  seek(positionMs: number): Promise<void>;
  addListener(event: "ready" | "not_ready", cb: (data: { device_id: string }) => void): void;
  addListener(
    event: "player_state_changed",
    cb: (state: SpotifyPlaybackState | null) => void,
  ): void;
  addListener(
    event: "initialization_error" | "authentication_error" | "account_error" | "playback_error",
    cb: (data: { message: string }) => void,
  ): void;
}

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: {
      Player: new (options: {
        name: string;
        getOAuthToken: (cb: (token: string) => void) => void;
        volume?: number;
      }) => SpotifyPlayerInstance;
    };
  }
}

const SDK_SCRIPT_ID = "spotify-web-playback-sdk";
const SDK_READY_TIMEOUT_MS = 5000;

export type WebPlayerState = {
  status: "loading" | "ready" | "blocked" | "error";
  errorMessage: string | null;
  deviceId: string | null;
  track: { name: string; artist: string; albumArt: string | null } | null;
  paused: boolean;
  position: number;
  duration: number;
  togglePlay: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  seek: (positionMs: number) => void;
};

export function useSpotifyWebPlayer(getAccessToken: () => Promise<string>): WebPlayerState {
  const playerRef = useRef<SpotifyPlayerInstance | null>(null);
  const [status, setStatus] = useState<WebPlayerState["status"]>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [track, setTrack] = useState<WebPlayerState["track"]>(null);
  const [paused, setPaused] = useState(true);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      if (!cancelled && status === "loading") {
        setStatus("blocked");
      }
    }, SDK_READY_TIMEOUT_MS);

    function initPlayer() {
      const player = new window.Spotify.Player({
        name: "StudyTimer",
        getOAuthToken: (cb) => {
          getAccessToken()
            .then(cb)
            .catch(() => setStatus("error"));
        },
      });

      player.addListener("ready", ({ device_id }) => {
        if (cancelled) return;
        window.clearTimeout(timeoutId);
        setDeviceId(device_id);
        setStatus("ready");
      });

      player.addListener("not_ready", () => {
        if (cancelled) return;
        setDeviceId(null);
      });

      player.addListener("player_state_changed", (state) => {
        if (cancelled || !state) return;
        const currentTrack = state.track_window.current_track;
        setTrack({
          name: currentTrack.name,
          artist: currentTrack.artists.map((a) => a.name).join(", "),
          albumArt: currentTrack.album?.images?.[0]?.url ?? null,
        });
        setPaused(state.paused);
        setPosition(state.position);
        setDuration(state.duration);
      });

      for (const event of [
        "initialization_error",
        "authentication_error",
        "account_error",
        "playback_error",
      ] as const) {
        player.addListener(event, ({ message }) => {
          if (cancelled) return;
          setErrorMessage(message);
          setStatus("error");
        });
      }

      player.connect();
      playerRef.current = player;
    }

    if (window.Spotify) {
      initPlayer();
    } else {
      window.onSpotifyWebPlaybackSDKReady = initPlayer;
      if (!document.getElementById(SDK_SCRIPT_ID)) {
        const script = document.createElement("script");
        script.id = SDK_SCRIPT_ID;
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;
        document.body.appendChild(script);
      }
    }

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      playerRef.current?.disconnect();
      playerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    status,
    errorMessage,
    deviceId,
    track,
    paused,
    position,
    duration,
    togglePlay: () => playerRef.current?.togglePlay(),
    nextTrack: () => playerRef.current?.nextTrack(),
    previousTrack: () => playerRef.current?.previousTrack(),
    seek: (positionMs: number) => playerRef.current?.seek(positionMs),
  };
}
