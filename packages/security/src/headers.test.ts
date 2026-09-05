import { describe, expect, test } from "vitest";

import { createSecurityHeaders } from "./headers";

describe(createSecurityHeaders, () => {
  const framed = createSecurityHeaders({
    frameAncestors: ["http://localhost:3333"],
  });
  const framedCsp = framed.get("content-security-policy") ?? "";

  test("the Studio origin may frame the site", () => {
    expect(framedCsp).toContain("frame-ancestors 'self' http://localhost:3333");
    expect(framed.get("x-frame-options")).toBeNull();
    expect(framed.get("cross-origin-embedder-policy")).toBeNull();
  });

  test("Sanity APIs and the image CDN stay reachable", () => {
    expect(framedCsp).toContain("https://*.api.sanity.io");
    expect(framedCsp).toContain(
      "img-src 'self' blob: data: https://cdn.sanity.io"
    );
    expect(framed.get("permissions-policy")).toContain("camera=()");
  });

  test("without frame ancestors the site refuses to be framed cross-origin", () => {
    const headers = createSecurityHeaders();
    expect(headers.get("content-security-policy")).toContain(
      "frame-ancestors 'none'"
    );
    expect(headers.get("x-frame-options")).toBe("SAMEORIGIN");
  });

  test("CSP can be switched off while the remaining headers stay", () => {
    const headers = createSecurityHeaders({ contentSecurityPolicy: false });
    expect(headers.get("content-security-policy")).toBeNull();
    expect(headers.get("x-content-type-options")).toBe("nosniff");
    expect(headers.get("referrer-policy")).toBe(
      "strict-origin-when-cross-origin"
    );
  });
});
