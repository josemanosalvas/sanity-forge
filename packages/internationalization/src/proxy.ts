import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { locales } from "./locales";
import { localizePath, parsePathname } from "./routing";
import type { SiteContext } from "./routing";
import {
  getDefaultLocale,
  getSiteOrDefault,
  resolveSiteFromHost,
} from "./sites";
import type { Site, SiteKey } from "./sites";

/** Request headers the proxy stamps for Route Handlers and Server Actions, where root params are unavailable. */
export const SITE_HEADER = "x-site";
export const LOCALE_HEADER = "x-locale";

/**
 * Host → site. Unknown hosts (preview deployments, plain `localhost`) fall
 * back to the configured fallback site so the app always renders something.
 */
export const resolveSite = (request: NextRequest, fallback?: SiteKey): Site => {
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  return resolveSiteFromHost(host) ?? getSiteOrDefault(fallback);
};

export interface SiteRewrite {
  readonly response: NextResponse;
  readonly context: SiteContext;
}

/**
 * The public URL → internal route rewrite:
 *
 *   brand-a.example/about       → /brand-a/en/about
 *   brand-a.example/de/ueber-uns → /brand-a/de/ueber-uns
 *   brand-a.example/en/about    → 308 → /about   (default locale stays clean)
 *
 * A locale prefix the site does not serve is left in the path, so the page
 * lookup fails and the app renders its own 404 instead of bouncing the
 * visitor to another site.
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
      response: NextResponse.redirect(url, 308),
      context: { site: site.key, locale: defaultLocale },
    };
  }

  const context: SiteContext = { site: site.key, locale: parsed.locale };
  const url = request.nextUrl.clone();
  const internalPath = parsed.pathname === "/" ? "" : parsed.pathname;
  url.pathname = `${internalPrefix(context)}${internalPath}`;
  url.search = search;

  const headers = new Headers(request.headers);
  headers.set(SITE_HEADER, context.site);
  headers.set(LOCALE_HEADER, context.locale);

  return {
    response: NextResponse.rewrite(url, { request: { headers } }),
    context,
  };
};
