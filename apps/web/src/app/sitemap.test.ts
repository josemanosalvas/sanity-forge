import type { sanityFetchMetadata as fetchMetadata } from "@repo/sanity/live";
import { afterEach, describe, expect, test, vi } from "vitest";

import sitemap from "./sitemap";

// Typed after the real signature so the assertions below check real call shapes.
const { sanityFetchMetadata } = vi.hoisted(() => ({
  sanityFetchMetadata:
    vi.fn<(options: unknown) => Promise<{ data: unknown }>>(),
}));
vi.mock(import("@repo/sanity/live"), () => ({
  // `sanityFetchMetadata` is generic over the query string; a mock cannot be.
  sanityFetchMetadata: sanityFetchMetadata as unknown as typeof fetchMetadata,
}));

const build = (id: string) => sitemap({ id: Promise.resolve(id) });

describe("sitemap route", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    vi.resetAllMocks();
  });

  test("lists the site's published pages", async () => {
    sanityFetchMetadata.mockResolvedValue({
      data: [
        {
          language: "en",
          lastModified: "2025-01-02T03:04:05Z",
          slug: "/pricing",
          translations: [
            { language: "de", site: "brand-a", slug: "/preise" },
            // Another site's translation never leaks into this sitemap.
            { language: "de", site: "brand-b", slug: "/preise" },
          ],
        },
        // Locale the site does not serve.
        { language: "fr", slug: "/tarifs", translations: [] },
      ],
    });

    await expect(build("brand-b")).resolves.toStrictEqual([
      expect.objectContaining({
        alternates: {
          languages: {
            de: "https://brand-b.example/de/preise",
            en: "https://brand-b.example/pricing",
            "x-default": "https://brand-b.example/pricing",
          },
        },
        url: "https://brand-b.example/pricing",
      }),
    ]);
  });

  test("a failed read answers with an empty sitemap instead of a 500", async () => {
    const warn = vi.spyOn(console, "warn").mockReturnValue();
    sanityFetchMetadata.mockRejectedValue(new Error("Content Lake is down"));

    await expect(build("brand-a")).resolves.toStrictEqual([]);
    expect(warn).toHaveBeenCalledOnce();
  });

  test("a failed read still fails the production build", async () => {
    vi.stubEnv("NEXT_PHASE", "phase-production-build");
    sanityFetchMetadata.mockRejectedValue(new Error("Content Lake is down"));

    await expect(build("brand-a")).rejects.toThrow("Content Lake is down");
  });

  test("an unknown site is served an empty sitemap without a read", async () => {
    await expect(build("not-a-site")).resolves.toStrictEqual([]);
    expect(sanityFetchMetadata).not.toHaveBeenCalled();
  });
});
