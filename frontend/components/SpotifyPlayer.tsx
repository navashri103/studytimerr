"use client";

import { useState } from "react";
import { Music, X } from "lucide-react";

const PLAYLIST_ID = "0oPyDVNdgcPFAWmOYSK7O1";

export function SpotifyPlayer() {
  const [open, setOpen] = useState(false);

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
      <div className="flex items-center justify-between px-3 py-2">
        <span className="flex items-center gap-1.5 text-xs font-medium text-white/70">
          <Music className="size-3.5" />
          Study music
        </span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close music player"
          className="text-white/50 hover:text-white"
        >
          <X className="size-4" />
        </button>
      </div>
      <iframe
        title="Spotify playlist"
        src={`https://open.spotify.com/embed/playlist/${PLAYLIST_ID}?utm_source=generator`}
        width="100%"
        height="152"
        style={{ border: 0 }}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      />
    </div>
  );
}
