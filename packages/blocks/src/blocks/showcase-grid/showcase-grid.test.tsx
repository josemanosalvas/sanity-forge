import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import type { ShowcaseGridItem } from "./showcase-grid";
import { ShowcaseGrid } from "./showcase-grid";

const item = (
  key: string,
  overrides: Partial<ShowcaseGridItem> = {}
): ShowcaseGridItem => ({
  _key: key,
  screenshot: { alt: `Site ${key}`, id: `image-${key}abc123-1200x800-png` },
  siteName: `Site ${key}`,
  ...overrides,
});

/** Keys of the items rendered as grid cards, in order; banners are not cards. */
const cardKeys = (html: string) =>
  html
    .split("<article")
    .slice(1)
    .map((card) => /Site (?<key>\w)/u.exec(card)?.groups?.key);

describe(ShowcaseGrid, () => {
  test("ShowcaseGrid promotes the first item when nothing is flagged featured", () => {
    const html = renderToStaticMarkup(
      <ShowcaseGrid
        items={[item("a"), item("b"), item("c")]}
        title="Showcase"
      />
    );

    expect(cardKeys(html)).toStrictEqual(["b", "c"]);
  });

  test("ShowcaseGrid honours an explicit featured flag", () => {
    const html = renderToStaticMarkup(
      <ShowcaseGrid
        items={[item("a"), item("b", { featured: true }), item("c")]}
        title="Showcase"
      />
    );

    expect(cardKeys(html)).toStrictEqual(["a", "c"]);
  });

  test("ShowcaseGrid gives every featured item a banner", () => {
    const html = renderToStaticMarkup(
      <ShowcaseGrid
        items={[
          item("a"),
          item("b", { featured: true }),
          item("c", { featured: true }),
        ]}
        title="Showcase"
      />
    );

    expect(cardKeys(html)).toStrictEqual(["a"]);
  });

  test("ShowcaseGrid keeps the editor's alt text on screenshots and logos", () => {
    const html = renderToStaticMarkup(
      <ShowcaseGrid
        items={[
          item("a", {
            attributionLogo: {
              alt: "Acme wordmark",
              id: "image-acef123-200x100-png",
            },
            screenshot: {
              alt: "Homepage of Acme",
              id: "image-aabc123-1200x800-png",
            },
          }),
        ]}
        title="Showcase"
      />
    );

    expect(html).toContain('alt="Homepage of Acme"');
    expect(html).toContain('alt="Acme wordmark"');
    expect(html).not.toMatch(/website screenshot|Site a logo/u);
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
