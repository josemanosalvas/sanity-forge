import { describe, expect, test } from "vitest";

import { heroToMarkdown } from "../hero/markdown";
import { videoFeatureToMarkdown } from "./markdown";

const para = (text: string) => [
  {
    _type: "block",
    children: [{ _type: "span", text }],
    style: "normal",
  },
];

describe("video-feature/markdown", () => {
  const READY = { playbackId: "abc123", policy: "public", status: "ready" };

  test("videoFeatureToMarkdown returns empty string for a fully empty block", () => {
    expect(videoFeatureToMarkdown({}, {})).toBe("");
  });

  test("videoFeatureToMarkdown renders eyebrow, title, richText, and the still", () => {
    const result = videoFeatureToMarkdown(
      {
        eyebrow: "Watch",
        richText: para("Two minutes."),
        title: "The tour",
        video: { asset: READY },
      },
      {}
    );
    expect(result).toBe(
      "**Watch**\n\n## The tour\n\nTwo minutes.\n\n![The tour](https://image.mux.com/abc123/thumbnail.webp?width=1200)"
    );
  });

  test("videoFeatureToMarkdown prefers the caption as the still's alt text", () => {
    const result = videoFeatureToMarkdown(
      { caption: "Recorded live", title: "The tour", video: { asset: READY } },
      {}
    );
    expect(result).toContain("![Recorded live](");
  });

  test("videoFeatureToMarkdown omits the still when the encode failed", () => {
    const result = videoFeatureToMarkdown(
      {
        title: "The tour",
        video: {
          asset: { playbackId: "abc123", policy: "public", status: "errored" },
        },
      },
      {}
    );
    expect(result).toBe("## The tour");
  });

  test("videoFeatureToMarkdown gives the caption its own line when no still renders", () => {
    const result = videoFeatureToMarkdown(
      { caption: "Recorded live", title: "The tour" },
      {}
    );
    expect(result).toBe("## The tour\n\n_Recorded live_");
  });

  test("videoFeatureToMarkdown does not repeat the caption under the still", () => {
    const result = videoFeatureToMarkdown(
      { caption: "Recorded live", title: "The tour", video: { asset: READY } },
      {}
    );
    expect(result).not.toContain("_Recorded live_");
  });

  // Sanity stores "" for a field an editor typed into and then cleared.
  test("videoFeatureToMarkdown falls back to the title when the caption is empty", () => {
    const result = videoFeatureToMarkdown(
      { caption: "", title: "The tour", video: { asset: READY } },
      {}
    );
    expect(result).toContain("![The tour](");
  });

  test("videoFeatureToMarkdown still renders a preparing asset", () => {
    const result = videoFeatureToMarkdown(
      {
        title: "The tour",
        video: {
          asset: {
            playbackId: "abc123",
            policy: "public",
            status: "preparing",
          },
        },
      },
      {}
    );
    expect(result).toContain(
      "![The tour](https://image.mux.com/abc123/thumbnail.webp?width=1200)"
    );
  });

  test("videoFeatureToMarkdown leaks no JSX", () => {
    const result = videoFeatureToMarkdown(
      {
        caption: "Live",
        eyebrow: "Watch",
        title: "The tour",
        video: { asset: READY },
      },
      {}
    );
    expect(result).not.toMatch(/<[A-Za-z]/u);
  });

  test("heroToMarkdown falls back to the Mux still when no poster is set", () => {
    const result = heroToMarkdown(
      { title: "Hero", video: { light: { mux: READY } } },
      {}
    );
    expect(result).toContain(
      "![Hero](https://image.mux.com/abc123/thumbnail.webp?width=1200)"
    );
  });

  test("videoFeatureToMarkdown posters from the editor's chosen frame", () => {
    const result = videoFeatureToMarkdown(
      { title: "The tour", video: { asset: { ...READY, thumbTime: 12.5 } } },
      {}
    );
    expect(result).toContain(
      "https://image.mux.com/abc123/thumbnail.webp?time=12.5&width=1200"
    );
  });
});
