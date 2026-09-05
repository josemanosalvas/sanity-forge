import { getSite } from "@repo/internationalization/sites";
import { expect, test } from "vitest";

import { canonicalUrl, languageAlternates } from "./route";

const brandA = getSite("brand-a");
const brandB = getSite("brand-b");

test("canonical URLs use the production origin and clean default-locale paths", () => {
  expect(canonicalUrl({ site: brandA, locale: "en", path: "/about" })).toBe(
    "https://brand-a.example/about"
  );
  expect(canonicalUrl({ site: brandA, locale: "de", path: "/ueber-uns" })).toBe(
    "https://brand-a.example/de/ueber-uns"
  );
  expect(canonicalUrl({ site: brandA, locale: "fr", path: "/" })).toBe(
    "https://brand-a.example/fr"
  );
});

test("hreflang alternates follow CMS-driven localized slugs and add x-default", () => {
  expect(
    languageAlternates({
      site: brandA,
      locale: "de",
      path: "/ueber-uns",
      alternates: [
        { locale: "en", path: "/about" },
        { locale: "de", path: "/ueber-uns" },
        { locale: "fr", path: "/a-propos" },
      ],
    })
  ).toStrictEqual({
    en: "https://brand-a.example/about",
    de: "https://brand-a.example/de/ueber-uns",
    fr: "https://brand-a.example/fr/a-propos",
    "x-default": "https://brand-a.example/about",
  });
});

test("alternates never advertise locales the site does not serve", () => {
  expect(
    languageAlternates({
      site: brandB,
      locale: "en",
      path: "/pricing",
      alternates: [
        { locale: "en", path: "/pricing" },
        { locale: "fr", path: "/tarifs" },
      ],
    })
  ).toStrictEqual({
    en: "https://brand-b.example/pricing",
    "x-default": "https://brand-b.example/pricing",
  });
});

test("the current route is always part of its own alternates", () => {
  expect(
    languageAlternates({ site: brandB, locale: "de", path: "/preise" })
  ).toStrictEqual({
    de: "https://brand-b.example/de/preise",
  });
});
