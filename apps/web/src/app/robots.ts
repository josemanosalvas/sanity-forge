import {
  getSiteOrDefault,
  resolveSiteFromHost,
} from "@repo/internationalization/sites";
import { siteRobots } from "@repo/seo/robots";
import type { MetadataRoute } from "next";
import { headers } from "next/headers";

import { env } from "@/env";

/** Per-host robots: the proxy skips this route, so the site is read from the request host here. */
const robots = async (): Promise<MetadataRoute.Robots> => {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const site = resolveSiteFromHost(host) ?? getSiteOrDefault(env.DEFAULT_SITE);
  return siteRobots(site);
};

export default robots;
