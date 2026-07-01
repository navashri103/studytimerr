export function extractPlaylistId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const uriMatch = trimmed.match(/^spotify:playlist:([a-zA-Z0-9]+)$/);
  if (uriMatch) return uriMatch[1];

  const urlMatch = trimmed.match(/playlist\/([a-zA-Z0-9]+)/);
  if (urlMatch) return urlMatch[1];

  if (/^[a-zA-Z0-9]{10,30}$/.test(trimmed)) return trimmed;

  return null;
}

// Returns a clean https:// SoundCloud URL suitable for use in the embed,
// or null if the input doesn't look like a SoundCloud link.
export function extractSoundCloudUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Already a full URL
  if (trimmed.includes("soundcloud.com")) {
    try {
      const url = new URL(
        trimmed.startsWith("http") ? trimmed : `https://${trimmed}`,
      );
      if (url.hostname === "soundcloud.com" || url.hostname === "www.soundcloud.com") {
        return `https://soundcloud.com${url.pathname}`;
      }
    } catch {
      // fall through
    }
  }

  return null;
}
