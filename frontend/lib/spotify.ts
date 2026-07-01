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

export function extractYouTubePlaylistId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Full URL with list param: youtube.com/playlist?list=PLxxx or watch?v=X&list=PLxxx
  const listParam = trimmed.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  if (listParam) return listParam[1];

  // Bare playlist ID — YouTube playlist IDs start with PL, RD, UU, FL, etc.
  if (/^[A-Z]{2}[a-zA-Z0-9_-]{16,}$/.test(trimmed)) return trimmed;

  return null;
}
