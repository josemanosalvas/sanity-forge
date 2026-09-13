import { SiteProvider } from "@repo/internationalization/navigation";
import { getSite } from "@repo/internationalization/sites";
import {
  NavigationMenu,
  NavigationMenuList,
} from "@repo/ui/components/navigation-menu";
import { NextIntlClientProvider } from "next-intl";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { NavItems } from "./nav-items";
import type { NavColumns } from "./nav-items";

// oxlint-disable-next-line no-script-url -- unsafe scheme under test
const UNSAFE_HREF = "javascript:alert(1)";

const columns = [
  {
    _key: "about",
    _type: "navigationLink",
    href: "/de/ueber-uns",
    name: "Über uns",
  },
  {
    _key: "contact",
    _type: "navigationLink",
    href: "/de/kontakt",
    name: "Kontakt",
  },
  {
    _key: "xss",
    _type: "navigationLink",
    href: UNSAFE_HREF,
    name: "Angriff",
  },
] as unknown as NavColumns;

const render = (pathname: string | null) =>
  renderToStaticMarkup(
    <NextIntlClientProvider locale="de" messages={{}}>
      <SiteProvider site={getSite("brand-a")}>
        <NavigationMenu>
          <NavigationMenuList>
            <NavItems columns={columns} pathname={pathname} />
          </NavigationMenuList>
        </NavigationMenu>
      </SiteProvider>
    </NextIntlClientProvider>
  );

const linkTag = (html: string, href: string) =>
  html.match(new RegExp(`<a[^>]*href="${href}"[^>]*>`, "u"))?.[0] ?? "";

describe(NavItems, () => {
  test("marks only the link that matches the pathname as the current page", () => {
    const html = render("/de/ueber-uns");
    expect(linkTag(html, "/de/ueber-uns")).toContain('aria-current="page"');
    expect(linkTag(html, "/de/kontakt")).not.toContain("aria-current");
  });

  test("marks nothing without a pathname, which is what the prerendered fallback shows", () => {
    const html = render(null);
    expect(html).toContain('href="/de/ueber-uns"');
    expect(html).toContain('href="/de/kontakt"');
    expect(html).not.toContain("aria-current");
  });

  test("drops a column whose href fails the protocol allowlist", () => {
    const html = render(null);
    expect(html).not.toContain(UNSAFE_HREF);
    expect(html).not.toContain("Angriff");
  });
});
