import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import {
  BlockLabelsProvider,
  defaultBlockLabels,
} from "../../components/block-labels";
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
    expect(html).toMatch(/No spam, ever/u);
  });

  test("renders the form controls in the labels the site provides", () => {
    const html = renderToStaticMarkup(
      <BlockLabelsProvider
        labels={{
          ...defaultBlockLabels,
          newsletter: {
            emailLabel: "E-Mail-Adresse",
            emailPlaceholder: "E-Mail-Adresse eingeben",
            subscribe: "Abonnieren",
            subscribeToNewsletter: "Newsletter abonnieren",
            subscribing: "Wird abonniert…",
          },
        }}
      >
        <SubscribeNewsletter action="/api/subscribe" title="Newsletter" />
      </BlockLabelsProvider>
    );

    expect(html).toContain('aria-label="E-Mail-Adresse"');
    expect(html).toContain('placeholder="E-Mail-Adresse eingeben"');
    expect(html).toContain('aria-label="Newsletter abonnieren"');
    expect(html).toContain(">Abonnieren<");
    expect(html).not.toMatch(/Subscribe/u);
  });
});
