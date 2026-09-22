import { NextRequest } from "next/server";
import type { NextResponse } from "next/server";
import { describe, expect, test, vi } from "vitest";

import { config, proxy } from "./proxy";

const run = (url: string, host: string) =>
  proxy(
    new NextRequest(url, { headers: { host } }),
    {} as never
  ) as NextResponse;

const matchesPattern = (path: string) => {
  const [pattern] = config.matcher;
  return new RegExp(`^${pattern}$`, "u").test(path);
};

describe(proxy, () => {
  test("configured Google Analytics can load its script and send events", async () => {
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "G-TEST");
    vi.resetModules();
    try {
      const { proxy: configuredProxy } = await import("./proxy");
      const response = configuredProxy(
        new NextRequest("http://localhost:3000/", {
          headers: { host: "brand-a.example" },
        }),
        {} as never
      ) as NextResponse;
      const csp = response.headers.get("content-security-policy");
      expect(csp).toMatch(
        /script-src[^;]*https:\/\/www\.googletagmanager\.com/u
      );
      expect(csp).toMatch(
        /connect-src[^;]*https:\/\/\*\.google-analytics\.com/u
      );
      expect(csp).toMatch(
        /connect-src[^;]*https:\/\/\*\.analytics\.google\.com/u
      );
    } finally {
      vi.unstubAllEnvs();
      vi.resetModules();
    }
  });

  test("public URLs are rewritten to the site and locale the host and path resolve to", () => {
    const response = run(
      "http://localhost:3000/de/ueber-uns",
      "brand-a.example"
    );
    expect(response.headers.get("x-middleware-rewrite")).toBe(
      "http://localhost:3000/brand-a/de/ueber-uns"
    );
  });

  test("an unknown host falls back to the default site", () => {
    const response = run("http://localhost:3000/about", "localhost:3000");
    expect(response.headers.get("x-middleware-rewrite")).toBe(
      "http://localhost:3000/brand-a/en/about"
    );
  });

  test("the site sitemap is served from the public sitemap.xml path", () => {
    const response = run(
      "http://localhost:3000/sitemap.xml",
      "brand-b.example"
    );
    expect(response.headers.get("x-middleware-rewrite")).toBe(
      "http://localhost:3000/sitemap/brand-b.xml"
    );
  });

  test("the site robots.txt is served from the public robots.txt path", () => {
    const response = run("http://localhost:3000/robots.txt", "brand-b.example");
    expect(response.headers.get("x-middleware-rewrite")).toBe(
      "http://localhost:3000/robots/brand-b"
    );
  });

  test.each([
    ["/brand-a/en/about", "/brand-b/en/brand-a/en/about"],
    ["/brand-a/en/x.y", "/brand-b/en/brand-a/en/x.y"],
    ["/sitemap/brand-a.xml", "/brand-b/en/sitemap/brand-a.xml"],
    ["/robots/brand-a", "/brand-b/en/robots/brand-a"],
  ])(
    "a direct request to the internal route %s is a public path on the requesting site",
    (path, rewritten) => {
      const response = run(`http://localhost:3000${path}`, "brand-b.example");
      expect(response.headers.get("x-middleware-rewrite")).toBe(
        `http://localhost:3000${rewritten}`
      );
      expect(response.headers.get("content-security-policy")).toBeTruthy();
    }
  );

  test.each([
    ["/brand%2Da/en/x.y", "/brand-b/en/brand%2Da/en/x.y"],
    ["/brand-a%2Fen/x.y", "/brand-b/en/brand-a%2Fen/x.y"],
    ["/%73itemap/brand-a.xml", "/brand-b/en/%73itemap/brand-a.xml"],
  ])(
    "an encoded internal route %s is classified by its decoded form",
    (path, rewritten) => {
      const response = run(`http://localhost:3000${path}`, "brand-b.example");
      expect(response.headers.get("x-middleware-rewrite")).toBe(
        `http://localhost:3000${rewritten}`
      );
    }
  );

  test("a malformed escape in a file path still passes through", () => {
    const response = run(
      "http://localhost:3000/downloads/%zz-report.pdf",
      "brand-a.example"
    );
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  test.each([
    "/fonts/brand.woff2",
    "/.well-known/apple-app-site-association",
    "/.well-known/acme-challenge/token",
  ])("the public/ file %s passes through with security headers", (path) => {
    const response = run(`http://localhost:3000${path}`, "brand-a.example");
    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
  });

  test("security headers allow the Studio to frame the site", () => {
    const response = run("http://localhost:3000/", "brand-a.example");
    expect(response.headers.get("content-security-policy")).toContain(
      "frame-ancestors 'self' http://localhost:3333"
    );
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
  });

  test.each([
    "/",
    "/about",
    "/de/ueber-uns",
    "/robots.txt",
    "/sitemap.xml",
    "/favicon.ico",
    "/brand-a/en/about",
    "/sitemap/brand-a.xml",
    "/monitoring-report",
  ])("the matcher includes %s", (path) => {
    expect(matchesPattern(path)).toBeTruthy();
  });

  test.each([
    "/api/draft-mode/enable",
    "/_next/static/chunk.js",
    "/_next/image",
    "/monitoring",
    "/monitoring/tunnel",
    "/_vercel/insights/event",
    "/_vercel/speed-insights/vitals",
  ])("the matcher excludes %s", (path) => {
    expect(matchesPattern(path)).toBeFalsy();
  });

  test("the www twin of a production host is redirected before any rewrite", () => {
    const response = run(
      "http://www.brand-b.example/about",
      "www.brand-b.example"
    );
    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      "https://brand-b.example/about"
    );
    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
  });
});
