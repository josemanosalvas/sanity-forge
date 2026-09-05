import { LOCALE_HEADER, SITE_HEADER } from "@repo/internationalization/proxy";
import { createRequestConfig } from "@repo/internationalization/request";
import {
  getSiteOrDefault,
  siteSupportsLocale,
} from "@repo/internationalization/sites";
import { getRequestConfig } from "next-intl/server";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { locale as localeParam, site as siteParam } from "next/root-params";

/**
 * Site and locale for the current request. Server Components read the root
 * params of the rewritten route; Route Handlers and Server Actions, where
 * root params are unavailable, read the headers the proxy stamped.
 */
const readRouteContext = async () => {
  try {
    return { site: await siteParam(), locale: await localeParam() };
  } catch {
    const requestHeaders = await headers();
    return {
      site: requestHeaders.get(SITE_HEADER) ?? undefined,
      locale: requestHeaders.get(LOCALE_HEADER) ?? undefined,
    };
  }
};

export default getRequestConfig(async ({ locale }) => {
  const context = await readRouteContext();
  const site = getSiteOrDefault(context.site);
  const resolved = locale ?? context.locale;

  if (!siteSupportsLocale(site, resolved)) {
    notFound();
  }

  return createRequestConfig({ site, locale: resolved });
});
