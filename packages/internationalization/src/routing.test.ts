import { expect, test } from "vitest";

import { locales } from "./locales";
import { localizePath, parsePathname } from "./routing";
import { getSite } from "./sites";

const brandA = getSite("brand-a");
const brandB = getSite("brand-b");

test("default-locale paths stay clean and other locales are prefixed", () => {
  expect(localizePath(brandA, "en", "/about")).toBe("/about");
  expect(localizePath(brandA, "de", "/ueber-uns")).toBe("/de/ueber-uns");
  expect(localizePath(brandA, "fr", "/")).toBe("/fr");
  expect(localizePath(brandA, "de", "https://example.com")).toBe(
    "https://example.com"
  );
});

test("pathnames are parsed against the site's own locales", () => {
  expect(parsePathname(brandA, "/de/ueber-uns", locales)).toStrictEqual({
    locale: "de",
    pathname: "/ueber-uns",
    hadPrefix: true,
  });
  expect(parsePathname(brandA, "/about", locales)).toStrictEqual({
    locale: "en",
    pathname: "/about",
    hadPrefix: false,
  });
  expect(parsePathname(brandA, "/", locales)).toStrictEqual({
    locale: "en",
    pathname: "/",
    hadPrefix: false,
  });
});

test("a locale another site serves is rejected rather than adopted", () => {
  expect(parsePathname(brandB, "/fr/a-propos", locales)).toStrictEqual({
    locale: "en",
    pathname: "/fr/a-propos",
    hadPrefix: false,
    unsupportedLocale: "fr",
  });
});
