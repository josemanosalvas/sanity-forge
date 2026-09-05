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
