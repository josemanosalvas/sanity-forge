import { describe, expect, it } from "vitest";

import { muxVideoToMarkdown } from "./markdown";
import {
  muxAspectRatio,
  muxPlaybackId,
  muxThumbnailSrcSet,
  muxThumbnailUrl,
} from "./mux";

describe("lib/mux", () => {
  const ready = {
    aspectRatio: "16:9",
    playbackId: "abc123",
    policy: "public",
    status: "ready",
  };

  it("muxPlaybackId returns the id for a ready public asset", () => {
    expect(muxPlaybackId(ready)).toBe("abc123");
  });

  it("muxPlaybackId withholds the id when the encode errored", () => {
    expect(muxPlaybackId({ ...ready, status: "errored" })).toBeNull();
  });

  it("muxPlaybackId returns the id while the asset is still preparing", () => {
    expect(muxPlaybackId({ ...ready, status: "preparing" })).toBe("abc123");
  });

  it("muxPlaybackId withholds a signed id", () => {
    expect(muxPlaybackId({ ...ready, policy: "signed" })).toBeNull();
  });

  it("muxPlaybackId withholds a drm id", () => {
    expect(muxPlaybackId({ ...ready, policy: "drm" })).toBeNull();
  });

  it("muxPlaybackId withholds an id with no policy", () => {
    expect(muxPlaybackId({ playbackId: "abc123", status: "ready" })).toBeNull();
  });

  it("muxPlaybackId handles a dangling asset reference", () => {
    expect(
      muxPlaybackId({
        aspectRatio: null,
        playbackId: null,
        policy: null,
        status: null,
        thumbTime: null,
        title: null,
      })
    ).toBeNull();
  });

  it("muxPlaybackId handles a missing video", () => {
    expect(muxPlaybackId(null)).toBeNull();
    expect(muxPlaybackId()).toBeNull();
  });

  it("muxAspectRatio converts Mux's colon form to CSS", () => {
    expect(muxAspectRatio({ aspectRatio: "16:9" })).toBe("16/9");
    expect(muxAspectRatio({ aspectRatio: "9:16" })).toBe("9/16");
  });

  it("muxAspectRatio falls back to 16/9 on an empty string", () => {
    expect(muxAspectRatio({ aspectRatio: "" })).toBe("16/9");
  });

  it("muxAspectRatio falls back to 16/9 when the ratio is missing", () => {
    expect(muxAspectRatio({})).toBe("16/9");
    expect(muxAspectRatio({ aspectRatio: null })).toBe("16/9");
    expect(muxAspectRatio(null)).toBe("16/9");
  });

  it("muxThumbnailUrl pins the frame when thumbTime is zero", () => {
    expect(muxThumbnailUrl("abc123", 0)).toBe(
      "https://image.mux.com/abc123/thumbnail.webp?time=0"
    );
  });

  it("muxThumbnailUrl omits the time when no frame was picked", () => {
    expect(muxThumbnailUrl("abc123")).toBe(
      "https://image.mux.com/abc123/thumbnail.webp"
    );
    expect(muxThumbnailUrl("abc123", null)).toBe(
      "https://image.mux.com/abc123/thumbnail.webp"
    );
  });

  it("muxThumbnailSrcSet lists one candidate per width with the frame pinned", () => {
    expect(muxThumbnailSrcSet("abc123", 4)).toBe(
      "https://image.mux.com/abc123/thumbnail.webp?time=4&width=640 640w, https://image.mux.com/abc123/thumbnail.webp?time=4&width=960 960w, https://image.mux.com/abc123/thumbnail.webp?time=4&width=1440 1440w, https://image.mux.com/abc123/thumbnail.webp?time=4&width=1920 1920w"
    );
    expect(muxThumbnailSrcSet(null)).toBeUndefined();
  });

  it("muxThumbnailUrl returns undefined without a playback id", () => {
    expect(muxThumbnailUrl(null)).toBeUndefined();
    expect(muxThumbnailUrl("")).toBeUndefined();
  });

  it("muxVideoToMarkdown renders the generated still", () => {
    expect(muxVideoToMarkdown({ ...ready, thumbTime: 12 }, "A demo")).toBe(
      "![A demo](https://image.mux.com/abc123/thumbnail.webp?time=12&width=1200)"
    );
  });

  it("muxVideoToMarkdown returns empty string without a usable id", () => {
    expect(muxVideoToMarkdown({ ...ready, policy: "signed" }, "A demo")).toBe(
      ""
    );
    expect(muxVideoToMarkdown({ ...ready, status: "errored" }, "A demo")).toBe(
      ""
    );
    expect(muxVideoToMarkdown(null)).toBe("");
  });
});
