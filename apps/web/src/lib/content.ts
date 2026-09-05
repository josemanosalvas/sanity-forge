import { sanityFetch } from "@repo/sanity/live";
import type { DynamicFetchOptions } from "@repo/sanity/live";
import {
  footerQuery,
  navigationQuery,
  pageQuery,
  settingsQuery,
} from "@repo/sanity/queries";

import type { SiteQueryParams } from "@/types";

type Scoped = SiteQueryParams & DynamicFetchOptions;

/**
 * Shared `'use cache'` fetch helpers, so components that need the same data
 * do not each wait for it. `perspective`, `stega` and `variant` always come
 * from the caller, never hardcoded here, so Visual Editing and release
 * previews work through every helper.
 *
 * `stega` is a runtime flag here, so next-sanity brands every string in the
 * result as possibly stega-encoded. Compare a field to a literal only through
 * `stegaClean`; the types enforce it.
 */
export const fetchPage = async ({
  site,
  locale,
  defaultLocale,
  path,
  perspective,
  stega,
  variant,
}: Scoped & { path: string }) => {
  "use cache";
  const { data } = await sanityFetch({
    params: { defaultLocale, locale, path, site },
    perspective,
    query: pageQuery,
    stega,
    variant,
  });
  return data;
};

export const fetchSettings = async ({
  site,
  locale,
  defaultLocale,
  perspective,
  stega,
  variant,
}: Scoped) => {
  "use cache";
  const { data } = await sanityFetch({
    params: { defaultLocale, locale, site },
    perspective,
    query: settingsQuery,
    stega,
    variant,
  });
  return data;
};

export const fetchNavigation = async (options: Scoped) => {
  "use cache";
  const { site, locale, defaultLocale, perspective, stega, variant } = options;
  const [navigation, settings] = await Promise.all([
    sanityFetch({
      params: { defaultLocale, locale, site },
      perspective,
      query: navigationQuery,
      stega,
      variant,
    }),
    fetchSettings(options),
  ]);
  return { navigation: navigation.data, settings };
};

export const fetchFooter = async ({
  site,
  locale,
  defaultLocale,
  perspective,
  stega,
  variant,
}: Scoped) => {
  "use cache";
  const { data } = await sanityFetch({
    params: { defaultLocale, locale, site },
    perspective,
    query: footerQuery,
    stega,
    variant,
  });
  return data;
};
