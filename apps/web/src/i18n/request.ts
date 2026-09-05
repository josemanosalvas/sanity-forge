import { createRequestConfig } from "@repo/internationalization/request";
import {
  getSiteOrDefault,
  siteSupportsLocale,
} from "@repo/internationalization/sites";
import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";
import { locale as localeParam, site as siteParam } from "next/root-params";

/** Use root params; reading cookies or headers here would prevent prerendering. */
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

  return createRequestConfig({ locale: resolved });
});
