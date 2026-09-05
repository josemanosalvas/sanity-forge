import { describe, expect, test } from "vitest";

import {
  absolutizeUrl,
  portableTextToMarkdown,
} from "./portable-text-to-markdown";

const cellPara = (text: string) => [
  {
    _type: "block",
    children: [{ _type: "span", text }],
    style: "normal",
  },
];

describe(portableTextToMarkdown, () => {
  test("returns empty string for missing or empty input", () => {
    expect(portableTextToMarkdown()).toBe("");
    expect(portableTextToMarkdown(null)).toBe("");
    expect(portableTextToMarkdown([])).toBe("");
  });

  test("serializes headings, paragraphs and blockquotes", () => {
    const md = portableTextToMarkdown([
      {
        _type: "block",
        children: [{ _type: "span", text: "Heading" }],
        style: "h2",
      },
      {
        _type: "block",
        children: [{ _type: "span", text: "A paragraph." }],
        style: "normal",
      },
      {
        _type: "block",
        children: [{ _type: "span", text: "A quote." }],
        style: "blockquote",
      },
      {
        _type: "block",
        children: [{ _type: "span", text: "   " }],
        style: "normal",
      },
    ]);

    expect(md).toBe("## Heading\n\nA paragraph.\n\n> A quote.");
  });

  test("applies decorators and custom links", () => {
    const md = portableTextToMarkdown([
      {
        _type: "block",
        children: [
          { _type: "span", marks: ["strong"], text: "Bold " },
          { _type: "span", marks: ["code"], text: "and code" },
          { _type: "span", text: " and " },
          { _type: "span", marks: ["link1"], text: "a link" },
        ],
        markDefs: [{ _key: "link1", _type: "customLink", href: "/features" }],
        style: "normal",
      },
    ]);

    expect(md).toBe("**Bold **`and code` and [a link](/features)");
  });

  test.each([
    ["/about", "https://example.com", "https://example.com/about"],
    ["/about", "https://example.com/", "https://example.com/about"],
    ["https://other.com/x", "https://example.com", "https://other.com/x"],
    ["//cdn.example.com/x", "https://example.com", "//cdn.example.com/x"],
    ["mailto:a@b.com", "https://example.com", "mailto:a@b.com"],
    ["#section", "https://example.com", "#section"],
  ])("absolutizeUrl(%s, %s) is %s", (href, base, expected) => {
    expect(absolutizeUrl(href, base)).toBe(expected);
  });

  test("absolutizeUrl leaves paths relative without a base", () => {
    expect(absolutizeUrl("/about")).toBe("/about");
  });

  test("custom links become absolute when baseUrl is provided", () => {
    const md = portableTextToMarkdown(
      [
        {
          _type: "block",
          children: [{ _type: "span", marks: ["l"], text: "a link" }],
          markDefs: [{ _key: "l", _type: "customLink", href: "/features" }],
          style: "normal",
        },
      ],
      { baseUrl: "https://example.com" }
    );

    expect(md).toBe("[a link](https://example.com/features)");
  });

  test("custom links with an unsafe scheme drop to an empty target", () => {
    const md = portableTextToMarkdown([
      {
        _type: "block",
        children: [{ _type: "span", marks: ["l"], text: "click me" }],
        markDefs: [
          // oxlint-disable-next-line no-script-url -- the unsafe scheme is the input under test
          { _key: "l", _type: "customLink", href: "javascript:alert(1)" },
        ],
        style: "normal",
      },
    ]);

    expect(md).toBe("[click me]()");
  });

  test("unsafe scheme with embedded control chars is still blocked", () => {
    const md = portableTextToMarkdown([
      {
        _type: "block",
        children: [{ _type: "span", marks: ["l"], text: "click me" }],
        markDefs: [
          { _key: "l", _type: "customLink", href: "java\nscript:alert(1)" },
        ],
        style: "normal",
      },
    ]);

    // Browsers ignore the newline, so `java\nscript:` resolves to `javascript:`.
    expect(md).toBe("[click me]()");
  });

  test("nests bullet and numbered lists and keeps them grouped", () => {
    const md = portableTextToMarkdown([
      {
        _type: "block",
        children: [{ _type: "span", text: "First" }],
        level: 1,
        listItem: "bullet",
      },
      {
        _type: "block",
        children: [{ _type: "span", text: "Nested" }],
        level: 2,
        listItem: "bullet",
      },
      {
        _type: "block",
        children: [{ _type: "span", text: "Step" }],
        level: 1,
        listItem: "number",
      },
    ]);

    // Official lib uses 3-space indent per level (CommonMark-compliant).
    expect(md).toBe("- First\n   - Nested\n1. Step");
  });

  test("renders images via the resolver and falls back to text without one", () => {
    const withUrl = portableTextToMarkdown(
      [
        {
          _type: "image",
          alt: "A diagram",
          caption: "Figure 1",
          id: "image-abc",
        },
      ],
      { resolveImageUrl: () => "https://cdn.example.com/img.webp" }
    );
    expect(withUrl).toBe(
      "![A diagram](https://cdn.example.com/img.webp)\n\n_Figure 1_"
    );

    const withoutUrl = portableTextToMarkdown([
      { _type: "image", alt: "A diagram", id: "image-abc" },
    ]);
    expect(withoutUrl).toBe("A diagram");
  });

  test("keeps code-span text raw and fences embedded backticks", () => {
    expect(
      portableTextToMarkdown([
        {
          _type: "block",
          children: [{ _type: "span", marks: ["code"], text: "a_b" }],
          style: "normal",
        },
      ])
    ).toBe("`a_b`");

    expect(
      portableTextToMarkdown([
        {
          _type: "block",
          children: [{ _type: "span", marks: ["code"], text: "a`b" }],
          style: "normal",
        },
      ])
    ).toBe("``a`b``");
  });

  test("serializes a code block as a fenced code block with language", () => {
    const md = portableTextToMarkdown([
      {
        _type: "code",
        code: "export const x = {\n  name: 'x',\n};",
        filename: "callout.schema.ts",
        language: "ts",
      },
    ]);

    expect(md).toBe("```ts\nexport const x = {\n  name: 'x',\n};\n```");
  });

  test("code block without a language omits the info string", () => {
    const md = portableTextToMarkdown([
      { _type: "code", code: "line one\n  line two" },
    ]);

    expect(md).toBe("```\nline one\n  line two\n```");
  });

  test("code block fence grows past embedded backtick runs", () => {
    const md = portableTextToMarkdown([{ _type: "code", code: "a ``` b" }]);

    expect(md).toBe("````\na ``` b\n````");
  });

  test("empty code block serializes to nothing", () => {
    expect(portableTextToMarkdown([{ _type: "code", code: "   " }])).toBe("");
  });

  test("wraps link URLs containing parens or spaces in angle brackets", () => {
    const md = portableTextToMarkdown([
      {
        _type: "block",
        children: [{ _type: "span", marks: ["l"], text: "link" }],
        markDefs: [{ _key: "l", _type: "customLink", href: "/foo_(bar)" }],
        style: "normal",
      },
    ]);

    expect(md).toBe("[link](</foo_(bar)>)");
  });

  test("passes span text through without escaping Markdown metacharacters", () => {
    // The official library does not escape raw body text — callers that need
    // escaped plain-string output should use `escapeMarkdown` directly.
    const md = portableTextToMarkdown([
      {
        _type: "block",
        children: [{ _type: "span", text: "user_name_field and foo[bar]" }],
        style: "normal",
      },
    ]);

    expect(md).toBe("user_name_field and foo[bar]");
  });

  test("block-leading: escapes bullet, plus, and star markers at paragraph start", () => {
    for (const [text, expected] of [
      ["- x", "\\- x"],
      ["+ item", "\\+ item"],
      ["* star", "\\* star"],
    ] as const) {
      expect(
        portableTextToMarkdown([
          {
            _type: "block",
            children: [{ _type: "span", text }],
            style: "normal",
          },
        ])
      ).toBe(expected);
    }
  });

  test("block-leading: escapes ordered-list markers (period and paren) at paragraph start", () => {
    for (const [text, expected] of [
      ["1. x", "1\\. x"],
      ["2) y", "2\\) y"],
      ["10. z", "10\\. z"],
    ] as const) {
      expect(
        portableTextToMarkdown([
          {
            _type: "block",
            children: [{ _type: "span", text }],
            style: "normal",
          },
        ])
      ).toBe(expected);
    }
  });

  test("block-leading: escapes blockquote marker at paragraph start", () => {
    expect(
      portableTextToMarkdown([
        {
          _type: "block",
          children: [{ _type: "span", text: "> quoted" }],
          style: "normal",
        },
      ])
    ).toBe("\\> quoted");
  });

  test("block-leading: escapes ATX heading markers at paragraph start", () => {
    for (const [text, expected] of [
      ["# H1", "\\# H1"],
      ["## H2", "\\## H2"],
      ["###### H6", "\\###### H6"],
    ] as const) {
      expect(
        portableTextToMarkdown([
          {
            _type: "block",
            children: [{ _type: "span", text }],
            style: "normal",
          },
        ])
      ).toBe(expected);
    }
  });

  test("block-leading: escapes thematic break sequences in normal paragraphs", () => {
    for (const text of ["---", "***", "___"]) {
      expect(
        portableTextToMarkdown([
          {
            _type: "block",
            children: [{ _type: "span", text }],
            style: "normal",
          },
        ])
      ).toMatch(/^\\/u);
    }
  });

  test("block-leading: real bullet and number listItems still render as list markers (not escaped)", () => {
    const md = portableTextToMarkdown([
      {
        _type: "block",
        children: [{ _type: "span", text: "Bullet" }],
        level: 1,
        listItem: "bullet",
      },
      {
        _type: "block",
        children: [{ _type: "span", text: "Step" }],
        level: 1,
        listItem: "number",
      },
    ]);
    expect(md).toContain("- Bullet");
    expect(md).toContain("1. Step");
  });

  test("block-leading: inline underscores in normal paragraphs are not over-escaped (guard)", () => {
    expect(
      portableTextToMarkdown([
        {
          _type: "block",
          children: [{ _type: "span", text: "user_name_field" }],
          style: "normal",
        },
      ])
    ).toBe("user_name_field");
  });

  test("serializes a table to a GFM pipe table", () => {
    const md = portableTextToMarkdown([
      {
        _type: "table",
        headerRows: 1,
        rows: [
          {
            cells: [{ value: cellPara("Name") }, { value: cellPara("Role") }],
          },
          {
            cells: [
              { value: cellPara("Ada") },
              { value: cellPara("Engineer") },
            ],
          },
        ],
      },
    ]);

    expect(md).toBe("| Name | Role |\n| --- | --- |\n| Ada | Engineer |");
  });

  test("table cells escape pipes and collapse newlines to <br>", () => {
    const md = portableTextToMarkdown([
      {
        _type: "table",
        headerRows: 1,
        rows: [
          { cells: [{ value: cellPara("A | B") }] },
          {
            cells: [
              {
                value: [...cellPara("Line one"), ...cellPara("Line two")],
              },
            ],
          },
        ],
      },
    ]);

    expect(md).toBe("| A \\| B |\n| --- |\n| Line one<br>Line two |");
  });

  test("table rows are padded to the widest row's column count", () => {
    const md = portableTextToMarkdown([
      {
        _type: "table",
        headerRows: 1,
        rows: [
          { cells: [{ value: cellPara("A") }, { value: cellPara("B") }] },
          { cells: [{ value: cellPara("C") }] },
        ],
      },
    ]);

    expect(md).toBe("| A | B |\n| --- | --- |\n| C |  |");
  });

  test("empty table serializes to nothing", () => {
    expect(portableTextToMarkdown([{ _type: "table", rows: [] }])).toBe("");
  });

  test("never emits raw JSX-style tags", () => {
    const md = portableTextToMarkdown([
      {
        _type: "block",
        children: [{ _type: "span", text: "Section" }],
        style: "h3",
      },
    ]);
    expect(md).not.toMatch(/<[A-Za-z]/u);
  });
});
