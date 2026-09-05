import { describe, expect, test } from "vitest";

import { showcaseGridToMarkdown } from "./markdown";

describe(showcaseGridToMarkdown, () => {
  test("showcaseGridToMarkdown returns empty string for a fully empty block", () => {
    expect(showcaseGridToMarkdown({}, {})).toBe("");
  });

  test("showcaseGridToMarkdown renders the title and description", () => {
    const result = showcaseGridToMarkdown(
      {
        description: "Every site here started from the same template.",
        title: "Real sites. Real traffic.",
      },
      {}
    );
    expect(result).toContain("## Real sites. Real traffic.");
    expect(result).toContain("Every site here started from the same template.");
  });

  test("showcaseGridToMarkdown renders items as a linked list", () => {
    const result = showcaseGridToMarkdown(
      {
        items: [
          { _key: "i1", siteName: "Volvo Chile", url: "https://volvo.cl" },
          { _key: "i2", siteName: "No Link Site" },
        ],
      },
      {}
    );
    expect(result).toContain("- [Volvo Chile](https://volvo.cl)");
    expect(result).toContain("- No Link Site");
    expect(result).not.toContain("No Link Site](");
  });

  test("showcaseGridToMarkdown links the site name and skips nameless items", () => {
    const result = showcaseGridToMarkdown(
      {
        items: [
          {
            _key: "i1",
            siteName: "Named Site",
            url: "https://named.example.com",
          },
          { _key: "i2", url: "https://nameless.example.com" },
        ],
      },
      {}
    );
    expect(result).toContain("- [Named Site](https://named.example.com)");
    expect(result).not.toContain("nameless.example.com");
  });

  test("showcaseGridToMarkdown appends the category after the link", () => {
    const result = showcaseGridToMarkdown(
      {
        items: [
          {
            _key: "i1",
            category: "Real Estate",
            siteName: "Opera Group",
            url: "https://opera.example.com",
          },
          { _key: "i2", siteName: "Plain Site" },
        ],
      },
      {}
    );
    expect(result).toContain(
      "- [Opera Group](https://opera.example.com) — Real Estate"
    );
    expect(result).toContain("- Plain Site");
    expect(result).not.toContain("Plain Site —");
  });

  test("showcaseGridToMarkdown emits no HTML or JSX tags", () => {
    const result = showcaseGridToMarkdown(
      {
        description: "Built with the template.",
        items: [
          {
            _key: "i1",
            siteName: "Volvo Chile",
            url: "https://volvo.cl",
          },
        ],
        title: "Real sites",
      },
      {}
    );
    expect(result).not.toMatch(/<[A-Za-z]/u);
  });
});
