import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { locales } from "./locales";
import { localizePath, parsePathname } from "./routing";
import type { SiteContext } from "./routing";
import {
  getDefaultLocale,
  getSiteOrDefault,
  hostVariants,
  resolveSiteFromHost,
} from "./sites";
import type { Site, SiteKey } from "./sites";

/**
 * The public hostname of a request. `x-forwarded-host` is what Vercel and
 * most reverse proxies set; Next passes it through untouched, so a
 * self-hosted deployment must have its proxy overwrite the header, or a
 * client could pick another site by sending its own.
 */
export const requestHost = (request: NextRequest): string | null =>
  request.headers.get("x-forwarded-host") ?? request.headers.get("host");

export const resolveSite = (request: NextRequest, fallback?: SiteKey): Site => {
  const host = requestHost(request);
  return resolveSiteFromHost(host) ?? getSiteOrDefault(fallback);
};

/**
 * A 308 to the site's production hostname when the request arrived on its
 * `www.`/apex twin, so one URL per page reaches crawlers and caches. The
 * development hostname keeps its port and is never redirected.
 */
export const canonicalHostRedirect = (
  request: NextRequest,
  site: Site
): NextResponse | null => {
  const host = requestHost(request)?.trim().toLowerCase();
  const canonical = site.domains.production.toLowerCase();
  if (!host || host === canonical || !hostVariants(canonical).includes(host)) {
    return null;
  }
  const url = request.nextUrl.clone();
  url.protocol = "https:";
  // Set host first, then clear the port: a self-hosted origin listens on a
  // port the public hostname does not.
  url.host = canonical;
  url.port = "";
  return NextResponse.redirect(url, 308);
};

export interface SiteRewrite {
  readonly response: NextResponse;
  readonly context: SiteContext;
}

/**
 * Rewrite /about to /<site>/<defaultLocale>/about and /de/about to /<site>/de/about.
 * Redirect explicit default-locale prefixes away; unsupported locales remain
 * in the slug and resolve as ordinary paths.
 */
export const rewriteToSiteRoute = (
  request: NextRequest,
  site: Site,
  internalPrefix: (context: SiteContext) => string = ({ site: key, locale }) =>
    `/${key}/${locale}`
): SiteRewrite => {
  const { pathname, search } = request.nextUrl;
  const parsed = parsePathname(site, pathname, locales);
  const defaultLocale = getDefaultLocale(site);

  if (parsed.hadPrefix && parsed.locale === defaultLocale) {
    const url = request.nextUrl.clone();
    url.pathname = localizePath(site, defaultLocale, parsed.pathname);
    return {
      context: { locale: defaultLocale, site: site.key },
      response: NextResponse.redirect(url, 308),
    };
  }

  const context: SiteContext = { locale: parsed.locale, site: site.key };
  const url = request.nextUrl.clone();
  const internalPath = parsed.pathname === "/" ? "" : parsed.pathname;
  url.pathname = `${internalPrefix(context)}${internalPath}`;
  url.search = search;

  return { context, response: NextResponse.rewrite(url) };
};
