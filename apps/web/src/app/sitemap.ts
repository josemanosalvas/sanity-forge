import { isLocale } from "@repo/internationalization/locales";
import {
  getSite,
  isSiteKey,
  siteKeys,
  siteSupportsLocale,
} from "@repo/internationalization/sites";
import { sanityFetchMetadata } from "@repo/sanity/live";
import { sitemapQuery } from "@repo/sanity/queries";
import { sitemapEntry } from "@repo/seo/sitemap";
import type { MetadataRoute } from "next";

/** One sitemap per site, served at `/sitemap/{site}.xml`; the proxy maps `/sitemap.xml` onto it. */
export const generateSitemaps = () => siteKeys.map((id) => ({ id }));

/** Crawlers never hold a draft session: always published. */
const sitemap = async ({
  id,
}: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> => {
  const siteKey = await id;
  if (!isSiteKey(siteKey)) {
    return [];
  }
  const site = getSite(siteKey);
  try {
    const { data: pages } = await sanityFetchMetadata({
      params: { site: siteKey },
      perspective: "published",
      query: sitemapQuery,
    });

    return pages.flatMap((page) => {
      if (!(page.slug && siteSupportsLocale(site, page.language))) {
        return [];
      }
      return [
        sitemapEntry({
          lastModified: page.lastModified,
          route: {
            alternates: (page.translations ?? []).flatMap((translation) =>
              isLocale(translation.language) &&
              translation.slug &&
              translation.site === siteKey
                ? [{ locale: translation.language, path: translation.slug }]
                : []
            ),
            locale: page.language,
            path: page.slug,
            site,
          },
        }),
      ];
    });
  } catch (error) {
    // A build shipping a sitemap it could not read is a broken deploy, so it
    // still fails loudly; a crawler hitting a cold cache gets an empty but
    // valid sitemap instead of a 500.
    if (process.env.NEXT_PHASE === "phase-production-build") {
      throw error;
    }
    console.warn(
      `[web] Could not list sitemap pages for ${siteKey}:`,
      (error as Error).message
    );
    return [];
  }
};

export default sitemap;
