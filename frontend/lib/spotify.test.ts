import { describe, expect, it } from "vitest";
import { extractPlaylistId, extractYouTubePlaylistId } from "./spotify";

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

describe("extractYouTubePlaylistId", () => {
  it("extracts list param from a playlist URL", () => {
    expect(
      extractYouTubePlaylistId(
        "https://www.youtube.com/playlist?list=PLzH6n4zXuckquVnQ0KlMDxyT5YE-sA8Ps",
      ),
    ).toBe("PLzH6n4zXuckquVnQ0KlMDxyT5YE-sA8Ps");
  });

  it("extracts list param from a watch URL that includes a playlist", () => {
    expect(
      extractYouTubePlaylistId(
        "https://www.youtube.com/watch?v=jfKfPfyJRdk&list=PLzH6n4zXuckquVnQ0KlMDxyT5YE-sA8Ps",
      ),
    ).toBe("PLzH6n4zXuckquVnQ0KlMDxyT5YE-sA8Ps");
  });

  it("accepts a bare YouTube playlist ID", () => {
    expect(extractYouTubePlaylistId("PLzH6n4zXuckquVnQ0KlMDxyT5YE-sA8Ps")).toBe(
      "PLzH6n4zXuckquVnQ0KlMDxyT5YE-sA8Ps",
    );
  });

  it("returns null for empty or unrecognized input", () => {
    expect(extractYouTubePlaylistId("")).toBeNull();
    expect(extractYouTubePlaylistId("not a link")).toBeNull();
    expect(extractYouTubePlaylistId("https://open.spotify.com/playlist/abc")).toBeNull();
  });
});
