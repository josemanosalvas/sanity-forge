import { sanityFetch } from "@repo/sanity/live";
import {
  footerQuery,
  navigationQuery,
  pageQuery,
  settingsQuery,
} from "@repo/sanity/queries";

import type { FetchOptions, SiteQueryParams } from "@/types";

type Scoped = SiteQueryParams & FetchOptions;

/**
 * Cached, site- and locale-scoped reads. Each function is its own
 * `'use cache'` entry keyed by its arguments; Sanity Live tags are
 * registered by `sanityFetch`, so edits invalidate exactly these entries.
 */
export const getPage = async ({
  site,
  locale,
  defaultLocale,
  path,
  perspective,
  stega,
}: Scoped & { path: string }) => {
  "use cache";
  const { data } = await sanityFetch({
    query: pageQuery,
    params: { site, locale, defaultLocale, path },
    perspective,
    stega,
  });
  return data;
};

export const getSettings = async ({
  site,
  locale,
  defaultLocale,
  perspective,
  stega,
}: Scoped) => {
  "use cache";
  const { data } = await sanityFetch({
    query: settingsQuery,
    params: { site, locale, defaultLocale },
    perspective,
    stega,
  });
  return data;
};

export const getNavigationData = async (options: Scoped) => {
  "use cache";
  const { site, locale, defaultLocale, perspective, stega } = options;
  const [navigation, settings] = await Promise.all([
    sanityFetch({
      query: navigationQuery,
      params: { site, locale, defaultLocale },
      perspective,
      stega,
    }),
    getSettings(options),
  ]);
  return { navigation: navigation.data, settings };
};

export const getFooter = async ({
  site,
  locale,
  defaultLocale,
  perspective,
  stega,
}: Scoped) => {
  "use cache";
  const { data } = await sanityFetch({
    query: footerQuery,
    params: { site, locale, defaultLocale },
    perspective,
    stega,
  });
  return data;
};
