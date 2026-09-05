import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import type { ShowcaseGridItem } from "./component";
import { ShowcaseGrid } from "./component";

const item = (
  key: string,
  overrides: Partial<ShowcaseGridItem> = {}
): ShowcaseGridItem => ({
  _key: key,
  screenshot: { alt: `Site ${key}`, id: `image-${key}abc123-1200x800-png` },
  siteName: `Site ${key}`,
  ...overrides,
});

describe(ShowcaseGrid, () => {
  test("ShowcaseGrid promotes the first item when nothing is flagged featured", () => {
    const html = renderToStaticMarkup(
      <ShowcaseGrid
        items={[item("a"), item("b"), item("c")]}
        title="Showcase"
      />
    );

    expect(html).toContain("Site a");
    expect(html).toContain("Site b");
    expect(html).toContain("Site c");
  });

  test("ShowcaseGrid honours an explicit featured flag", () => {
    const html = renderToStaticMarkup(
      <ShowcaseGrid
        items={[item("a"), item("b", { featured: true }), item("c")]}
        title="Showcase"
      />
    );

    expect(html).toContain("Site a");
    expect(html).toContain("Site b");
    expect(html).toContain("Site c");
  });

  test("ShowcaseGrid links a card out when it has a url", () => {
    const html = renderToStaticMarkup(
      <ShowcaseGrid
        items={[item("a", { url: "https://example.com" })]}
        title="Showcase"
      />
    );

    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  // oxlint-disable-next-line no-script-url -- the unsafe scheme is the input under test
  test("ShowcaseGrid drops a javascript: url rather than rendering it", () => {
    const html = renderToStaticMarkup(
      <ShowcaseGrid
        // oxlint-disable-next-line no-script-url -- the unsafe scheme is the input under test
        items={[item("a", { url: "javascript:alert(1)" })]}
        title="Showcase"
      />
    );

    // oxlint-disable-next-line no-script-url -- asserting the unsafe scheme was removed
    expect(html).not.toContain("javascript:");
  });

  test("ShowcaseGrid renders a heading-only section when there are no items", () => {
    const html = renderToStaticMarkup(
      <ShowcaseGrid items={[]} title="Showcase" />
    );

    expect(html).toContain("Showcase");
  });
});
