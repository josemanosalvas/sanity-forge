import type { Site } from "@repo/internationalization/sites";
import type { MetadataRoute } from "next";

import { canonicalOrigin } from "./route";

/** Default robots rules for a site: crawl everything public, point at its sitemap. */
export const siteRobots = (site: Site): MetadataRoute.Robots => ({
  host: canonicalOrigin(site),
  rules: [{ allow: "/", disallow: ["/api/"], userAgent: "*" }],
  sitemap: `${canonicalOrigin(site)}/sitemap.xml`,
});
