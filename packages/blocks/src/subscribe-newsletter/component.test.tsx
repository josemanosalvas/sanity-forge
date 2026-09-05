import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { SubscribeNewsletter } from "./component";

describe(SubscribeNewsletter, () => {
  test("SubscribeNewsletter renders text sections", () => {
    const html = renderToStaticMarkup(
      <SubscribeNewsletter
        action="/api/subscribe"
        method="post"
        title="Subscribe"
        subTitle={[
          {
            _key: "block-1",
            _type: "block",
            children: [{ _type: "span", text: "Product updates." }],
          },
        ]}
      />
    );

    expect(html).toMatch(/Subscribe/u);
    expect(html).toMatch(/Product updates/u);
    expect(html).toContain('action="/api/subscribe"');
    expect(html).toContain('method="post"');
  });
});
