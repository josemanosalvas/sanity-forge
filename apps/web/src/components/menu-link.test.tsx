import { SiteProvider } from "@repo/internationalization/navigation";
import { getSite } from "@repo/internationalization/sites";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { MenuLink } from "./menu-link";

/**
 * Renders as the German edition of Brand A would. GROQ hands the navigation
 * hrefs with their locale prefix already in place; a link component that
 * localized again would show up here as `/de/de/…`.
 */
const renderOnGermanSite = (node: ReactNode) =>
  renderToStaticMarkup(
    <NextIntlClientProvider locale="de" messages={{}}>
      <SiteProvider site={getSite("brand-a")}>{node}</SiteProvider>
    </NextIntlClientProvider>
  );

describe(MenuLink, () => {
  test("renders a GROQ-localized internal href verbatim", () => {
    const html = renderOnGermanSite(
      <MenuLink
        description="Wer wir sind"
        href="/de/ueber-uns"
        name="Über uns"
      />
    );
    expect(html).toContain('href="/de/ueber-uns"');
    expect(html).not.toContain("/de/de/");
    expect(html).toContain("Über uns");
    expect(html).toContain("Wer wir sind");
  });

  test("renders an external href verbatim and marks new-tab links", () => {
    const html = renderOnGermanSite(
      <MenuLink href="https://example.com" name="Example" openInNewTab />
    );
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  test("renders nothing without an href", () => {
    expect(renderOnGermanSite(<MenuLink name="Broken" />)).toBe("");
  });
});
