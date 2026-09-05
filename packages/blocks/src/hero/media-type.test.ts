import { describe, expect, test } from "vitest";

import { rungFor } from "./hero-video";
import { isMuxPath, mediaTypeOf } from "./media-type";

describe("hero/media-type", () => {
  const READY_MUX = {
    aspectRatio: "16:9",
    playbackId: "abc123",
    policy: "public",
    status: "ready",
  };

  test("an explicit mediaType wins over what the variant carries", () => {
    expect(mediaTypeOf({ mediaType: "sanity", mux: READY_MUX })).toBe("sanity");
    expect(mediaTypeOf({ mediaType: "mux", mux: null })).toBe("mux");
  });

  // The field arrived after the documents did, so an absent value is the common
  // case. Inferring is what keeps every hero authored before the toggle alive.
  test("an absent mediaType is inferred from what is actually there", () => {
    expect(mediaTypeOf({ mux: READY_MUX })).toBe("mux");
    expect(mediaTypeOf({})).toBe("sanity");
    expect(mediaTypeOf(null)).toBe("sanity");
    expect(mediaTypeOf()).toBe("sanity");
  });

  // A signed or errored asset yields no playback id, so there is nothing for the
  // Mux path to render — inferring "mux" there would blank the hero.
  test("an unplayable Mux asset infers the file path, not Mux", () => {
    expect(mediaTypeOf({ mux: { ...READY_MUX, policy: "signed" } })).toBe(
      "sanity"
    );
    expect(mediaTypeOf({ mux: { ...READY_MUX, status: "errored" } })).toBe(
      "sanity"
    );
  });

  test("an unrecognised mediaType falls back to inference", () => {
    expect(mediaTypeOf({ mediaType: "cloudflare", mux: READY_MUX })).toBe(
      "mux"
    );
    expect(mediaTypeOf({ mediaType: "", mux: null })).toBe("sanity");
  });

  test("the progressive-MP4 path is recognised and counts as Mux", () => {
    expect(mediaTypeOf({ mediaType: "mux-mp4", mux: READY_MUX })).toBe(
      "mux-mp4"
    );
    expect(
      isMuxPath(mediaTypeOf({ mediaType: "mux-mp4", mux: READY_MUX }))
    ).toBeTruthy();
    expect(isMuxPath("mux")).toBeTruthy();
    expect(isMuxPath("sanity")).toBeFalsy();
  });

  // Nothing infers to mux-mp4: static renditions may not exist for an asset, so
  // it is only ever reached by an explicit choice.
  test("mux-mp4 is never inferred, only chosen", () => {
    expect(mediaTypeOf({ mux: READY_MUX })).toBe("mux");
    expect(mediaTypeOf({})).toBe("sanity");
  });

  // The rung follows the width; Save-Data and 2g both mean "not the big one"
  // whatever the screen says, while 3g and 4g are not thin enough to give up
  // resolution for.
  test.each([
    { rung: "1080p", width: 1440 },
    { rung: "1080p", width: 1280 },
    { rung: "720p", width: 390 },
    { connection: { saveData: true }, rung: "480p", width: 1440 },
    { connection: { effectiveType: "slow-2g" }, rung: "480p", width: 1440 },
    { connection: { effectiveType: "2g" }, rung: "480p", width: 1440 },
    { connection: { effectiveType: "4g" }, rung: "1080p", width: 1440 },
    { connection: { effectiveType: "3g" }, rung: "720p", width: 390 },
  ])(
    "a $width px viewport on $connection gets the $rung rung",
    ({ connection, rung, width }) => {
      expect(rungFor(width, connection)).toBe(rung);
    }
  );
});
