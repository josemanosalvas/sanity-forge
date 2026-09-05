import { describe, expect, test } from "vitest";

import { locales } from "./locales";
import { localizePath, parsePathname } from "./routing";
import { getSite } from "./sites";

describe("src/routing", () => {
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
      hadPrefix: true,
      locale: "de",
      pathname: "/ueber-uns",
    });
    expect(parsePathname(brandA, "/about", locales)).toStrictEqual({
      hadPrefix: false,
      locale: "en",
      pathname: "/about",
    });
    expect(parsePathname(brandA, "/", locales)).toStrictEqual({
      hadPrefix: false,
      locale: "en",
      pathname: "/",
    });
  });

  test("a locale another site serves is rejected rather than adopted", () => {
    expect(parsePathname(brandB, "/fr/a-propos", locales)).toStrictEqual({
      hadPrefix: false,
      locale: "en",
      pathname: "/fr/a-propos",
      unsupportedLocale: "fr",
    });
  });
});
