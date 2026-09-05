import { isLocale } from "@repo/internationalization/locales";
import {
  getSite,
  isSiteKey,
  siteKeys,
  siteSupportsLocale,
} from "@repo/internationalization/sites";
import { sanityFetchStatic } from "@repo/sanity/live";
import { sitemapQuery } from "@repo/sanity/queries";
import { sitemapEntry } from "@repo/seo/sitemap";
import type { MetadataRoute } from "next";

/** One sitemap per site, served at `/sitemap/{site}.xml`; the proxy maps `/sitemap.xml` onto it. */
export const generateSitemaps = () => siteKeys.map((id) => ({ id }));

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
  const pages = await sanityFetchStatic({
    query: sitemapQuery,
    params: { site: siteKey },
  });

  return pages.flatMap((page) => {
    if (!(page.slug && siteSupportsLocale(site, page.language))) {
      return [];
    }
    return [
      sitemapEntry({
        route: {
          site,
          locale: page.language,
          path: page.slug,
          alternates: (page.translations ?? []).flatMap((translation) =>
            isLocale(translation.language) && translation.slug
              ? [{ locale: translation.language, path: translation.slug }]
              : []
          ),
        },
        lastModified: page.lastModified,
      }),
    ];
  });
};

export default sitemap;
