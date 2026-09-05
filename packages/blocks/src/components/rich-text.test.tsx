import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { BlockLabelsProvider, defaultBlockLabels } from "./block-labels";
import { RichText } from "./rich-text";
import type { RichTextValue } from "./rich-text";

const richText = [
  {
    _key: "p",
    _type: "block",
    children: [
      { _key: "s1", _type: "span", marks: ["ext"], text: "docs" },
      { _key: "s2", _type: "span", marks: ["broken"], text: "gone" },
    ],
    markDefs: [
      {
        _key: "ext",
        _type: "customLink",
        href: "https://example.com",
        openInNewTab: true,
      },
      { _key: "broken", _type: "customLink", href: null },
    ],
    style: "normal",
  },
  { _key: "c", _type: "code", code: "pnpm verify", language: "bash" },
] as RichTextValue;

describe(RichText, () => {
  test("renders its own strings in English without a provider", () => {
    const html = renderToStaticMarkup(<RichText richText={richText} />);

    expect(html).toContain("(opens in a new tab)");
    expect(html).toContain("Link broken");
    expect(html).toContain('aria-label="Copy code to clipboard"');
  });

  test("renders them in the labels the site provides", () => {
    const html = renderToStaticMarkup(
      <BlockLabelsProvider
        labels={{
          ...defaultBlockLabels,
          copyCode: "Code kopieren",
          linkBroken: "Link defekt",
          opensInNewTab: "(öffnet in neuem Tab)",
        }}
      >
        <RichText richText={richText} />
      </BlockLabelsProvider>
    );

    expect(html).toContain("(öffnet in neuem Tab)");
    expect(html).toContain("Link defekt");
    expect(html).toContain('aria-label="Code kopieren"');
    expect(html).not.toContain("clipboard");
  });
});
