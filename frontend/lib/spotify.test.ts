import { describe, expect, it } from "vitest";
import { extractPlaylistId } from "./spotify";

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
