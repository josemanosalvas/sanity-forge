import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";

import { RichTextBlock } from "./component";

test("RichTextBlock renders headings and body text", () => {
  const html = renderToStaticMarkup(
    <RichTextBlock
      title="Editorial body"
      richText={[
        {
          _type: "block",
          _key: "block-1",
          children: [{ _type: "span", text: "Structured text content." }],
        },
      ]}
    />
  );

  expect(html).toMatch(/Editorial body/);
  expect(html).toMatch(/Structured text content/);
});
