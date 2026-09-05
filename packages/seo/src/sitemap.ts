import type { MetadataRoute } from "next";

import { canonicalUrl, languageAlternates } from "./route";
import type { SeoRoute } from "./route";

export interface SitemapEntryOptions {
  readonly route: SeoRoute;
  readonly lastModified?: string | Date | null;
  readonly changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"];
  readonly priority?: number;
}

/** One sitemap entry with `xhtml:link` hreflang alternates for every translation. */
export const sitemapEntry = ({
  route,
  lastModified,
  changeFrequency = "weekly",
  priority,
}: SitemapEntryOptions): MetadataRoute.Sitemap[number] => ({
  url: canonicalUrl(route),
  lastModified: lastModified ? new Date(lastModified) : undefined,
  changeFrequency,
  priority: priority ?? (route.path === "/" ? 1 : 0.7),
  alternates: {
    languages: languageAlternates(route),
  },
});
