import { describe, expect, test } from "vitest";

import { ctaToMarkdown } from "./markdown";

const para = (text: string) => [
  {
    _type: "block",
    children: [{ _type: "span", text }],
    style: "normal",
  },
];

describe(ctaToMarkdown, () => {
  test("ctaToMarkdown returns empty string for a fully empty block", () => {
    expect(ctaToMarkdown({}, {})).toBe("");
  });

  test("ctaToMarkdown renders eyebrow, title, and richText joined by blank lines", () => {
    const result = ctaToMarkdown(
      {
        eyebrow: "New",
        richText: para("Get started today."),
        title: "Launch",
      },
      {}
    );
    expect(result).toBe("**New**\n\n## Launch\n\nGet started today.");
  });

  test("ctaToMarkdown escapes markdown chars in eyebrow", () => {
    const result = ctaToMarkdown({ eyebrow: "#1 _Pick_" }, {});
    expect(result).toBe("**\\#1 \\_Pick\\_**");
  });

  test("ctaToMarkdown escapes markdown chars in title", () => {
    const result = ctaToMarkdown({ title: "user_name & [more]" }, {});
    expect(result).toBe("## user\\_name & \\[more\\]");
  });

  test("ctaToMarkdown renders buttons as a Markdown list", () => {
    const result = ctaToMarkdown(
      {
        buttons: [
          { _key: "b1", href: "/start", text: "Start" },
          { _key: "b2", href: "#", text: "Learn more" },
        ],
        title: "CTA",
      },
      {}
    );
    expect(result).toContain("- [Start](/start)");
    expect(result).toContain("- Learn more");
    expect(result).not.toContain("(#)");
  });

  test("ctaToMarkdown handles undefined richText without throwing", () => {
    expect(() =>
      ctaToMarkdown({ richText: undefined, title: "T" }, {})
    ).not.toThrow();
  });

  test("ctaToMarkdown emits no HTML or JSX tags", () => {
    const result = ctaToMarkdown(
      { eyebrow: "E", richText: para("Body."), title: "T" },
      {}
    );
    expect(result).not.toMatch(/<[A-Za-z]/u);
  });
});
