import { describe, expect, test } from "vitest";

import { featureCardsIconToMarkdown } from "./markdown";

const para = (text: string) => [
  {
    _type: "block",
    children: [{ _type: "span", text }],
    style: "normal",
  },
];

describe(featureCardsIconToMarkdown, () => {
  test("featureCardsIconToMarkdown returns empty string for a fully empty block", () => {
    expect(featureCardsIconToMarkdown({}, {})).toBe("");
  });

  test("featureCardsIconToMarkdown renders a section title alone", () => {
    expect(featureCardsIconToMarkdown({ title: "Features" }, {})).toBe(
      "## Features"
    );
  });

  test("featureCardsIconToMarkdown renders eyebrow above the title", () => {
    const result = featureCardsIconToMarkdown(
      { eyebrow: "Why us", title: "Features" },
      {}
    );
    expect(result).toBe("**Why us**\n\n## Features");
  });

  test("featureCardsIconToMarkdown renders each card as an h3 section", () => {
    const result = featureCardsIconToMarkdown(
      {
        cards: [
          { _key: "c1", richText: para("Very fast."), title: "Fast" },
          { _key: "c2", richText: para("Very secure."), title: "Secure" },
        ],
        title: "Features",
      },
      {}
    );
    expect(result).toContain("### Fast");
    expect(result).toContain("Very fast.");
    expect(result).toContain("### Secure");
    expect(result).toContain("Very secure.");
  });

  test("featureCardsIconToMarkdown drops the icon field from output", () => {
    const result = featureCardsIconToMarkdown(
      {
        cards: [{ _key: "c1", icon: "bolt", title: "Card" }],
      },
      {}
    );
    expect(result).not.toContain("bolt");
  });

  test("featureCardsIconToMarkdown still renders richText for a card with no title", () => {
    const result = featureCardsIconToMarkdown(
      {
        cards: [{ _key: "c1", richText: para("Body without heading.") }],
      },
      {}
    );
    expect(result).toContain("Body without heading.");
  });

  test("featureCardsIconToMarkdown handles null cards without throwing", () => {
    expect(() =>
      featureCardsIconToMarkdown({ cards: null, title: "T" }, {})
    ).not.toThrow();
  });

  test("featureCardsIconToMarkdown escapes markdown chars in card title", () => {
    const result = featureCardsIconToMarkdown(
      {
        cards: [{ _key: "c1", title: "user_name [feature]" }],
      },
      {}
    );
    expect(result).toContain("### user\\_name \\[feature\\]");
  });

  test("featureCardsIconToMarkdown emits no HTML or JSX tags", () => {
    const result = featureCardsIconToMarkdown(
      {
        cards: [{ _key: "c1", richText: para("Body."), title: "Card" }],
        title: "T",
      },
      {}
    );
    expect(result).not.toMatch(/<[A-Za-z]/u);
  });
});
