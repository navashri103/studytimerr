"use client";

import { useState } from "react";
import { Check, Music, Pencil, X } from "lucide-react";
import { extractPlaylistId, extractYouTubePlaylistId } from "@/lib/spotify";

type Platform = "spotify" | "youtube";

const DEFAULTS: Record<Platform, string> = {
  spotify: "0oPyDVNdgcPFAWmOYSK7O1",
  // Lofi Girl — beats to study/relax to (free, full tracks, no login needed)
  youtube: "PLzH6n4zXucko5QiSb3vxhR9RzQFQmOBjL",
};

const STORAGE_KEYS: Record<Platform, string> = {
  spotify: "studytimer:playlist",
  youtube: "studytimer:yt-playlist",
};

const PLATFORM_STORAGE = "studytimer:music-platform";

function readStored(platform: Platform): string {
  if (typeof window === "undefined") return DEFAULTS[platform];
  return window.localStorage.getItem(STORAGE_KEYS[platform]) ?? DEFAULTS[platform];
}

function readPlatform(): Platform {
  if (typeof window === "undefined") return "youtube";
  return (window.localStorage.getItem(PLATFORM_STORAGE) as Platform) ?? "youtube";
}

function embedUrl(platform: Platform, id: string): string {
  if (platform === "spotify")
    return `https://open.spotify.com/embed/playlist/${id}?utm_source=generator`;
  return `https://www.youtube.com/embed/videoseries?list=${id}&autoplay=0`;
}

export function SpotifyPlayer() {
  const [open, setOpen] = useState(false);
  const [platform, setPlatform] = useState<Platform>(readPlatform);
  const [playlistId, setPlaylistId] = useState(() => readStored(readPlatform()));
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  function switchPlatform(next: Platform) {
    window.localStorage.setItem(PLATFORM_STORAGE, next);
    setPlatform(next);
    setPlaylistId(readStored(next));
    setEditing(false);
    setError(null);
  }

  function saveDraft() {
    const id =
      platform === "spotify"
        ? extractPlaylistId(draft)
        : extractYouTubePlaylistId(draft);
    if (!id) {
      setError("That doesn't look like a valid playlist link.");
      return;
    }
    setPlaylistId(id);
    window.localStorage.setItem(STORAGE_KEYS[platform], id);
    setEditing(false);
    setError(null);
    setDraft("");
  }

  const PLATFORM_HINT: Record<Platform, string> = {
    spotify:
      'Open Spotify → your playlist → ••• → Share → "Copy link to playlist"',
    youtube:
      'Open YouTube → your playlist → Share → "Copy link" (or paste the full URL)',
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open music player"
        className="fixed bottom-5 left-5 z-40 flex size-12 items-center justify-center rounded-full bg-black text-white shadow-xl transition-colors hover:bg-black/80"
      >
        <Music className="size-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 left-5 z-40 w-[320px] overflow-hidden rounded-2xl bg-[#121212] shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-1.5">
          <Music className="size-3.5 text-white/60" />
          {/* Platform toggle */}
          <div className="flex rounded-full bg-white/10 p-0.5">
            {(["youtube", "spotify"] as Platform[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => switchPlatform(p)}
                className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors ${
                  platform === p
                    ? "bg-white text-black"
                    : "text-white/55 hover:text-white"
                }`}
              >
                {p === "youtube" ? "YouTube" : "Spotify"}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => { setEditing((v) => !v); setError(null); }}
            aria-label="Use your own playlist"
            className="text-white/50 hover:text-white"
          >
            <Pencil className="size-3.5" />
          </button>
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

      {/* Custom playlist input */}
      {editing && (
        <div className="border-t border-white/10 bg-black/30 px-3 py-3">
          <p className="text-[11px] leading-relaxed text-white/60">
            Paste your {platform === "youtube" ? "YouTube" : "Spotify"} playlist
            link:{" "}
            <strong className="text-white/80">{PLATFORM_HINT[platform]}</strong>.
            Must be set to public.
          </p>
          {platform === "youtube" && (
            <p className="mt-1 text-[10px] text-white/45">
              No ads, full tracks — no account needed.
            </p>
          )}
          <form
            onSubmit={(e) => { e.preventDefault(); saveDraft(); }}
            className="mt-2 flex items-center gap-2"
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Paste playlist link"
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
        key={`${platform}-${playlistId}`}
        title={`${platform} playlist`}
        src={embedUrl(platform, playlistId)}
        width="100%"
        height="152"
        style={{ border: 0 }}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      />
    </div>
  );
}
