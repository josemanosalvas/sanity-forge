import { describe, expect, test } from "vitest";

import {
  hostMatcher,
  isRedirectDestination,
  isRedirectSource,
} from "./redirects";

describe("redirect paths", () => {
  test.each(["/", "/old-page", "/de/alte-seite", "/files/report-2024.pdf"])(
    "accepts the plain public path %s",
    (path) => {
      expect(isRedirectSource(path)).toBeTruthy();
      expect(isRedirectDestination(path)).toBeTruthy();
    }
  );

  test.each([
    "/pricing(old)",
    "/blog/:year",
    "/docs/*",
    "/a+b",
    "/what?",
    "/{x}",
    "old-page",
    "/old-page/",
    "//evil.com",
    "/with space",
    "https://example.com/x",
  ])("rejects %s as a source", (path) => {
    expect(isRedirectSource(path)).toBeFalsy();
  });

  test("a destination may carry a query string but no path-to-regexp syntax", () => {
    expect(
      isRedirectDestination("/new-page?ref=old&utm_source=x")
    ).toBeTruthy();
    expect(isRedirectDestination("/new-page?ref=(old)")).toBeFalsy();
    expect(isRedirectDestination("/new/:slug")).toBeFalsy();
  });

  test("hosts are escaped for Next's regex matching", () => {
    expect(hostMatcher("brand-a.example")).toBe(String.raw`brand-a\.example`);
    expect(
      new RegExp(`^${hostMatcher("brand-a.example")}$`, "u").test(
        "brand-aXexample"
      )
    ).toBeFalsy();
  });
});
