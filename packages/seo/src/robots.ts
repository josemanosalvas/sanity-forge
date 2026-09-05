import type { Site } from "@repo/internationalization/sites";
import type { MetadataRoute } from "next";

import { canonicalOrigin } from "./route";

/** Default robots rules for a site: crawl everything public, point at its sitemap. */
export const siteRobots = (site: Site): MetadataRoute.Robots => ({
  rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
  sitemap: `${canonicalOrigin(site)}/sitemap.xml`,
  host: canonicalOrigin(site),
});
