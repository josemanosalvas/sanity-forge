import { describe, expect, it } from "vitest";
/**
 * The helpers in ./markdown.ts back every per-block serializer, so correctness
 * here protects the entire pipeline.
 */

import {
  buttonsToMarkdown,
  eyebrowToMarkdown,
  headingToMarkdown,
  imageToMarkdown,
  joinSections,
  mdLink,
} from "./markdown";
import type { MarkdownImage, MarkdownOptions } from "./markdown";

const resolveImageUrl: MarkdownOptions["resolveImageUrl"] = (img) =>
  `https://cdn.example.com/${img.id}.webp`;

describe("lib/markdown", () => {
  it("joinSections returns empty string for an empty array", () => {
    expect(joinSections([])).toBe("");
  });

  it("joinSections filters null, undefined, and whitespace-only entries", () => {
    expect(joinSections([null, undefined, "  ", ""])).toBe("");
  });

  it("joinSections joins non-empty sections with a blank line", () => {
    expect(joinSections(["A", "B", "C"])).toBe("A\n\nB\n\nC");
  });

  it("joinSections returns a single non-empty section unchanged", () => {
    expect(joinSections(["only"])).toBe("only");
  });

  it("joinSections skips whitespace-only entries between real sections", () => {
    expect(joinSections(["First", "   ", "Second"])).toBe("First\n\nSecond");
  });

  it("eyebrowToMarkdown returns empty for null/undefined/empty/whitespace", () => {
    expect(eyebrowToMarkdown(null)).toBe("");
    expect(eyebrowToMarkdown()).toBe("");
    expect(eyebrowToMarkdown("")).toBe("");
    expect(eyebrowToMarkdown("   ")).toBe("");
  });

  it("eyebrowToMarkdown wraps plain text in bold markers", () => {
    expect(eyebrowToMarkdown("New")).toBe("**New**");
  });

  it("eyebrowToMarkdown escapes # inside bold", () => {
    expect(eyebrowToMarkdown("Say #1")).toBe("**Say \\#1**");
  });

  it("eyebrowToMarkdown escapes underscores inside bold", () => {
    expect(eyebrowToMarkdown("_italic_")).toBe("**\\_italic\\_**");
  });

  it("eyebrowToMarkdown escapes square brackets inside bold", () => {
    expect(eyebrowToMarkdown("[link]")).toBe("**\\[link\\]**");
  });

  it("eyebrowToMarkdown escapes angle brackets (prevents HTML injection)", () => {
    expect(eyebrowToMarkdown("<script>")).toBe("**\\<script\\>**");
  });

  it("eyebrowToMarkdown escapes backtick and pipe", () => {
    expect(eyebrowToMarkdown("`code` | pipe")).toBe("**\\`code\\` \\| pipe**");
  });

  it("headingToMarkdown returns empty for null/undefined/whitespace", () => {
    expect(headingToMarkdown(null, 2)).toBe("");
    expect(headingToMarkdown(undefined, 2)).toBe("");
    expect(headingToMarkdown("  ", 2)).toBe("");
  });

  it("headingToMarkdown emits ## prefix for level 2", () => {
    expect(headingToMarkdown("About Us", 2)).toBe("## About Us");
  });

  it("headingToMarkdown emits ### prefix for level 3", () => {
    expect(headingToMarkdown("Card Title", 3)).toBe("### Card Title");
  });

  it("headingToMarkdown escapes underscores in title", () => {
    expect(headingToMarkdown("user_name field", 2)).toBe(
      "## user\\_name field"
    );
  });

  it("headingToMarkdown escapes square brackets in title", () => {
    expect(headingToMarkdown("[Tag] heading", 2)).toBe("## \\[Tag\\] heading");
  });

  it("headingToMarkdown escapes leading # so it is not a nested heading", () => {
    expect(headingToMarkdown("#hashtag", 2)).toBe("## \\#hashtag");
  });

  it("headingToMarkdown escapes asterisks in title", () => {
    expect(headingToMarkdown("*bold* text", 3)).toBe("### \\*bold\\* text");
  });

  it("headingToMarkdown escapes angle brackets (prevents HTML injection)", () => {
    expect(headingToMarkdown("<script>alert(1)</script>", 2)).toBe(
      "## \\<script\\>alert(1)\\</script\\>"
    );
  });

  it("buttonsToMarkdown returns empty for null and undefined", () => {
    expect(buttonsToMarkdown(null)).toBe("");
    expect(buttonsToMarkdown()).toBe("");
  });

  it("buttonsToMarkdown returns empty for an empty array", () => {
    expect(buttonsToMarkdown([])).toBe("");
  });

  it("buttonsToMarkdown renders a valid button as a Markdown link list item", () => {
    expect(buttonsToMarkdown([{ href: "/start", text: "Get started" }])).toBe(
      "- [Get started](/start)"
    );
  });

  it("buttonsToMarkdown renders plain text when href is '#'", () => {
    expect(buttonsToMarkdown([{ href: "#", text: "Click me" }])).toBe(
      "- Click me"
    );
  });

  it("buttonsToMarkdown absolutizes internal hrefs when baseUrl is set", () => {
    expect(
      buttonsToMarkdown([{ href: "/start", text: "Get started" }], {
        baseUrl: "https://example.com",
      })
    ).toBe("- [Get started](https://example.com/start)");
  });

  it("mdLink absolutizes internal hrefs when baseUrl is set", () => {
    expect(mdLink("About", "/about", { baseUrl: "https://example.com" })).toBe(
      "[About](https://example.com/about)"
    );
    // external href untouched
    expect(
      mdLink("Ext", "https://other.com", { baseUrl: "https://example.com" })
    ).toBe("[Ext](https://other.com)");
  });

  it("buttonsToMarkdown renders plain text when href is absent", () => {
    expect(buttonsToMarkdown([{ text: "Anchor only" }])).toBe("- Anchor only");
  });

  it("buttonsToMarkdown uses href as label when text is empty and href is valid", () => {
    expect(buttonsToMarkdown([{ href: "/docs" }])).toBe("- [/docs](/docs)");
  });

  it("buttonsToMarkdown filters buttons with no text and no actionable href", () => {
    expect(buttonsToMarkdown([{ href: "#", text: "" }])).toBe("");
    expect(buttonsToMarkdown([{ text: "" }])).toBe("");
    expect(buttonsToMarkdown([{}])).toBe("");
  });

  it("buttonsToMarkdown escapes markdown chars in button text", () => {
    expect(
      buttonsToMarkdown([{ href: "/path", text: "user_name [docs]" }])
    ).toBe("- [user\\_name \\[docs\\]](/path)");
  });

  it("buttonsToMarkdown wraps hrefs containing parentheses in angle brackets", () => {
    expect(buttonsToMarkdown([{ href: "/docs/foo_(bar)", text: "See" }])).toBe(
      "- [See](</docs/foo_(bar)>)"
    );
  });

  it("buttonsToMarkdown joins multiple buttons with a newline, not a blank line", () => {
    expect(
      buttonsToMarkdown([
        { href: "/primary", text: "Primary" },
        { href: "#", text: "Secondary" },
      ])
    ).toBe("- [Primary](/primary)\n- Secondary");
  });

  it("imageToMarkdown returns empty for null or undefined", () => {
    expect(imageToMarkdown(null, {})).toBe("");
    expect(imageToMarkdown(undefined, {})).toBe("");
  });

  it("imageToMarkdown returns empty when id, alt, and caption are all absent", () => {
    expect(imageToMarkdown({}, {})).toBe("");
    expect(imageToMarkdown({ alt: "", caption: "", id: null }, {})).toBe("");
  });

  it("imageToMarkdown falls back to alt text when no resolver is provided", () => {
    const img: MarkdownImage = { alt: "A photo", id: "abc123" };
    expect(imageToMarkdown(img, {})).toBe("A photo");
  });

  it("imageToMarkdown falls back to caption when alt is empty and there is no resolver", () => {
    const img: MarkdownImage = { alt: "", caption: "Nice view", id: "abc123" };
    expect(imageToMarkdown(img, {})).toBe("Nice view");
  });

  it("imageToMarkdown emits image markdown when resolver returns a URL", () => {
    const img: MarkdownImage = { alt: "A photo", id: "abc123" };
    expect(imageToMarkdown(img, { resolveImageUrl })).toBe(
      "![A photo](https://cdn.example.com/abc123.webp)"
    );
  });

  it("imageToMarkdown escapes square brackets in alt text", () => {
    const img: MarkdownImage = { alt: "A [diagram]", id: "abc123" };
    expect(imageToMarkdown(img, { resolveImageUrl })).toBe(
      "![A \\[diagram\\]](https://cdn.example.com/abc123.webp)"
    );
  });

  it("imageToMarkdown escapes markdown chars in fallback alt text", () => {
    const img: MarkdownImage = { alt: "user_name [tag]", id: "abc123" };
    expect(imageToMarkdown(img, {})).toBe("user\\_name \\[tag\\]");
  });

  it("imageToMarkdown falls back to text when resolver returns null", () => {
    const img: MarkdownImage = { alt: "Fallback", id: "abc123" };
    expect(imageToMarkdown(img, { resolveImageUrl: () => null })).toBe(
      "Fallback"
    );
  });

  it("imageToMarkdown falls back to text when the resolver returns nothing", () => {
    const img: MarkdownImage = { alt: "Fallback", id: "abc123" };
    expect(imageToMarkdown(img, { resolveImageUrl: () => null })).toBe(
      "Fallback"
    );
  });

  it("imageToMarkdown wraps image URLs with spaces in angle brackets", () => {
    const img: MarkdownImage = { alt: "Photo", id: "abc123" };
    expect(
      imageToMarkdown(img, {
        resolveImageUrl: () => "https://cdn.example.com/my file.webp",
      })
    ).toBe("![Photo](<https://cdn.example.com/my file.webp>)");
  });

  it("imageToMarkdown skips the resolver when id is null", () => {
    const img: MarkdownImage = { alt: "No id", id: null };
    expect(imageToMarkdown(img, { resolveImageUrl })).toBe("No id");
  });

  it("imageToMarkdown appends caption as italic paragraph when caption differs from alt", () => {
    const img: MarkdownImage = {
      alt: "A diagram",
      caption: "Figure 1",
      id: "abc123",
    };
    expect(imageToMarkdown(img, { resolveImageUrl })).toBe(
      "![A diagram](https://cdn.example.com/abc123.webp)\n\n_Figure 1_"
    );
  });

  it("imageToMarkdown does not append caption when caption equals alt", () => {
    const img: MarkdownImage = {
      alt: "Same text",
      caption: "Same text",
      id: "abc123",
    };
    expect(imageToMarkdown(img, { resolveImageUrl })).toBe(
      "![Same text](https://cdn.example.com/abc123.webp)"
    );
  });

  it("imageToMarkdown escapes markdown chars in caption", () => {
    const img: MarkdownImage = {
      alt: "Photo",
      caption: "_Caption_",
      id: "abc123",
    };
    expect(imageToMarkdown(img, { resolveImageUrl })).toBe(
      "![Photo](https://cdn.example.com/abc123.webp)\n\n_\\_Caption\\__"
    );
  });

  it("mdLink returns a Markdown link for a valid href", () => {
    expect(mdLink("Docs", "/docs")).toBe("[Docs](/docs)");
  });

  it("mdLink returns escaped plain text for '#' href", () => {
    expect(mdLink("Anchor", "#")).toBe("Anchor");
  });

  it("mdLink returns escaped plain text for null href", () => {
    expect(mdLink("Label", null)).toBe("Label");
  });

  it("mdLink returns escaped plain text for undefined href", () => {
    expect(mdLink("Label")).toBe("Label");
  });

  it("mdLink returns escaped plain text for empty-string href", () => {
    expect(mdLink("Label", "")).toBe("Label");
  });

  it("mdLink escapes markdown metacharacters in the label", () => {
    expect(mdLink("user_name [tag]", "/path")).toBe(
      "[user\\_name \\[tag\\]](/path)"
    );
  });

  it("mdLink wraps href with parentheses in angle brackets", () => {
    expect(mdLink("Link", "/wiki/foo_(bar)")).toBe("[Link](</wiki/foo_(bar)>)");
  });
});
