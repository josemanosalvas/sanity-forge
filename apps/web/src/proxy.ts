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
  if (pathname === "/sitemap.xml") {
    const url = request.nextUrl.clone();
    url.pathname = `/sitemap/${site.key}.xml`;
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
    // Everything except API routes, Next internals, per-site sitemaps, robots
    // and static files. `/sitemap.xml` is opted back in so it can be routed
    // to the site's own sitemap.
    "/((?!api/|monitoring|_next/|sitemap/|robots\\.txt|.*\\..*).*)",
    "/sitemap.xml",
  ],
};
