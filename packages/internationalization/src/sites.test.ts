import { describe, expect, test } from "vitest";

import {
  defaultSiteKey,
  getAllSiteOrigins,
  getDefaultLocale,
  getSite,
  getSiteOrigin,
  resolveSiteFromHost,
  siteSupportsLocale,
} from "./sites";

describe("src/sites", () => {
  test("known hosts resolve to their site, with www and case variants", () => {
    expect(resolveSiteFromHost("brand-a.example")?.key).toBe("brand-a");
    expect(resolveSiteFromHost("www.brand-a.example")?.key).toBe("brand-a");
    expect(resolveSiteFromHost("Brand-B.example")?.key).toBe("brand-b");
    expect(resolveSiteFromHost("brand-b.localhost:3000")?.key).toBe("brand-b");
  });

  test("unknown hosts do not resolve, so callers can fall back deliberately", () => {
    expect(resolveSiteFromHost("localhost:3000")).toBeUndefined();
    expect(resolveSiteFromHost("preview-abc.vercel.app")).toBeUndefined();
    expect(resolveSiteFromHost(null)).toBeUndefined();
    expect(defaultSiteKey).toBe("brand-a");
  });

  test("sites have their own locale sets and default locales", () => {
    const brandA = getSite("brand-a");
    const brandB = getSite("brand-b");
    expect(getDefaultLocale(brandA)).toBe("en");
    expect(siteSupportsLocale(brandA, "fr")).toBeTruthy();
    expect(siteSupportsLocale(brandB, "fr")).toBeFalsy();
    expect(siteSupportsLocale(brandB, "de")).toBeTruthy();
    expect(siteSupportsLocale(brandB, "xx")).toBeFalsy();
  });

  test("origins are derived per environment and enumerated for Presentation", () => {
    expect(getSiteOrigin("brand-a")).toBe("https://brand-a.example");
    expect(getSiteOrigin("brand-a", "development")).toBe(
      "http://brand-a.localhost:3000"
    );
    expect(getAllSiteOrigins()).toStrictEqual([
      "https://brand-a.example",
      "http://brand-a.localhost:3000",
      "https://brand-b.example",
      "http://brand-b.localhost:3000",
    ]);
  });
});
