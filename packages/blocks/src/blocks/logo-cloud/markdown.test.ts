import { describe, expect, test } from "vitest";

import { logoCloudToMarkdown } from "./markdown";

describe(logoCloudToMarkdown, () => {
  test("logoCloudToMarkdown returns empty string for a fully empty block", () => {
    expect(logoCloudToMarkdown({}, {})).toBe("");
  });

  test("logoCloudToMarkdown renders logos as an image list when a resolver is provided", () => {
    const result = logoCloudToMarkdown(
      {
        logos: [{ _key: "l1", image: { alt: "Acme", id: "img1" } }],
      },
      { resolveImageUrl: (img) => `https://cdn.example.com/${img.id}.webp` }
    );
    expect(result).toContain("- ![Acme](https://cdn.example.com/img1.webp)");
  });

  test("logoCloudToMarkdown wraps linked logos in a markdown link", () => {
    const result = logoCloudToMarkdown(
      {
        logos: [
          { _key: "l1", href: "/acme", image: { alt: "Acme", id: "img1" } },
        ],
      },
      { resolveImageUrl: (img) => `https://cdn.example.com/${img.id}.webp` }
    );
    expect(result).toContain(
      "- [![Acme](https://cdn.example.com/img1.webp)](/acme)"
    );
  });

  test("logoCloudToMarkdown falls back to alt text when no resolver is provided", () => {
    const result = logoCloudToMarkdown(
      { logos: [{ _key: "l1", image: { alt: "Acme", id: "img1" } }] },
      {}
    );
    expect(result).toContain("- Acme");
    expect(result).not.toContain("![");
  });

  test("logoCloudToMarkdown skips logos with '#' href links", () => {
    const result = logoCloudToMarkdown(
      {
        logos: [{ _key: "l1", href: "#", image: { alt: "Acme", id: "img1" } }],
      },
      { resolveImageUrl: (img) => `https://cdn.example.com/${img.id}.webp` }
    );
    expect(result).toContain("- ![Acme](https://cdn.example.com/img1.webp)");
    expect(result).not.toContain("](#)");
  });

  test("logoCloudToMarkdown emits no HTML or JSX tags", () => {
    const result = logoCloudToMarkdown(
      {
        logos: [
          { _key: "l1", href: "/acme", image: { alt: "Acme", id: "img1" } },
        ],
      },
      { resolveImageUrl: (img) => `https://cdn.example.com/${img.id}.webp` }
    );
    expect(result).not.toMatch(/<[A-Za-z]/u);
  });
});
