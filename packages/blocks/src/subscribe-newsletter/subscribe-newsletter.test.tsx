import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { SubscribeNewsletter } from "./subscribe-newsletter";

describe(SubscribeNewsletter, () => {
  test("does not submit visitors' emails to the current page when no handler is configured", () => {
    const html = renderToStaticMarkup(<SubscribeNewsletter title="News" />);
    expect(html).toContain("News");
    expect(html).not.toContain("<form");
    expect(html).not.toContain('name="email"');
  });

  test("SubscribeNewsletter renders text sections", () => {
    const html = renderToStaticMarkup(
      <SubscribeNewsletter
        action="/api/subscribe"
        helperText={[
          {
            _key: "helper-1",
            _type: "block",
            children: [{ _type: "span", text: "No spam, ever." }],
          },
        ]}
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
    // The small print renders together with the form it belongs to.
    expect(html).toMatch(/No spam, ever/u);
  });
});
