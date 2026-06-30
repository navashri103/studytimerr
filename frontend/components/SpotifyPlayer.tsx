"use client";

import { useState } from "react";
import { Check, Music, Pencil, X } from "lucide-react";
import { extractPlaylistId } from "@/lib/spotify";

const DEFAULT_PLAYLIST_ID = "0oPyDVNdgcPFAWmOYSK7O1";
const STORAGE_KEY = "studytimer:playlist";

function readStoredPlaylistId(): string {
  if (typeof window === "undefined") return DEFAULT_PLAYLIST_ID;
  return window.localStorage.getItem(STORAGE_KEY) ?? DEFAULT_PLAYLIST_ID;
}

export function SpotifyPlayer() {
  const [open, setOpen] = useState(false);
  const [playlistId, setPlaylistId] = useState(readStoredPlaylistId);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  function saveDraft() {
    const id = extractPlaylistId(draft);
    if (!id) {
      setError("That doesn't look like a public playlist link.");
      return;
    }
    setPlaylistId(id);
    window.localStorage.setItem(STORAGE_KEY, id);
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
    <div className="fixed bottom-5 left-5 z-40 w-80 max-w-[calc(100vw-2.5rem)] overflow-hidden rounded-2xl bg-[#121212] shadow-2xl">
      <div className="flex items-center justify-between px-3 py-2">
        <span className="flex items-center gap-1.5 text-xs font-medium text-white/70">
          <Music className="size-3.5" />
          Study music
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setEditing((v) => !v);
              setError(null);
            }}
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

      {editing && (
        <div className="border-t border-white/10 bg-black/30 px-3 py-3">
          <p className="text-[11px] leading-relaxed text-white/60">
            Use your own playlist: open Spotify, go to your playlist, tap{" "}
            <strong className="text-white/80">••• &gt; Share &gt; Copy link to playlist</strong>
            , then paste it below. It must be set to public.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveDraft();
            }}
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

      <iframe
        title="Spotify playlist"
        src={`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator`}
        width="100%"
        height="152"
        style={{ border: 0 }}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      />
    </div>
  );
}
