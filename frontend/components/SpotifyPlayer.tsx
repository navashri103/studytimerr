"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Music, Pause, Pencil, Play, SkipBack, SkipForward, X } from "lucide-react";
import { extractPlaylistId, extractSoundCloudUrl } from "@/lib/spotify";
import { useAuth } from "@/lib/auth";
import { useSpotifyStatus } from "@/lib/useSpotifyStatus";
import { useSpotifyWebPlayer } from "@/lib/useSpotifyWebPlayer";

function formatMs(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

type Track = {
  uri: string;
  name: string;
  artists: { name: string }[];
  album: { images: { url: string }[] };
};

type Playlist = {
  uri: string;
  name: string;
  images: { url: string }[];
};

type Mode = "search" | "playlists" | "liked";
// This Spotify app is capped at 10 items per request, so we page with offset.
const PAGE_SIZE = 10;

function FullPlaybackPanel() {
  const { fetchWithAuth } = useAuth();
  const getToken = useCallback(
    () =>
      fetchWithAuth<{ access_token: string }>("/spotify/token", { method: "POST" }).then(
        (d) => d.access_token,
      ),
    [fetchWithAuth],
  );
  const player = useSpotifyWebPlayer(getToken);

  const [mode, setMode] = useState<Mode>("search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Track[]>([]);
  const [searchOffset, setSearchOffset] = useState(0);
  const [searchMore, setSearchMore] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [playlistOffset, setPlaylistOffset] = useState(0);
  const [playlistMore, setPlaylistMore] = useState(false);
  const [liked, setLiked] = useState<Track[]>([]);
  const [likedOffset, setLikedOffset] = useState(0);
  const [likedMore, setLikedMore] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const spotifyGet = useCallback(
    async (path: string) => {
      const token = await getToken();
      const res = await fetch(`https://api.spotify.com/v1/${path}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      return res.json();
    },
    [getToken],
  );

  const search = useCallback(
    async (offset: number) => {
      const q = query.trim();
      if (!q) return;
      setBusy(true);
      setActionError(null);
      try {
        const data = await spotifyGet(
          `search?q=${encodeURIComponent(q)}&type=track&limit=${PAGE_SIZE}&offset=${offset}`,
        );
        const items: Track[] = data.tracks?.items ?? [];
        setResults((prev) => (offset === 0 ? items : [...prev, ...items]));
        setSearchOffset(offset + items.length);
        setSearchMore(items.length === PAGE_SIZE);
      } catch {
        setActionError("Search failed. Try again.");
      } finally {
        setBusy(false);
      }
    },
    [query, spotifyGet],
  );

  const loadPlaylists = useCallback(
    async (offset: number) => {
      setBusy(true);
      setActionError(null);
      try {
        const data = await spotifyGet(`me/playlists?limit=${PAGE_SIZE}&offset=${offset}`);
        const items: Playlist[] = data.items ?? [];
        setPlaylists((prev) => (offset === 0 ? items : [...prev, ...items]));
        setPlaylistOffset(offset + items.length);
        setPlaylistMore(items.length === PAGE_SIZE);
      } catch {
        setActionError("Couldn't load your playlists.");
      } finally {
        setBusy(false);
      }
    },
    [spotifyGet],
  );

  const loadLiked = useCallback(
    async (offset: number) => {
      setBusy(true);
      setActionError(null);
      try {
        const data = await spotifyGet(`me/tracks?limit=${PAGE_SIZE}&offset=${offset}`);
        const items: Track[] = (data.items ?? []).map((it: { track: Track }) => it.track);
        setLiked((prev) => (offset === 0 ? items : [...prev, ...items]));
        setLikedOffset(offset + items.length);
        setLikedMore(items.length === PAGE_SIZE);
      } catch {
        setActionError("Couldn't load your liked songs.");
      } finally {
        setBusy(false);
      }
    },
    [spotifyGet],
  );

  const play = useCallback(
    async (body: object) => {
      if (!player.deviceId) return;
      setActionError(null);
      try {
        const token = await getToken();
        const res = await fetch(
          `https://api.spotify.com/v1/me/player/play?device_id=${player.deviceId}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          },
        );
        if (!res.ok && res.status !== 204) {
          setActionError("Couldn't play that. Close Spotify on other devices and retry.");
        }
      } catch {
        setActionError("Couldn't play that. Try again.");
      }
    },
    [player.deviceId, getToken],
  );

  // Queue a list of tracks starting at `index` so Next/Previous can move through it.
  const playTracks = (tracks: Track[], index: number) =>
    play({ uris: tracks.map((t) => t.uri), offset: { position: index } });
  // Play a whole playlist as context so Next/Previous walk the playlist.
  const playPlaylist = (uri: string) => play({ context_uri: uri });

  function switchMode(next: Mode) {
    setMode(next);
    setActionError(null);
    if (next === "playlists" && playlists.length === 0) loadPlaylists(0);
    if (next === "liked" && liked.length === 0) loadLiked(0);
  }

  if (player.status === "loading") {
    return <p className="px-3 py-4 text-center text-xs text-white/50">Connecting to Spotify…</p>;
  }
  if (player.status === "blocked") {
    return (
      <p className="px-3 py-4 text-center text-xs text-orange-400">
        Playback SDK blocked — check for an ad blocker, then reload.
      </p>
    );
  }
  if (player.status === "error") {
    return (
      <p className="px-3 py-4 text-center text-xs text-orange-400">
        {player.errorMessage ?? "Couldn't start Spotify playback."}
      </p>
    );
  }

  const progressPct = player.duration ? (player.position / player.duration) * 100 : 0;
  const MODES: { id: Mode; label: string }[] = [
    { id: "search", label: "Search" },
    { id: "playlists", label: "Playlists" },
    { id: "liked", label: "Liked" },
  ];

  return (
    <div className="flex flex-col gap-3 px-3 pb-3">
      {/* Mode switcher */}
      <div className="flex gap-1">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => switchMode(m.id)}
            className={`flex-1 rounded-full py-1 text-[10px] font-medium transition-colors ${
              mode === m.id ? "bg-white/15 text-white" : "text-white/45 hover:text-white"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {mode === "search" && (
        <form
          onSubmit={(e) => { e.preventDefault(); setResults([]); search(0); }}
          className="flex items-center gap-2"
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search any song or artist…"
            className="flex-1 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white outline-none placeholder:text-white/30 focus:border-white/30"
          />
          <button
            type="submit"
            disabled={busy}
            aria-label="Search"
            className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-black hover:bg-white/80 disabled:opacity-50"
          >
            <Play className="size-3.5" />
          </button>
        </form>
      )}

      {actionError && <p className="text-[11px] text-orange-400">{actionError}</p>}

      {/* Search results */}
      {mode === "search" && results.length > 0 && (
        <div className="max-h-48 overflow-y-auto rounded-lg bg-black/30">
          {results.map((t, i) => (
            <TrackRow key={`${t.uri}-${i}`} img={t.album?.images?.[0]?.url} title={t.name}
              subtitle={(t.artists ?? []).map((a) => a.name).join(", ")} onClick={() => playTracks(results, i)} />
          ))}
          {searchMore && (
            <LoadMore busy={busy} onClick={() => search(searchOffset)} />
          )}
        </div>
      )}

      {/* Playlists */}
      {mode === "playlists" && (
        <div className="max-h-48 overflow-y-auto rounded-lg bg-black/30">
          {playlists.length === 0 && !busy && (
            <p className="px-2 py-3 text-center text-[11px] text-white/40">No playlists found.</p>
          )}
          {playlists.map((p) => (
            <TrackRow key={p.uri} img={p.images?.[0]?.url} title={p.name} subtitle="Playlist"
              onClick={() => playPlaylist(p.uri)} />
          ))}
          {playlistMore && (
            <LoadMore busy={busy} onClick={() => loadPlaylists(playlistOffset)} />
          )}
        </div>
      )}

      {/* Liked songs */}
      {mode === "liked" && (
        <div className="max-h-48 overflow-y-auto rounded-lg bg-black/30">
          {liked.length === 0 && !busy && (
            <p className="px-2 py-3 text-center text-[11px] text-white/40">No liked songs found.</p>
          )}
          {liked.map((t, i) => (
            <TrackRow key={`${t.uri}-${i}`} img={t.album?.images?.[0]?.url} title={t.name}
              subtitle={(t.artists ?? []).map((a) => a.name).join(", ")} onClick={() => playTracks(liked, i)} />
          ))}
          {likedMore && (
            <LoadMore busy={busy} onClick={() => loadLiked(likedOffset)} />
          )}
        </div>
      )}

      {/* Now playing */}
      {player.track ? (
        <>
          <div className="flex items-center gap-3">
            {player.track.albumArt ? (
              <img src={player.track.albumArt} alt="" className="size-12 shrink-0 rounded-md object-cover" />
            ) : (
              <div className="size-12 shrink-0 rounded-md bg-white/10" />
            )}
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-white">{player.track.name}</p>
              <p className="truncate text-[11px] text-white/50">{player.track.artist}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] tabular-nums text-white/40">{formatMs(player.position)}</span>
            <div
              className="relative h-1 flex-1 cursor-pointer rounded-full bg-white/10"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const ratio = (e.clientX - rect.left) / rect.width;
                player.seek(Math.max(0, Math.min(1, ratio)) * player.duration);
              }}
            >
              <div className="absolute inset-y-0 left-0 rounded-full bg-white" style={{ width: `${progressPct}%` }} />
            </div>
            <span className="text-[10px] tabular-nums text-white/40">{formatMs(player.duration)}</span>
          </div>

          <div className="flex items-center justify-center gap-5">
            <button type="button" onClick={player.previousTrack} aria-label="Previous track" className="text-white/60 hover:text-white">
              <SkipBack className="size-4" />
            </button>
            <button type="button" onClick={player.togglePlay} aria-label={player.paused ? "Play" : "Pause"}
              className="flex size-8 items-center justify-center rounded-full bg-white text-black hover:bg-white/80">
              {player.paused ? <Play className="size-4" /> : <Pause className="size-4" />}
            </button>
            <button type="button" onClick={player.nextTrack} aria-label="Next track" className="text-white/60 hover:text-white">
              <SkipForward className="size-4" />
            </button>
          </div>
        </>
      ) : (
        <p className="py-2 text-center text-[11px] text-white/40">
          Pick a song, playlist, or liked track to start playing.
        </p>
      )}
    </div>
  );
}

function TrackRow({
  img,
  title,
  subtitle,
  onClick,
}: {
  img?: string;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2 px-2 py-1.5 text-left hover:bg-white/10"
    >
      {img ? (
        <img src={img} alt="" className="size-8 shrink-0 rounded" />
      ) : (
        <div className="size-8 shrink-0 rounded bg-white/10" />
      )}
      <div className="min-w-0">
        <p className="truncate text-[11px] font-medium text-white">{title}</p>
        <p className="truncate text-[10px] text-white/50">{subtitle}</p>
      </div>
    </button>
  );
}

function LoadMore({ busy, onClick }: { busy: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="w-full py-2 text-center text-[11px] font-medium text-white/70 hover:text-white disabled:opacity-50"
    >
      {busy ? "Loading…" : "Load more"}
    </button>
  );
}

type Platform = "soundcloud" | "spotify";

const DEFAULT_SPOTIFY_ID = "0oPyDVNdgcPFAWmOYSK7O1";
const DEFAULT_SC_URL = "https://soundcloud.com/dabootlegboy/sets/study-chill-lofi-hiphop";

const STORAGE_KEYS: Record<Platform, string> = {
  soundcloud: "studytimer:sc-url",
  spotify: "studytimer:playlist",
};
const PLATFORM_STORAGE = "studytimer:music-platform";

function readStored(platform: Platform): string {
  if (typeof window === "undefined")
    return platform === "spotify" ? DEFAULT_SPOTIFY_ID : DEFAULT_SC_URL;
  return (
    window.localStorage.getItem(STORAGE_KEYS[platform]) ??
    (platform === "spotify" ? DEFAULT_SPOTIFY_ID : DEFAULT_SC_URL)
  );
}

function readPlatform(): Platform {
  if (typeof window === "undefined") return "soundcloud";
  return (window.localStorage.getItem(PLATFORM_STORAGE) as Platform) ?? "soundcloud";
}

function buildEmbedUrl(platform: Platform, value: string): string {
  if (platform === "spotify")
    return `https://open.spotify.com/embed/playlist/${value}?utm_source=generator`;

  // SoundCloud compact audio embed — visual=false keeps it as a track list,
  // not the big artwork view, which fits our small 152px player perfectly.
  const encoded = encodeURIComponent(value);
  return `https://w.soundcloud.com/player/?url=${encoded}&color=%23121212&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=false`;
}

type Tab = Platform | "premium";

export function SpotifyPlayer() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>(readPlatform);
  const [platform, setPlatform] = useState<Platform>(readPlatform);
  const [value, setValue] = useState<string>(() => readStored(readPlatform()));
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { fetchWithAuth } = useAuth();
  const { connected, premium } = useSpotifyStatus();
  const panelRef = useRef<HTMLDivElement>(null);

  const isPremiumTab = tab === "premium";

  // Clicking anywhere outside the panel collapses it back to the icon. The
  // player stays mounted (hidden), so music keeps playing — only pausing stops
  // it. Note: clicks inside the SoundCloud/Spotify iframes never reach this
  // document, so they won't collapse the panel either.
  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  async function connectSpotify() {
    const { authorize_url } = await fetchWithAuth<{ authorize_url: string }>("/spotify/login");
    window.location.href = authorize_url;
  }

  function switchTab(next: Tab) {
    setTab(next);
    setEditing(false);
    setError(null);
    if (next !== "premium") {
      window.localStorage.setItem(PLATFORM_STORAGE, next);
      setPlatform(next);
      setValue(readStored(next));
    }
  }

  function saveDraft() {
    if (platform === "spotify") {
      const id = extractPlaylistId(draft);
      if (!id) { setError("That doesn't look like a Spotify playlist link."); return; }
      setValue(id);
      window.localStorage.setItem(STORAGE_KEYS.spotify, id);
    } else {
      const url = extractSoundCloudUrl(draft);
      if (!url) { setError("Paste the full soundcloud.com playlist link."); return; }
      setValue(url);
      window.localStorage.setItem(STORAGE_KEYS.soundcloud, url);
    }
    setEditing(false);
    setError(null);
    setDraft("");
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: "soundcloud", label: "SoundCloud" },
    { id: "spotify", label: "Spotify" },
    { id: "premium", label: "Premium" },
  ];

  return (
    <>
      {/* Collapsed launcher icon */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open music player"
          className="fixed bottom-5 left-5 z-40 flex size-12 items-center justify-center rounded-full bg-black text-white shadow-xl transition-colors hover:bg-black/80"
        >
          <Music className="size-5" />
        </button>
      )}

      {/* The panel stays mounted even when collapsed, so Spotify playback keeps
          going until you actually pause it. Pressing X (or clicking anywhere
          outside) only hides it (below). */}
      <div
        ref={panelRef}
        className={`fixed bottom-5 left-5 z-40 w-[320px] overflow-hidden rounded-2xl bg-[#121212] shadow-2xl ${
          open ? "" : "hidden"
        }`}
      >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-1.5">
          <Music className="size-3.5 text-white/60" />
          <div className="flex rounded-full bg-white/10 p-0.5">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => switchTab(t.id)}
                className={`rounded-full px-2 py-1 text-[10px] font-medium transition-colors ${
                  tab === t.id
                    ? "bg-white text-black"
                    : "text-white/55 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!isPremiumTab && (
            <button
              type="button"
              onClick={() => { setEditing((v) => !v); setError(null); }}
              aria-label="Use your own playlist"
              className="text-white/50 hover:text-white"
            >
              <Pencil className="size-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close music player"
            className="text-white/50 hover:text-white"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {/* Premium playback stays mounted whenever connected+premium, so music
          keeps playing when you switch tabs or collapse the panel. It's just
          hidden unless the Premium tab is active. */}
      {connected && premium && (
        <div className={isPremiumTab ? "" : "hidden"}>
          <FullPlaybackPanel />
        </div>
      )}

      {isPremiumTab ? (
        <>
          {!connected && (
            <div className="flex flex-col items-center gap-2 px-3 py-4">
              <button
                type="button"
                onClick={connectSpotify}
                className="rounded-full bg-[#1DB954] px-4 py-1.5 text-xs font-medium text-black hover:bg-[#1ed760]"
              >
                Connect Spotify Premium
              </button>
              <p className="text-center text-[10px] text-white/40">
                Play full tracks right here — needs a Spotify Premium account.
              </p>
            </div>
          )}
          {connected && !premium && (
            <p className="px-3 py-4 text-center text-[11px] leading-relaxed text-orange-400">
              Spotify Premium is required for in-app playback. Your account isn&apos;t Premium — use
              the SoundCloud or Spotify tabs instead.
            </p>
          )}
        </>
      ) : (
        <>
          {/* Platform label */}
          {platform === "soundcloud" && !editing && (
            <p className="px-3 pb-1 text-[10px] text-white/40">
              Audio only — no video, no ads, free
            </p>
          )}

          {/* Custom playlist input */}
          {editing && (
            <div className="border-t border-white/10 bg-black/30 px-3 py-3">
              {platform === "soundcloud" ? (
                <p className="text-[11px] leading-relaxed text-white/60">
                  Paste any public SoundCloud playlist link —{" "}
                  <strong className="text-white/80">
                    soundcloud.com → your playlist → Share → Copy link
                  </strong>
                </p>
              ) : (
                <p className="text-[11px] leading-relaxed text-white/60">
                  Open Spotify → your playlist →{" "}
                  <strong className="text-white/80">
                    ••• → Share → Copy link to playlist
                  </strong>
                  . Must be public.
                </p>
              )}
              <form
                onSubmit={(e) => { e.preventDefault(); saveDraft(); }}
                className="mt-2 flex items-center gap-2"
              >
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={
                    platform === "soundcloud"
                      ? "soundcloud.com/user/sets/playlist"
                      : "open.spotify.com/playlist/..."
                  }
                  className="flex-1 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white outline-none placeholder:text-white/30 focus:border-white/30"
                />
                <button
                  type="submit"
                  aria-label="Save playlist"
                  className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-black hover:bg-white/80"
                >
                  <Check className="size-3.5" />
                </button>
              </form>
              {error && <p className="mt-2 text-[11px] text-orange-400">{error}</p>}
            </div>
          )}

          {/* Embed */}
          <iframe
            key={`${platform}-${value}`}
            title={`${platform === "soundcloud" ? "SoundCloud" : "Spotify"} playlist`}
            src={buildEmbedUrl(platform, value)}
            width="100%"
            height="152"
            style={{ border: 0 }}
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        </>
      )}
      </div>
    </>
  );
}
