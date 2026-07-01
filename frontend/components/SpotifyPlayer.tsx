"use client";

import { useState } from "react";
import { Check, Music, Pencil, X } from "lucide-react";
import { extractPlaylistId, extractSoundCloudUrl } from "@/lib/spotify";

type Platform = "soundcloud" | "spotify";

// Default SoundCloud playlist — lofi/study audio, free, no video
const DEFAULT_SC_URL =
  "https://soundcloud.com/chillhopmusic/sets/chillhop-essentials-2023";
const DEFAULT_SPOTIFY_ID = "0oPyDVNdgcPFAWmOYSK7O1";

const STORAGE_KEYS: Record<Platform, string> = {
  soundcloud: "studytimer:sc-url",
  spotify: "studytimer:playlist",
};
const PLATFORM_STORAGE = "studytimer:music-platform";

function readStored(platform: Platform): string {
  if (typeof window === "undefined")
    return platform === "soundcloud" ? DEFAULT_SC_URL : DEFAULT_SPOTIFY_ID;
  return (
    window.localStorage.getItem(STORAGE_KEYS[platform]) ??
    (platform === "soundcloud" ? DEFAULT_SC_URL : DEFAULT_SPOTIFY_ID)
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

export function SpotifyPlayer() {
  const [open, setOpen] = useState(false);
  const [platform, setPlatform] = useState<Platform>(readPlatform);
  const [value, setValue] = useState(() => readStored(readPlatform()));
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  function switchPlatform(next: Platform) {
    window.localStorage.setItem(PLATFORM_STORAGE, next);
    setPlatform(next);
    setValue(readStored(next));
    setEditing(false);
    setError(null);
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
          <div className="flex rounded-full bg-white/10 p-0.5">
            {(["soundcloud", "spotify"] as Platform[]).map((p) => (
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
                {p === "soundcloud" ? "SoundCloud" : "Spotify"}
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
    </div>
  );
}
