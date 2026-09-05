import { NextRequest } from "next/server";
import type { NextResponse } from "next/server";
import { describe, expect, test } from "vitest";

import { config, proxy } from "./proxy";

const run = (url: string, host: string) =>
  proxy(
    new NextRequest(url, { headers: { host } }),
    {} as never
  ) as NextResponse;

const matchesPagePattern = (path: string) => {
  const [pattern] = config.matcher;
  return new RegExp(`^${pattern}$`, "u").test(path);
};

describe(proxy, () => {
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

  test("security headers allow the Studio to frame the site", () => {
    const response = run("http://localhost:3000/", "brand-a.example");
    expect(response.headers.get("content-security-policy")).toContain(
      "frame-ancestors 'self' http://localhost:3333"
    );
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
  });

  test("the matcher has a page pattern plus the sitemap and robots paths", () => {
    expect(config.matcher).toStrictEqual([
      expect.any(String),
      "/sitemap.xml",
      "/robots.txt",
    ]);
  });

  test.each(["/about", "/de/ueber-uns"])(
    "the page pattern matches %s",
    (path) => {
      expect(matchesPagePattern(path)).toBeTruthy();
    }
  );

  test.each([
    "/api/draft-mode/enable",
    "/favicon.ico",
    "/robots.txt",
    "/robots/brand-a",
    "/sitemap/brand-a.xml",
  ])("the page pattern skips %s", (path) => {
    expect(matchesPagePattern(path)).toBeFalsy();
  });
});
