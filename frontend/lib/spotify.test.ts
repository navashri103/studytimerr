import { describe, expect, it } from "vitest";
import { extractPlaylistId, extractSoundCloudUrl } from "./spotify";

describe("extractPlaylistId", () => {
  it("extracts the id from a full share link with query params", () => {
    expect(
      extractPlaylistId(
        "https://open.spotify.com/playlist/0oPyDVNdgcPFAWmOYSK7O1?si=17584610a51e4754",
      ),
    ).toBe("0oPyDVNdgcPFAWmOYSK7O1");
  });

  it("extracts the id from a link without query params", () => {
    expect(
      extractPlaylistId("https://open.spotify.com/playlist/0oPyDVNdgcPFAWmOYSK7O1"),
    ).toBe("0oPyDVNdgcPFAWmOYSK7O1");
  });

  it("extracts the id from a spotify: URI", () => {
    expect(extractPlaylistId("spotify:playlist:0oPyDVNdgcPFAWmOYSK7O1")).toBe(
      "0oPyDVNdgcPFAWmOYSK7O1",
    );
  });

  it("accepts a bare playlist id", () => {
    expect(extractPlaylistId("0oPyDVNdgcPFAWmOYSK7O1")).toBe(
      "0oPyDVNdgcPFAWmOYSK7O1",
    );
  });

  it("trims surrounding whitespace", () => {
    expect(extractPlaylistId("  0oPyDVNdgcPFAWmOYSK7O1  ")).toBe(
      "0oPyDVNdgcPFAWmOYSK7O1",
    );
  });

  it("returns null for empty or unrecognized input", () => {
    expect(extractPlaylistId("")).toBeNull();
    expect(extractPlaylistId("not a link")).toBeNull();
    expect(extractPlaylistId("https://open.spotify.com/album/abc")).toBeNull();
  });
});

describe("extractSoundCloudUrl", () => {
  it("accepts a full soundcloud.com playlist URL", () => {
    expect(
      extractSoundCloudUrl("https://soundcloud.com/chillhopmusic/sets/chillhop-essentials"),
    ).toBe("https://soundcloud.com/chillhopmusic/sets/chillhop-essentials");
  });

  it("normalises a URL without the https:// prefix", () => {
    expect(
      extractSoundCloudUrl("soundcloud.com/chillhopmusic/sets/chillhop-essentials"),
    ).toBe("https://soundcloud.com/chillhopmusic/sets/chillhop-essentials");
  });

  it("strips query params and keeps only the path", () => {
    expect(
      extractSoundCloudUrl(
        "https://soundcloud.com/chillhopmusic/sets/chillhop-essentials?si=abc123",
      ),
    ).toBe("https://soundcloud.com/chillhopmusic/sets/chillhop-essentials");
  });

  it("returns null for empty or non-SoundCloud input", () => {
    expect(extractSoundCloudUrl("")).toBeNull();
    expect(extractSoundCloudUrl("https://open.spotify.com/playlist/abc")).toBeNull();
    expect(extractSoundCloudUrl("not a link")).toBeNull();
  });
});
