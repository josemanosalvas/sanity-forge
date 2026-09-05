import type { SlugValidationContext } from "sanity";
import { describe, expect, test, vi } from "vitest";

import {
  createSlugErrorValidator,
  getDocumentTypeConfig,
  isUniqueSlug,
} from "./slug-validation";

describe("page slugs", () => {
  const validate = createSlugErrorValidator(getDocumentTypeConfig("page"));

  test.each(["/", "/about", "/products/cloud"])(
    "accepts the public path %s",
    // The validator returns `true` or an error string, so "no string" is exact.
    (current) =>
      expect(validate({ current })).not.toStrictEqual(expect.any(String))
  );

  test.each([
    "/de/about",
    "/api/subscribe",
    "/sitemap/brand-a",
    "/robots/brand-a",
    "/monitoring",
  ])("rejects the reserved route %s", (current) =>
    expect(validate({ current })).toStrictEqual(expect.any(String))
  );

  test.each(["home", "drafts.home", "versions.release.home"])(
    "checks the site and language without conflicting with %s",
    async (_id) => {
      const fetch = vi.fn<() => Promise<boolean>>().mockResolvedValue(true);
      const context = {
        document: { _id, _type: "page", language: "de", site: "brand-b" },
        getClient: () => ({ fetch }),
      } as unknown as SlugValidationContext;

      await expect(isUniqueSlug("/", context)).resolves.toBeTruthy();
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("!sanity::versionOf($published)"),
        {
          language: "de",
          published: "home",
          site: "brand-b",
          slug: "/",
          type: "page",
        },
        { perspective: "raw" }
      );

      fetch.mockResolvedValue(false);
      await expect(isUniqueSlug("/", context)).resolves.toBeFalsy();
    }
  );
});
