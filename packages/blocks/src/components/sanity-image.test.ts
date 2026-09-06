import { describe, expect, test } from "vitest";

import { resolveAssetId, svgUrlFromAssetId } from "./sanity-image";

describe("internal/sanity-image", () => {
  test("resolveAssetId returns the id for a valid canonical asset id", () => {
    const id = "image-abc123def456-1200x630-png";
    expect(resolveAssetId({ id })).toBe(id);
  });

  test("resolveAssetId normalizes a stray drafts. prefix to canonical form", () => {
    expect(resolveAssetId({ id: "drafts.image-abc123-200x80-png" })).toBe(
      "image-abc123-200x80-png"
    );
  });

  test("resolveAssetId returns null without an image", () => {
    expect(resolveAssetId()).toBeNull();
  });

  test.each([null, {}, { id: undefined }, { id: null }, { id: "" }])(
    "resolveAssetId returns null for %o",
    (image) => {
      expect(resolveAssetId(image)).toBeNull();
    }
  );

  test("resolveAssetId returns null for malformed ids", () => {
    expect(resolveAssetId({ id: "image-abc" })).toBeNull();
    expect(resolveAssetId({ id: "not-an-image" })).toBeNull();
    expect(resolveAssetId({ id: "image-abc123-200-png" })).toBeNull();
    expect(resolveAssetId({ id: "drafts.nope" })).toBeNull();
  });

  test("svgUrlFromAssetId derives the untransformed .svg URL for svg ids", () => {
    const url = svgUrlFromAssetId("image-abc123def456-210x32-svg");
    expect(url).not.toBeNull();
    expect(url).toMatch(/\/abc123def456-210x32\.svg$/u);
    expect(url).not.toContain("?");
  });

  test("svgUrlFromAssetId returns null for raster ids and null input", () => {
    expect(svgUrlFromAssetId("image-abc123-1200x630-png")).toBeNull();
    expect(svgUrlFromAssetId("image-abc123-1200x630-webp")).toBeNull();
    expect(svgUrlFromAssetId(null)).toBeNull();
  });
});

describe("SanityImage placeholders", async () => {
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { SanityImage } = await import("./sanity-image");
  const { createElement } = await import("react");
  const image = {
    alt: "Hero",
    id: "image-abc123def456-1440x810-jpg",
    preview: "data:image/png;base64,AAAA",
  };
  const render = (props: Record<string, unknown>) =>
    renderToStaticMarkup(createElement(SanityImage, { image, ...props }));

  test("lazy images below the fold carry the LQIP placeholder", () => {
    const html = render({ height: 810, loading: "lazy", width: 1440 });
    expect(html).toContain("data-lqip");
  });

  test("eager and high-priority images render as a plain img that paints before hydration", () => {
    for (const props of [
      { height: 810, loading: "eager", width: 1440 },
      { fetchPriority: "high", height: 810, width: 1440 },
    ]) {
      const html = render(props);
      expect(html).not.toContain("data-lqip");
      expect(html).not.toContain("opacity:0");
      expect(html).toMatch(/srcset=/iu);
    }
  });

  test("tiny images skip the placeholder", () => {
    expect(render({ height: 24, width: 24 })).not.toContain("data-lqip");
  });

  test("an SVG reserves its own aspect ratio and keeps priority hints", () => {
    const html = renderToStaticMarkup(
      createElement(SanityImage, {
        fetchPriority: "high",
        height: 32,
        image: { alt: "Mark", id: "image-abc123def456-420x64-svg" },
        loading: "eager",
        sizes: "176px",
        width: 210,
      })
    );
    expect(html).toMatch(/width="210"/u);
    expect(html).toMatch(/height="32"/u);
    expect(html).toMatch(/fetchpriority="high"/iu);
    expect(html).toMatch(/sizes="176px"/u);
  });
});
