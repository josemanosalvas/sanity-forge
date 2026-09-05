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
});
