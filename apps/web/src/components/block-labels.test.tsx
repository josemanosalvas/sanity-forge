import { SubscribeNewsletter } from "@repo/blocks/subscribe-newsletter";
import de from "@repo/internationalization/messages/de";
import { NextIntlClientProvider } from "next-intl";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { BlockLabels } from "./block-labels";

describe(BlockLabels, () => {
  test("hands the blocks their controls in the request's language", () => {
    const html = renderToStaticMarkup(
      <NextIntlClientProvider
        locale="de"
        messages={de}
        timeZone="Europe/Zurich"
      >
        <BlockLabels>
          <SubscribeNewsletter action="/api/subscribe" title="Newsletter" />
        </BlockLabels>
      </NextIntlClientProvider>
    );

    expect(html).toContain('aria-label="E-Mail-Adresse"');
    expect(html).toContain('placeholder="E-Mail-Adresse eingeben"');
    expect(html).toContain('aria-label="Newsletter abonnieren"');
    expect(html).toContain(">Abonnieren<");
    expect(html).not.toMatch(/Subscribe/u);
  });
});
