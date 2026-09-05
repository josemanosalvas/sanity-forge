import {
  resolveSite,
  rewriteToSiteRoute,
} from "@repo/internationalization/proxy";
import { siteKeys } from "@repo/internationalization/sites";
import { applySecurityHeaders } from "@repo/security/headers";
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

/** Prevent public requests from accessing another site through internal routes. */
const internalPrefixes = [
  ...siteKeys.map((key) => `/${key}`),
  "/sitemap",
  "/robots",
];
const isInternalPath = (pathname: string) =>
  internalPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

/** Dotted paths are public assets; CMS slug validation excludes dots. */
const isStaticFile = (pathname: string) =>
  pathname.includes(".") && !isInternalPath(pathname);

/**
 * Classify decoded paths like the router so encoded internal routes cannot
 * bypass site isolation as static files. Leave malformed escapes for Next to reject.
 */
const decodePathname = (pathname: string) => {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return pathname;
  }
};

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
