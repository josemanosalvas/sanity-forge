import {
  getDefaultLocale,
  isSiteKey,
  siteSupportsLocale,
  getSite,
} from "@repo/internationalization/sites";
import { notFound } from "next/navigation";
import { locale as localeParam, site as siteParam } from "next/root-params";

import type { SiteContext, SiteQueryParams } from "@/types";

/** Reject unknown site/locale pairs instead of serving another site. */
export const getSiteContext = async (): Promise<SiteContext> => {
  const [siteKey, locale] = await Promise.all([siteParam(), localeParam()]);
  if (!isSiteKey(siteKey)) {
    notFound();
  }
  const site = getSite(siteKey);
  if (!siteSupportsLocale(site, locale)) {
    notFound();
  }
  return { defaultLocale: getDefaultLocale(site), locale, site };
};

export const toQueryParams = ({
  site,
  locale,
  defaultLocale,
}: SiteContext): SiteQueryParams => ({
  defaultLocale,
  locale,
  site: site.key,
});
