import type { Locale } from "@repo/internationalization/locales";
import { absoluteUrl } from "@repo/internationalization/routing";
import {
  getDefaultLocale,
  getSiteOrigin,
} from "@repo/internationalization/sites";
import type { Site } from "@repo/internationalization/sites";

/** A localized alternative of a route: the same content in another locale. */
export interface RouteAlternate {
  readonly locale: Locale;
  readonly path: string;
}

/**
 * The identity of every public URL: site × locale × path. `path` is the
 * CMS slug without locale prefix; alternates are the CMS-driven localized
 * slugs of the same document (may include the current locale).
 */
export interface SeoRoute {
  readonly site: Site;
  readonly locale: Locale;
  readonly path: string;
  readonly alternates?: readonly RouteAlternate[];
}

export const canonicalOrigin = (site: Site): string =>
  getSiteOrigin(site, "production");

/** Absolute canonical URL of a route on its site's production origin. */
export const canonicalUrl = (route: SeoRoute): string =>
  absoluteUrl(
    canonicalOrigin(route.site),
    route.site,
    route.locale,
    route.path
  );

/**
 * hreflang map for a route: every known translation, plus `x-default`
 * pointing at the site's default locale when that translation exists.
 * Only locales the site serves are included.
 */
export const languageAlternates = (route: SeoRoute): Record<string, string> => {
  const { site } = route;
  const origin = canonicalOrigin(site);
  const entries = new Map<string, string>();
  const known = route.alternates ?? [];
  const all = known.some((alternate) => alternate.locale === route.locale)
    ? known
    : [...known, { locale: route.locale, path: route.path }];

  for (const alternate of all) {
    if (!(site.locales as readonly string[]).includes(alternate.locale)) {
      continue;
    }
    entries.set(
      alternate.locale,
      absoluteUrl(origin, site, alternate.locale, alternate.path)
    );
  }

  const defaultLocale = getDefaultLocale(site);
  const xDefault = entries.get(defaultLocale);
  if (xDefault) {
    entries.set("x-default", xDefault);
  }

  return Object.fromEntries(entries);
};
