import { describe, expect, test } from "vitest";

import { faqAccordionToMarkdown } from "./markdown";

const para = (text: string) => [
  {
    _type: "block",
    children: [{ _type: "span", text }],
    style: "normal",
  },
];

const category = (
  faqs: { title?: string; richText?: ReturnType<typeof para> }[]
) => [{ _key: "cat-1", faqs, title: "General" }];

describe(faqAccordionToMarkdown, () => {
  test("faqAccordionToMarkdown returns empty string for a fully empty block", () => {
    expect(faqAccordionToMarkdown({}, {})).toBe("");
  });

  test("faqAccordionToMarkdown renders eyebrow and title with no faqs", () => {
    const result = faqAccordionToMarkdown(
      { eyebrow: "Help", title: "FAQ" },
      {}
    );
    expect(result).toBe("**Help**\n\n## FAQ");
  });

  test("faqAccordionToMarkdown renders subtitle below title", () => {
    const result = faqAccordionToMarkdown(
      { subtitle: "Your questions answered", title: "FAQ" },
      {}
    );
    expect(result).toContain("Your questions answered");
  });

  test("faqAccordionToMarkdown escapes markdown chars in subtitle", () => {
    const result = faqAccordionToMarkdown(
      { subtitle: "Ask [us] anything_here | now", title: "FAQ" },
      {}
    );
    expect(result).toContain("Ask \\[us\\] anything\\_here \\| now");
  });

  test("faqAccordionToMarkdown renders each faq as h3 followed by its answer", () => {
    const result = faqAccordionToMarkdown(
      {
        categories: category([
          { richText: para("An answer."), title: "What?" },
        ]),
        title: "FAQ",
      },
      {}
    );
    expect(result).toContain("### What?");
    expect(result).toContain("An answer.");
  });

  test("faqAccordionToMarkdown serializes faqs across multiple categories", () => {
    const result = faqAccordionToMarkdown(
      {
        categories: [
          {
            _key: "cat-1",
            faqs: [{ richText: para("A1"), title: "Q1" }],
            title: "First",
          },
          {
            _key: "cat-2",
            faqs: [{ richText: para("A2"), title: "Q2" }],
            title: "Second",
          },
        ],
        title: "FAQ",
      },
      {}
    );
    expect(result).toContain("### Q1");
    expect(result).toContain("### Q2");
  });

  test("faqAccordionToMarkdown skips faqs that have no title", () => {
    const result = faqAccordionToMarkdown(
      {
        categories: category([
          { richText: para("Orphan body"), title: "" },
          { richText: para("Also orphan") },
          { richText: para("Yes."), title: "Valid Q" },
        ]),
        title: "FAQ",
      },
      {}
    );
    expect(result).not.toContain("Orphan body");
    expect(result).not.toContain("Also orphan");
    expect(result).toContain("### Valid Q");
  });

  test("faqAccordionToMarkdown handles null categories without throwing", () => {
    expect(() =>
      faqAccordionToMarkdown({ categories: null, title: "FAQ" }, {})
    ).not.toThrow();
  });

  test("faqAccordionToMarkdown prefers link description over link title", () => {
    const result = faqAccordionToMarkdown(
      {
        categories: category([{ richText: para("A"), title: "Q" }]),
        link: { description: "See all FAQs", href: "/faq", title: "MoreX" },
        title: "FAQ",
      },
      {}
    );
    expect(result).toContain("[See all FAQs](/faq)");
    expect(result).not.toContain("MoreX");
  });

  test("faqAccordionToMarkdown uses link title when description is absent", () => {
    const result = faqAccordionToMarkdown(
      {
        categories: category([{ richText: para("A"), title: "Q" }]),
        link: { href: "/faq", title: "More" },
        title: "FAQ",
      },
      {}
    );
    expect(result).toContain("[More](/faq)");
  });

  test("faqAccordionToMarkdown renders link as plain text when href is '#'", () => {
    const result = faqAccordionToMarkdown(
      {
        categories: category([{ richText: para("A"), title: "Q" }]),
        link: { href: "#", title: "Label" },
        title: "FAQ",
      },
      {}
    );
    expect(result).toContain("Label");
    expect(result).not.toContain("(#)");
  });

  test("faqAccordionToMarkdown emits no HTML or JSX tags", () => {
    const result = faqAccordionToMarkdown(
      {
        categories: category([{ richText: para("Answer text."), title: "Q?" }]),
        title: "FAQ",
      },
      {}
    );
    expect(result).not.toMatch(/<[A-Za-z]/u);
  });
});
