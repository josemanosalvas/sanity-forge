import { NextRequest } from "next/server";
import type { NextResponse } from "next/server";
import { expect, test } from "vitest";

import { config, proxy } from "./proxy";

const run = (url: string, host: string) =>
  proxy(
    new NextRequest(url, { headers: { host } }),
    {} as never
  ) as NextResponse;

test("public URLs are rewritten to the site and locale the host and path resolve to", () => {
  const response = run("http://localhost:3000/de/ueber-uns", "brand-a.example");
  expect(response.headers.get("x-middleware-rewrite")).toBe(
    "http://localhost:3000/brand-a/de/ueber-uns"
  );
  expect(response.headers.get("x-site")).toBeNull();
});

test("an unknown host falls back to the default site", () => {
  const response = run("http://localhost:3000/about", "localhost:3000");
  expect(response.headers.get("x-middleware-rewrite")).toBe(
    "http://localhost:3000/brand-a/en/about"
  );
});

test("the site sitemap is served from the public sitemap.xml path", () => {
  const response = run("http://localhost:3000/sitemap.xml", "brand-b.example");
  expect(response.headers.get("x-middleware-rewrite")).toBe(
    "http://localhost:3000/sitemap/brand-b.xml"
  );
});

test("security headers allow the Studio to frame the site", () => {
  const response = run("http://localhost:3000/", "brand-a.example");
  expect(response.headers.get("content-security-policy")).toContain(
    "frame-ancestors 'self' http://localhost:3333"
  );
  expect(response.headers.get("x-content-type-options")).toBe("nosniff");
});

test("the matcher skips API routes and static files", () => {
  expect(config.matcher).toHaveLength(2);
  const [pattern] = config.matcher;
  const matches = (path: string) => new RegExp(`^${pattern}$`).test(path);
  expect(matches("/about")).toBeTruthy();
  expect(matches("/de/ueber-uns")).toBeTruthy();
  expect(matches("/api/draft-mode/enable")).toBeFalsy();
  expect(matches("/favicon.ico")).toBeFalsy();
  expect(matches("/robots.txt")).toBeFalsy();
  expect(matches("/sitemap/brand-a.xml")).toBeFalsy();
});
