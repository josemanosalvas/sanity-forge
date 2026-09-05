import type { Locale } from "@repo/internationalization/locales";
import { absoluteUrl } from "@repo/internationalization/routing";
import {
  getDefaultLocale,
  getSiteOrigin,
} from "@repo/internationalization/sites";
import type { Site } from "@repo/internationalization/sites";

export interface RouteAlternate {
  readonly locale: Locale;
  readonly path: string;
}

/** Paths and translated slugs exclude locale prefixes. */
export interface SeoRoute {
  readonly site: Site;
  readonly locale: Locale;
  readonly path: string;
  readonly alternates?: readonly RouteAlternate[];
}

export const canonicalOrigin = (site: Site): string =>
  getSiteOrigin(site, "production");

export const canonicalUrl = (route: SeoRoute): string =>
  absoluteUrl(
    canonicalOrigin(route.site),
    route.site,
    route.locale,
    route.path
  );

/** Only served locales are included; x-default uses the default-locale translation if present. */
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
