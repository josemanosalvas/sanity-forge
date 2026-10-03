import type { Site } from "@repo/internationalization/sites";

import { canonicalOrigin } from "./route";

/**
 * The `robots.txt` body for a site, in the layout Next's metadata route emits:
 * crawl everything public and point at the site's sitemap.
 */
export const robotsTxt = (site: Site): string => {
  const origin = canonicalOrigin(site);
  return [
    "User-Agent: *",
    "Allow: /",
    "Disallow: /api/",
    "",
    `Host: ${origin}`,
    `Sitemap: ${origin}/sitemap.xml`,
    "",
  ].join("\n");
};
