import { createRequestConfig } from "@repo/internationalization/request";
import {
  getSiteOrDefault,
  siteSupportsLocale,
} from "@repo/internationalization/sites";
import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";
import { locale as localeParam, site as siteParam } from "next/root-params";

/**
 * Site and locale come from the root params of the rewritten route, which
 * are part of the static shell. Nothing here may read `headers()` or
 * `cookies()`: that would pull every page out of prerendering.
 */
export default getRequestConfig(async ({ locale }) => {
  const [siteKey, routeLocale] = await Promise.all([
    siteParam(),
    localeParam(),
  ]);
  const site = getSiteOrDefault(siteKey);
  const resolved = locale ?? routeLocale;

  if (!siteSupportsLocale(site, resolved)) {
    notFound();
  }

  return createRequestConfig({ locale: resolved, site });
});
