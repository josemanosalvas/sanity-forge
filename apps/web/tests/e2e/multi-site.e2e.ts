import { expect, test } from "@playwright/test";

// These assertions work with an empty dataset; rendering still needs a valid project and Viewer token.

// A missing page keeps HTTP 404, but Next serves a bare shell and renders the
// site's not-found page on the client, so the layout is only in the payload.
const expectSiteShell = (
  html: string,
  site: string,
  locale: string,
  label = site
) => {
  const attributes =
    html.includes(`data-site="${site}"`) && html.includes(`lang="${locale}"`);
  const payload =
    html.includes(`\\"data-site\\":\\"${site}\\"`) &&
    html.includes(`\\"lang\\":\\"${locale}\\"`);
  expect(attributes || payload, label).toBe(true);
};

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
      expectSiteShell(await response.text(), site, locale);
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
          expectSiteShell(await response.text(), "brand-b", "en", path);
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

  test("a slug the CMS does not have returns a branded 404", async ({
    request,
  }) => {
    const response = await request.get("/this-page-does-not-exist", {
      headers: { host: "brand-a.example" },
    });
    expect(response.status()).toBe(404);
    const html = await response.text();
    expectSiteShell(html, "brand-a", "en");
    expect(html).toContain("Return home");
  });

  test("a dotted path that matches no file returns the global 404", async ({
    request,
  }) => {
    const response = await request.get("/about.html", {
      headers: { host: "brand-a.example" },
    });
    expect(response.status()).toBe(404);
    expect(await response.text()).toContain("Return home");
  });

  test("the www twin of a production host redirects to the canonical host", async ({
    request,
  }) => {
    const response = await request.get("/about", {
      headers: { host: "www.brand-a.example" },
      maxRedirects: 0,
    });
    expect(response.status()).toBe(308);
    expect(response.headers().location).toBe("https://brand-a.example/about");
  });

  test("API responses carry the transport security headers", async ({
    request,
  }) => {
    const response = await request.post("/api/revalidate", {
      headers: { host: "brand-a.example" },
    });
    expect([400, 401, 501]).toContain(response.status());
    expect(response.headers()["x-content-type-options"]).toBe("nosniff");
    expect(response.headers()["referrer-policy"]).toBe(
      "strict-origin-when-cross-origin"
    );
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
      const html = await response.text();
      expect(html).toContain(`data-site="${site}"`);
      expect(html).toMatch(/<main[^>]*>[\s\S]*<h1/u);
      // Next applies trailingSlash to metadata URLs, so the root canonical has no slash.
      expect(html).toContain(
        `<link rel="canonical" href="https://${site}.example"/>`
      );
      expect(html).toMatch(/property="og:title" content="[^"]+"/u);
      expect(html).toContain('type="application/ld+json"');
      if (process.env.SANITY_API_READ_TOKEN) {
        expect(html).not.toContain(process.env.SANITY_API_READ_TOKEN);
      }
      const sitemap = await request.get("/sitemap.xml", { headers });
      expect(sitemap.status()).toBe(200);
      expect(await sitemap.text()).toContain(`https://${site}.example`);
    });
  }

  test("switching language navigates without a document load", async ({
    page,
  }) => {
    const base = new URL(
      process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000"
    );
    const local =
      base.hostname === "localhost" || base.hostname === "127.0.0.1";
    const origin = local
      ? `${base.protocol}//brand-a.localhost${base.port ? `:${base.port}` : ""}`
      : base.origin;
    await page.goto(`${origin}/`);
    await page.evaluate(() => Reflect.set(window, "e2eStamp", "kept"));
    await page.getByRole("button", { name: "Switch language" }).first().click();
    await page.getByRole("menuitem", { name: "Deutsch" }).click();
    await page.waitForURL(/\/de(?:\/|$)/u);
    await expect(page.locator("html")).toHaveAttribute("lang", "de");
    expect(await page.evaluate(() => Reflect.get(window, "e2eStamp"))).toBe(
      "kept"
    );
  });
});
