import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { RichTextBlock } from "./rich-text-block";

describe(RichTextBlock, () => {
  test("RichTextBlock renders headings and body text", () => {
    const html = renderToStaticMarkup(
      <RichTextBlock
        title="Editorial body"
        richText={[
          {
            _key: "block-1",
            _type: "block",
            children: [{ _type: "span", text: "Structured text content." }],
          },
        ]}
      />
    );

    expect(html).toMatch(/Editorial body/u);
    expect(html).toMatch(/Structured text content/u);
  });
});
