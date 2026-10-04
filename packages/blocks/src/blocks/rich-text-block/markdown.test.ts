import { describe, expect, it } from "vitest";

import { richTextBlockToMarkdown } from "./markdown";

const para = (text: string) => [
  {
    _type: "block",
    children: [{ _type: "span", text }],
    style: "normal",
  },
];

describe(richTextBlockToMarkdown, () => {
  it("richTextBlockToMarkdown returns empty string for a fully empty block", () => {
    expect(richTextBlockToMarkdown({}, {})).toBe("");
  });

  it("richTextBlockToMarkdown renders eyebrow and title", () => {
    const result = richTextBlockToMarkdown(
      { eyebrow: "Context", title: "Our Story" },
      {}
    );
    expect(result).toBe("**Context**\n\n## Our Story");
  });

  it("richTextBlockToMarkdown renders richText without eyebrow or title", () => {
    const result = richTextBlockToMarkdown(
      { richText: para("Just a paragraph.") },
      {}
    );
    expect(result).toBe("Just a paragraph.");
  });

  it("richTextBlockToMarkdown escapes markdown chars in eyebrow", () => {
    const result = richTextBlockToMarkdown({ eyebrow: "#featured *post*" }, {});
    expect(result).toBe("**\\#featured \\*post\\***");
  });

  it("richTextBlockToMarkdown escapes markdown chars in title", () => {
    const result = richTextBlockToMarkdown(
      { title: "Why user_name matters" },
      {}
    );
    expect(result).toBe("## Why user\\_name matters");
  });

  it("richTextBlockToMarkdown handles undefined richText without throwing", () => {
    expect(() =>
      richTextBlockToMarkdown({ richText: undefined, title: "T" }, {})
    ).not.toThrow();
  });

  it("richTextBlockToMarkdown emits no HTML or JSX tags", () => {
    const result = richTextBlockToMarkdown(
      { eyebrow: "E", richText: para("Body."), title: "T" },
      {}
    );
    expect(result).not.toMatch(/<[A-Za-z]/u);
  });
});
