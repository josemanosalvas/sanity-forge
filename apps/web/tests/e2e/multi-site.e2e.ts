import { expect, test } from "@playwright/test";

// These assertions work with an empty dataset; rendering still needs a valid project and Viewer token.
test.describe("Routing", { tag: "@smoke" }, () => {
  test("an explicit default-locale prefix redirects to the clean URL", async ({
    request,
  }) => {
    const response = await request.get("/en/about", {
      headers: { host: "brand-a.example" },
      maxRedirects: 0,
    });
    expect(response.status()).toBe(308);
    expect(response.headers().location).toMatch(/\/about$/u);
  });

  test("security headers allow the Studio to frame the site", async ({
    request,
  }) => {
    const response = await request.get("/", {
      headers: { host: "brand-a.example" },
      maxRedirects: 0,
    });
    expect([200, 404]).toContain(response.status());
    expect(response.headers()["content-security-policy"]).toContain(
      "frame-ancestors"
    );
    expect(response.headers()["x-content-type-options"]).toBe("nosniff");
  });

  for (const [site, path, locale] of [
    ["brand-a", "/", "en"],
    ["brand-b", "/", "en"],
    ["brand-a", "/de", "de"],
    ["brand-b", "/de", "de"],
  ] as const) {
    test(`${site}${path} renders its own ${locale} shell`, async ({
      request,
    }) => {
      const response = await request.get(path, {
        headers: { host: `${site}.example` },
      });
      expect([200, 404]).toContain(response.status());
      const html = await response.text();
      expect(html).toContain(`data-site="${site}"`);
      expect(html).toContain(`lang="${locale}"`);
    });
  }

  test("internal routes are not reachable directly on another host", async ({
    request,
  }) => {
    const headers = { host: "brand-b.example" };
    await Promise.all(
      ["/brand-a/en", "/sitemap/brand-a.xml", "/robots/brand-a"].map(
        async (path) => {
          const response = await request.get(path, { headers });
          expect(response.status(), path).toBe(404);
          const html = await response.text();
          expect(html, path).toContain('data-site="brand-b"');
        }
      )
    );
  });

  test("an unsupported locale returns 404", async ({ request }) => {
    const response = await request.get("/fr", {
      headers: { host: "brand-b.example" },
    });
    expect(response.status()).toBe(404);
  });

  for (const site of ["brand-a", "brand-b"]) {
    test(`${site} serves its own robots and sitemap`, async ({ request }) => {
      const headers = { host: `${site}.example` };
      const robots = await request.get("/robots.txt", { headers });
      expect(robots.status()).toBe(200);
      expect(await robots.text()).toContain(
        `Sitemap: https://${site}.example/sitemap.xml`
      );
      const sitemap = await request.get("/sitemap.xml", { headers });
      expect(sitemap.status()).toBe(200);
      expect(sitemap.headers()["content-type"]).toContain("xml");
      const other = site === "brand-a" ? "brand-b" : "brand-a";
      expect(await sitemap.text()).not.toContain(`https://${other}.example`);
    });
  }
});

test.describe("Published content", { tag: "@content" }, () => {
  test.skip(
    process.env.E2E_HAS_CONTENT !== "true",
    "Requires published home pages for both sites"
  );

  for (const site of ["brand-a", "brand-b"]) {
    test(`${site} has a published home page and sitemap entry`, async ({
      request,
    }) => {
      const headers = { host: `${site}.example` };
      const response = await request.get("/", { headers });
      expect(response.status()).toBe(200);
      expect(await response.text()).toContain(`data-site="${site}"`);
      const sitemap = await request.get("/sitemap.xml", { headers });
      expect(sitemap.status()).toBe(200);
      expect(await sitemap.text()).toContain(`https://${site}.example`);
    });
  }
});
