import { describe, expect, test } from "vitest";

import { pageBuilderToMarkdown } from "./page-builder-to-markdown";
import type { MarkdownBlock } from "./page-builder-to-markdown";

const para = (text: string) => [
  { _type: "block", children: [{ _type: "span", text }], style: "normal" },
];

describe(pageBuilderToMarkdown, () => {
  test("returns empty string for missing input", () => {
    expect(pageBuilderToMarkdown()).toBe("");
    expect(pageBuilderToMarkdown(null)).toBe("");
    expect(pageBuilderToMarkdown([])).toBe("");
  });

  const faqMarkdown = pageBuilderToMarkdown([
    {
      _type: "faqAccordion",
      categories: [
        {
          _key: "cat-1",
          faqs: [
            {
              _id: "1",
              richText: para("An answer."),
              title: "What is this?",
            },
            // skipped — no title
            { _id: "2", title: "" },
          ],
          title: "General",
        },
      ],
      eyebrow: "FAQ",
      link: { description: "See all", href: "/faq", title: "More" },
      subtitle: "Helpful answers",
      title: "Questions",
    },
  ]);

  test.each([
    "**FAQ**",
    "## Questions",
    "Helpful answers",
    "### What is this?",
    "An answer.",
    "[See all](/faq)",
  ])("serializes an FAQ block as semantic markdown containing %s", (text) => {
    expect(faqMarkdown).toContain(text);
  });

  test("serializes an FAQ block without component tags", () => {
    expect(faqMarkdown).not.toMatch(/<[A-Za-z]/u);
  });

  test("serializes hero with buttons as markdown links", () => {
    const md = pageBuilderToMarkdown([
      {
        _type: "hero",
        badge: "New",
        buttons: [
          { _key: "b1", href: "/start", text: "Get started" },
          { _key: "b2", href: "#", text: "Broken" },
        ],
        richText: para("Intro copy."),
        title: "Welcome",
      },
    ]);

    expect(md).toContain("## Welcome");
    expect(md).toContain("Intro copy.");
    expect(md).toContain("- [Get started](/start)");
    expect(md).toContain("- Broken");
  });

  test("serializes feature cards as nested headings", () => {
    const md = pageBuilderToMarkdown([
      {
        _type: "featureCardsIcon",
        cards: [
          {
            _key: "c1",
            icon: "bolt",
            richText: para("Very fast."),
            title: "Fast",
          },
        ],
        title: "Features",
      },
    ]);

    expect(md).toContain("## Features");
    expect(md).toContain("### Fast");
    expect(md).toContain("Very fast.");
    expect(md).not.toContain("bolt");
  });

  test("serializes subscribe newsletter without form markup", () => {
    const md = pageBuilderToMarkdown([
      {
        _type: "subscribeNewsletter",
        helperText: para("No spam."),
        subTitle: para("Subscribe for updates."),
        title: "Stay in the loop",
      },
    ]);

    expect(md).toContain("## Stay in the loop");
    expect(md).toContain("Subscribe for updates.");
    // The form's small print is omitted, like the rendered block without a handler.
    expect(md).not.toContain("No spam.");
    expect(md).not.toMatch(/<(?:form|input|button)/iu);
  });

  test("unknown blocks contribute nothing", () => {
    const md = pageBuilderToMarkdown([
      { _type: "someFutureBlock", title: "Ignore me" } as MarkdownBlock,
      { _type: "richTextBlock", richText: para("Body."), title: "Kept" },
    ]);

    expect(md).not.toContain("Ignore me");
    expect(md).toContain("## Kept");
    expect(md).toContain("Body.");
  });

  test("treats '#' href as no link (plain text fallback)", () => {
    const faq = pageBuilderToMarkdown([
      {
        _type: "faqAccordion",
        categories: [
          {
            _key: "cat-1",
            faqs: [{ _id: "1", richText: para("y"), title: "x" }],
            title: "General",
          },
        ],
        link: { href: "#", title: "More" },
        title: "Q",
      },
    ]);
    expect(faq).toContain("More");
    expect(faq).not.toContain("(#)");
  });

  test("keeps no-href links as plain text instead of dropping them", () => {
    const faq = pageBuilderToMarkdown([
      {
        _type: "faqAccordion",
        categories: [
          {
            _key: "cat-1",
            faqs: [{ _id: "1", richText: para("y"), title: "x" }],
            title: "General",
          },
        ],
        link: { title: "All questions" },
        title: "Q",
      },
    ]);
    expect(faq).toContain("All questions");
    expect(faq).not.toContain("](");
  });

  test("separates blocks with a blank line", () => {
    const md = pageBuilderToMarkdown([
      { _type: "richTextBlock", title: "One" },
      { _type: "richTextBlock", title: "Two" },
    ]);

    expect(md).toBe("## One\n\n## Two");
  });
});
