import {
  getDefaultLocale,
  isSiteKey,
  siteSupportsLocale,
  getSite,
} from "@repo/internationalization/sites";
import { notFound } from "next/navigation";
import { locale as localeParam, site as siteParam } from "next/root-params";

import type { SiteContext, SiteQueryParams } from "@/types";

/**
 * The site and locale of the current route, from the root params the proxy
 * rewrote the request to. Anything that is not a known site + supported
 * locale pair is a 404, never a fallback to another site.
 */
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

/** The query parameters for a site context. */
export const toQueryParams = ({
  site,
  locale,
  defaultLocale,
}: SiteContext): SiteQueryParams => ({
  defaultLocale,
  locale,
  site: site.key,
});
