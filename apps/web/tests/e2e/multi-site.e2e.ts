import { expect, test } from "@playwright/test";

/**
 * The parts of multi-site routing that need no Sanity content: host → site
 * resolution, locale handling and security headers all happen in the proxy
 * before any page renders.
 */
test.describe("Routing", { tag: "@smoke" }, () => {
  test("an explicit default-locale prefix redirects to the clean URL", async ({
    request,
  }) => {
    const response = await request.get("/en/about", {
      headers: { host: "brand-a.example" },
      maxRedirects: 0,
    });
    expect(response.status()).toBe(308);
    expect(response.headers().location).toMatch(/\/about$/);
  });

  test("security headers allow the Studio to frame the site", async ({
    request,
  }) => {
    const response = await request.get("/", {
      headers: { host: "brand-a.example" },
      maxRedirects: 0,
    });
    expect(response.headers()["content-security-policy"]).toContain(
      "frame-ancestors"
    );
    expect(response.headers()["x-content-type-options"]).toBe("nosniff");
  });
});

/**
 * These need a dataset with published home pages for both sites. They are
 * skipped when the run is not marked as having content.
 */
test.describe("Sites and locales", { tag: "@content" }, () => {
  test.skip(
    process.env.E2E_HAS_CONTENT !== "true",
    "Requires a configured Sanity dataset"
  );

  test("each host renders its own site and default locale", async ({
    page,
  }) => {
    await page.setExtraHTTPHeaders({ host: "brand-a.example" });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-site", "brand-a");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");

    await page.setExtraHTTPHeaders({ host: "brand-b.example" });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-site", "brand-b");
  });

  test("a shared locale renders on both sites and an unsupported one is a 404", async ({
    page,
  }) => {
    await page.setExtraHTTPHeaders({ host: "brand-a.example" });
    await page.goto("/de");
    await expect(page.locator("html")).toHaveAttribute("lang", "de");

    await page.setExtraHTTPHeaders({ host: "brand-b.example" });
    const response = await page.goto("/fr");
    expect(response?.status()).toBe(404);
  });

  test("the sitemap is served per site", async ({ request }) => {
    const response = await request.get("/sitemap.xml", {
      headers: { host: "brand-a.example" },
    });
    expect(response.status()).toBe(200);
    expect(await response.text()).toContain("https://brand-a.example");
  });
});
