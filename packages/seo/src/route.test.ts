import { getSite } from "@repo/internationalization/sites";
import { describe, expect, test } from "vitest";

import { canonicalUrl, languageAlternates } from "./route";

describe("src/route", () => {
  const brandA = getSite("brand-a");
  const brandB = getSite("brand-b");

  test("canonical URLs use the production origin and clean default-locale paths", () => {
    expect(canonicalUrl({ locale: "en", path: "/about", site: brandA })).toBe(
      "https://brand-a.example/about"
    );
    expect(
      canonicalUrl({ locale: "de", path: "/ueber-uns", site: brandA })
    ).toBe("https://brand-a.example/de/ueber-uns");
    expect(canonicalUrl({ locale: "fr", path: "/", site: brandA })).toBe(
      "https://brand-a.example/fr"
    );
  });

  test("hreflang alternates follow CMS-driven localized slugs and add x-default", () => {
    expect(
      languageAlternates({
        alternates: [
          { locale: "en", path: "/about" },
          { locale: "de", path: "/ueber-uns" },
          { locale: "fr", path: "/a-propos" },
        ],
        locale: "de",
        path: "/ueber-uns",
        site: brandA,
      })
    ).toStrictEqual({
      de: "https://brand-a.example/de/ueber-uns",
      en: "https://brand-a.example/about",
      fr: "https://brand-a.example/fr/a-propos",
      "x-default": "https://brand-a.example/about",
    });
  });

  test("alternates never advertise locales the site does not serve", () => {
    expect(
      languageAlternates({
        alternates: [
          { locale: "en", path: "/pricing" },
          { locale: "fr", path: "/tarifs" },
        ],
        locale: "en",
        path: "/pricing",
        site: brandB,
      })
    ).toStrictEqual({
      en: "https://brand-b.example/pricing",
      "x-default": "https://brand-b.example/pricing",
    });
  });

  test("the current route is always part of its own alternates", () => {
    expect(
      languageAlternates({ locale: "de", path: "/preise", site: brandB })
    ).toStrictEqual({
      de: "https://brand-b.example/de/preise",
    });
  });
});
