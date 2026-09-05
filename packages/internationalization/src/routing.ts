import type { Locale } from "./locales";
import { getDefaultLocale, siteSupportsLocale } from "./sites";
import type { Site } from "./sites";

/**
 * The request context every site-aware read needs. `site` and `locale` are
 * orthogonal: the site is resolved from the host first, then the locale is
 * resolved from the path against that site's supported locales.
 */
export interface SiteContext {
  readonly site: Site["key"];
  readonly locale: Locale;
}

/**
 * Public href for a path on a site: the default locale stays unprefixed,
 * other locales get a `/{locale}` prefix. External hrefs pass through.
 */
export const localizePath = (
  site: Site,
  locale: Locale,
  path: string
): string => {
  if (!path.startsWith("/") || path.startsWith("//")) {
    return path;
  }
  if (locale === getDefaultLocale(site)) {
    return path;
  }
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
};

export interface ParsedPathname {
  readonly locale: Locale;
  /** The pathname without its locale prefix, always starting with `/`. */
  readonly pathname: string;
  /** Whether the incoming pathname carried a locale prefix. */
  readonly hadPrefix: boolean;
  /** Set when the prefix is a valid locale that this site does not serve. */
  readonly unsupportedLocale?: string;
}

/**
 * Splits a public pathname into the locale it targets and the remaining path,
 * using only the locales the given site supports.
 */
export const parsePathname = (
  site: Site,
  pathname: string,
  knownLocales: readonly string[]
): ParsedPathname => {
  const [, first = "", ...rest] = pathname.split("/");
  const remainder = `/${rest.join("/")}`;

  if (siteSupportsLocale(site, first)) {
    return { hadPrefix: true, locale: first, pathname: remainder };
  }

  if (knownLocales.includes(first)) {
    return {
      hadPrefix: false,
      locale: getDefaultLocale(site),
      pathname,
      unsupportedLocale: first,
    };
  }

  return { hadPrefix: false, locale: getDefaultLocale(site), pathname };
};

/** Absolute URL for a path on a site's canonical (production) origin. */
export const absoluteUrl = (
  origin: string,
  site: Site,
  locale: Locale,
  path: string
): string => new URL(localizePath(site, locale, path), origin).toString();
