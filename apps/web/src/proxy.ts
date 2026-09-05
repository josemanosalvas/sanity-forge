import {
  resolveSite,
  rewriteToSiteRoute,
} from "@repo/internationalization/proxy";
import { siteKeys } from "@repo/internationalization/sites";
import { applySecurityHeaders } from "@repo/security/proxy";
import { NextResponse } from "next/server";
import type { NextProxy } from "next/server";

import { env } from "@/env";

const studioOrigin = new URL(env.NEXT_PUBLIC_SANITY_STUDIO_URL).origin;
const googleScriptSources = env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  ? ["https://www.googletagmanager.com"]
  : [];
const googleAnalyticsSources = env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  ? [
      "https://*.google-analytics.com",
      "https://*.analytics.google.com",
      ...googleScriptSources,
    ]
  : [];

/**
 * Routes that exist only behind the rewrites below. Requested directly they
 * are treated as ordinary public paths, so `brand-b.example/brand-a/en` or
 * `/sitemap/brand-a.xml` renders brand-b's 404 page instead of another
 * site's content.
 */
const internalPrefixes = [
  ...siteKeys.map((key) => `/${key}`),
  "/sitemap",
  "/robots",
];
const isInternalPath = (pathname: string) =>
  internalPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

/**
 * Anything with a dot anywhere is a file in `public/` (pages never contain
 * one, see slug validation), including extensionless files in dotted folders
 * such as `/.well-known/apple-app-site-association`.
 */
const isStaticFile = (pathname: string) =>
  pathname.includes(".") && !isInternalPath(pathname);

/**
 * Next's router decodes route params, so `/brand%2Da/en/x.y` reaches the
 * `[site]` segment as `brand-a`. Classify the decoded form so an encoded
 * internal path cannot pose as a static file. A malformed escape keeps the
 * raw path; Next rejects it downstream.
 */
const decodePathname = (pathname: string) => {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return pathname;
  }
};

/**
 * Every request: Host → site, path → locale, then an internal rewrite to
 * `/[site]/[locale]/…` so public URLs stay clean. Security headers are
 * applied to the final response, whatever kind it is.
 */
export const proxy: NextProxy = (request) => {
  const site = resolveSite(request, env.DEFAULT_SITE);
  const pathname = decodePathname(request.nextUrl.pathname);

  let response: NextResponse;
  if (pathname === "/sitemap.xml" || pathname === "/robots.txt") {
    const url = request.nextUrl.clone();
    url.pathname =
      pathname === "/sitemap.xml"
        ? `/sitemap/${site.key}.xml`
        : `/robots/${site.key}`;
    response = NextResponse.rewrite(url);
  } else if (isStaticFile(pathname)) {
    response = NextResponse.next();
  } else {
    ({ response } = rewriteToSiteRoute(request, site));
  }

  return applySecurityHeaders(response, {
    csp: {
      connectSrc: [
        "https://stream.mux.com",
        "https://inferred.litix.io",
        ...googleAnalyticsSources,
      ],
      imgSrc: ["https://image.mux.com", ...googleAnalyticsSources],
      mediaSrc: ["https://stream.mux.com"],
      scriptSrc: googleScriptSources,
    },
    frameAncestors: [studioOrigin],
  });
};

export const config = {
  // Everything except API routes, the Sentry tunnel (`/monitoring` itself,
  // not `/monitoring-report`) and Next internals. Static files and the
  // internal route namespace stay in scope so the proxy decides what they do.
  matcher: ["/((?!api/|monitoring(?:/|$)|_next/).*)"],
};
