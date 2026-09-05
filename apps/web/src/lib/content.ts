import { sanityFetch } from "@repo/sanity/live";
import type { DynamicFetchOptions } from "@repo/sanity/live";
import {
  footerQuery,
  navigationQuery,
  pageQuery,
  settingsQuery,
} from "@repo/sanity/queries";
import type {
  FooterQueryResult,
  NavigationQueryResult,
  PageQueryResult,
  SettingsQueryResult,
} from "@repo/sanity/types";

import type { SiteQueryParams } from "@/types";

type Scoped = SiteQueryParams & DynamicFetchOptions;

/**
 * Shared `'use cache'` fetch helpers, so components that need the same data
 * do not each wait for it. `perspective`, `stega` and `variant` always come
 * from the caller, never hardcoded here, so Visual Editing and release
 * previews work through every helper.
 *
 * `stega` is a runtime flag here, which makes next-sanity type the data as
 * stega-branded; the components take the plain TypeGen types, hence the
 * casts, as in Sanity's own template.
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
  return data as PageQueryResult;
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
  return data as SettingsQueryResult;
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
  return { navigation: navigation.data as NavigationQueryResult, settings };
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
  return data as FooterQueryResult;
};
