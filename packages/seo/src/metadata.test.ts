import { getSite } from "@repo/internationalization/sites";
import { describe, expect, test } from "vitest";

import { createMetadata, titleTemplate } from "./metadata";

describe(createMetadata, () => {
  test("writes og:locale as the locale's region tag with an underscore", () => {
    const metadata = createMetadata({
      route: { locale: "de", path: "/ueber-uns", site: getSite("brand-a") },
      siteName: "Brand A",
    });
    expect(metadata.openGraph).toMatchObject({
      locale: "de_DE",
      siteName: "Brand A",
    });
  });

  test("page titles are bare so the layout template appends the site name", () => {
    const route = {
      locale: "en" as const,
      path: "/about",
      site: getSite("brand-a"),
    };
    expect(
      createMetadata({ route, siteName: "Brand A", title: "About" }).title
    ).toBe("About");
    expect(titleTemplate("Brand A")).toBe("%s | Brand A");
    // Social titles are always complete.
    expect(
      createMetadata({ route, siteName: "Brand A", title: "About" }).openGraph
    ).toMatchObject({ title: "About | Brand A" });
  });

  test("titles that already carry the site name opt out of the template", () => {
    const route = {
      locale: "en" as const,
      path: "/",
      site: getSite("brand-a"),
    };
    expect(
      createMetadata({ route, siteName: "Brand A", title: "Brand A Newsroom" })
        .title
    ).toStrictEqual({ absolute: "Brand A Newsroom" });
    expect(createMetadata({ route, siteName: "Brand A" }).title).toStrictEqual({
      absolute: "Brand A",
    });
  });

  test("canonical, hreflang, Open Graph image and Twitter card are absolute and sized", () => {
    const metadata = createMetadata({
      image: "https://cdn.sanity.io/images/p/d/og.jpg?w=1200&h=630",
      route: {
        alternates: [{ locale: "en", path: "/about" }],
        locale: "de",
        path: "/ueber-uns",
        site: getSite("brand-a"),
      },
      siteName: "Brand A",
      title: "Über uns",
    });
    expect(metadata.alternates).toMatchObject({
      canonical: "https://brand-a.example/de/ueber-uns",
      languages: {
        de: "https://brand-a.example/de/ueber-uns",
        en: "https://brand-a.example/about",
        "x-default": "https://brand-a.example/about",
      },
    });
    expect(metadata.openGraph?.images).toStrictEqual([
      {
        alt: "Über uns | Brand A",
        height: 630,
        url: "https://cdn.sanity.io/images/p/d/og.jpg?w=1200&h=630",
        width: 1200,
      },
    ]);
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image" });
    expect(metadata.metadataBase?.toString()).toBe("https://brand-a.example/");
  });

  test("without an image the Twitter card degrades to summary", () => {
    const metadata = createMetadata({
      route: { locale: "en", path: "/", site: getSite("brand-b") },
      siteName: "Brand B",
    });
    expect(metadata.twitter).toMatchObject({ card: "summary" });
    expect(metadata.openGraph?.images).toBeUndefined();
  });
});
