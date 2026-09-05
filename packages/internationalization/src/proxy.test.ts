import { NextRequest } from "next/server";
import { describe, expect, test } from "vitest";

import { resolveSite, rewriteToSiteRoute } from "./proxy";

const request = (url: string, host: string) =>
  new NextRequest(url, { headers: { host } });

describe("src/proxy", () => {
  test("the site comes from the Host header, not the server URL", () => {
    expect(
      resolveSite(request("http://localhost:3000/", "brand-b.example")).key
    ).toBe("brand-b");
    expect(
      resolveSite(request("http://localhost:3000/", "localhost:3000")).key
    ).toBe("brand-a");
    expect(
      resolveSite(
        request("http://localhost:3000/", "localhost:3000"),
        "brand-b"
      ).key
    ).toBe("brand-b");
  });

  test("x-forwarded-host wins behind a proxy", () => {
    const req = new NextRequest("http://localhost:3000/", {
      headers: { host: "internal:3000", "x-forwarded-host": "brand-b.example" },
    });
    expect(resolveSite(req).key).toBe("brand-b");
  });

  test("public paths are rewritten to the internal site + locale route", () => {
    const site = resolveSite(
      request("http://brand-a.example/about?ref=1", "brand-a.example")
    );
    const { response, context } = rewriteToSiteRoute(
      request("http://brand-a.example/about?ref=1", "brand-a.example"),
      site
    );
    expect(context).toStrictEqual({ locale: "en", site: "brand-a" });
    expect(response.headers.get("x-middleware-rewrite")).toBe(
      "http://brand-a.example/brand-a/en/about?ref=1"
    );
  });

  test("localized paths keep their locale and the root maps cleanly", () => {
    const site = resolveSite(
      request("http://brand-a.example/", "brand-a.example")
    );
    expect(
      rewriteToSiteRoute(
        request("http://brand-a.example/de/ueber-uns", "brand-a.example"),
        site
      ).response.headers.get("x-middleware-rewrite")
    ).toBe("http://brand-a.example/brand-a/de/ueber-uns");
    expect(
      rewriteToSiteRoute(
        request("http://brand-a.example/fr", "brand-a.example"),
        site
      ).response.headers.get("x-middleware-rewrite")
    ).toBe("http://brand-a.example/brand-a/fr");
  });

  test("an explicit default-locale prefix redirects to the clean URL", () => {
    const site = resolveSite(
      request("http://brand-a.example/", "brand-a.example")
    );
    const { response } = rewriteToSiteRoute(
      request("http://brand-a.example/en/about", "brand-a.example"),
      site
    );
    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      "http://brand-a.example/about"
    );
  });

  test("a locale the site does not serve is left for the page to 404", () => {
    const site = resolveSite(
      request("http://brand-b.example/", "brand-b.example")
    );
    const { response, context } = rewriteToSiteRoute(
      request("http://brand-b.example/fr/a-propos", "brand-b.example"),
      site
    );
    expect(context.locale).toBe("en");
    expect(response.headers.get("x-middleware-rewrite")).toBe(
      "http://brand-b.example/brand-b/en/fr/a-propos"
    );
  });
});
