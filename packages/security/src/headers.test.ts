import { describe, expect, test, vi } from "vitest";

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

  // Sanity file assets (hero video uploads) are served from the image CDN host.
  test("media uploaded to Sanity may play alongside caller-added media origins", () => {
    const headers = createSecurityHeaders({
      csp: { mediaSrc: ["https://stream.mux.com"] },
    });
    expect(headers.get("content-security-policy")).toMatch(
      /media-src 'self' blob: https:\/\/cdn\.sanity\.io https:\/\/stream\.mux\.com/u
    );
  });

  test("a loopback Studio origin is dropped from frame-ancestors in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.resetModules();
    try {
      const { createSecurityHeaders: create } = await import("./headers");
      const headers = create({
        frameAncestors: ["http://localhost:3333", "https://studio.example"],
      });
      const csp = headers.get("content-security-policy") ?? "";
      expect(csp).toContain("frame-ancestors 'self' https://studio.example");
      expect(csp).not.toContain("localhost:3333");

      const unconfigured = create({
        frameAncestors: ["http://localhost:3333"],
      });
      expect(unconfigured.get("content-security-policy")).toContain(
        "frame-ancestors 'none'"
      );
      expect(unconfigured.get("x-frame-options")).toBe("SAMEORIGIN");
    } finally {
      vi.unstubAllEnvs();
      vi.resetModules();
    }
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
