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
    params: { defaultLocale, locale, path, site },
    perspective,
    query: pageQuery,
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
    params: { defaultLocale, locale, site },
    perspective,
    query: settingsQuery,
    stega,
  });
  return data;
};

export const getNavigationData = async (options: Scoped) => {
  "use cache";
  const { site, locale, defaultLocale, perspective, stega } = options;
  const [navigation, settings] = await Promise.all([
    sanityFetch({
      params: { defaultLocale, locale, site },
      perspective,
      query: navigationQuery,
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
    params: { defaultLocale, locale, site },
    perspective,
    query: footerQuery,
    stega,
  });
  return data;
};
