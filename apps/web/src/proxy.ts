import {
  resolveSite,
  rewriteToSiteRoute,
} from "@repo/internationalization/proxy";
import { applySecurityHeaders } from "@repo/security/proxy";
import { NextResponse } from "next/server";
import type { NextProxy } from "next/server";

import { env } from "@/env";

const studioOrigin = new URL(env.NEXT_PUBLIC_SANITY_STUDIO_URL).origin;

/**
 * Every request: Host → site, path → locale, then an internal rewrite to
 * `/[site]/[locale]/…` so public URLs stay clean. Security headers are
 * applied to the final response, whatever kind it is.
 */
export const proxy: NextProxy = (request) => {
  const site = resolveSite(request, env.DEFAULT_SITE);
  const { pathname } = request.nextUrl;

  let response: NextResponse;
  if (pathname === "/sitemap.xml" || pathname === "/robots.txt") {
    const url = request.nextUrl.clone();
    url.pathname =
      pathname === "/sitemap.xml"
        ? `/sitemap/${site.key}.xml`
        : `/robots/${site.key}`;
    response = NextResponse.rewrite(url);
  } else {
    ({ response } = rewriteToSiteRoute(request, site));
  }

  return applySecurityHeaders(response, {
    csp: {
      connectSrc: ["https://stream.mux.com", "https://inferred.litix.io"],
      imgSrc: ["https://image.mux.com"],
      mediaSrc: ["https://stream.mux.com"],
    },
    frameAncestors: [studioOrigin],
  });
};

export const config = {
  matcher: [
    // Everything except API routes, Next internals, the per-site sitemap and
    // robots routes, and static files. `/sitemap.xml` and `/robots.txt` are
    // opted back in so they can be routed to the site's own prerendered copy.
    "/((?!api/|monitoring|_next/|sitemap/|robots/|.*\\..*).*)",
    "/sitemap.xml",
    "/robots.txt",
  ],
};
