import { localeRegions } from "@repo/internationalization/locales";
import type { Locale } from "@repo/internationalization/locales";
import type { Metadata } from "next";

import { canonicalOrigin, canonicalUrl, languageAlternates } from "./route";
import type { SeoRoute } from "./route";

export interface CreateMetadataOptions {
  readonly route: SeoRoute;
  /** The page title. The site name is appended unless already present. */
  readonly title?: string | null;
  readonly description?: string | null;
  readonly siteName: string;
  /** Absolute Open Graph image URL (1200×630). */
  readonly image?: string | null;
  readonly imageAlt?: string | null;
  /** Social-specific overrides, when the CMS provides them. */
  readonly ogTitle?: string | null;
  readonly ogDescription?: string | null;
  readonly twitterHandle?: string | null;
  readonly noIndex?: boolean | null;
  readonly type?: "website" | "article";
  readonly icons?: Metadata["icons"];
}

/** The `%s | Site` pattern the root layout registers as its `title.template`. */
export const titleTemplate = (siteName: string) => `%s | ${siteName}`;

const resolveTitles = ({
  title,
  siteName,
  ogTitle,
}: Pick<CreateMetadataOptions, "title" | "siteName" | "ogTitle">) => {
  const pageTitle = title?.trim() || siteName;
  const fullTitle = pageTitle.includes(siteName)
    ? pageTitle
    : `${pageTitle} | ${siteName}`;
  // The layout's template appends the site name to a bare page title; a
  // title that already carries it (or is the site name) opts out with `absolute`.
  const documentTitle: Metadata["title"] =
    pageTitle === fullTitle ? { absolute: fullTitle } : pageTitle;
  return {
    documentTitle,
    fullTitle,
    socialTitle: ogTitle?.trim() || fullTitle,
  };
};

/** Open Graph writes the region tag with an underscore: `de-DE` becomes `de_DE`. */
const openGraphLocale = (locale: Locale) =>
  localeRegions[locale].replace("-", "_");

export const createMetadata = ({
  route,
  title,
  description,
  siteName,
  image,
  imageAlt,
  ogTitle,
  ogDescription,
  twitterHandle,
  noIndex = false,
  type = "website",
  icons,
}: CreateMetadataOptions): Metadata => {
  const { documentTitle, socialTitle } = resolveTitles({
    ogTitle,
    siteName,
    title,
  });
  const socialDescription =
    ogDescription?.trim() || description?.trim() || undefined;
  const url = canonicalUrl(route);
  const images = image
    ? [{ alt: imageAlt ?? socialTitle, height: 630, url: image, width: 1200 }]
    : undefined;

  return {
    alternates: {
      canonical: url,
      languages: languageAlternates(route),
    },
    applicationName: siteName,
    description: description?.trim() || undefined,
    icons,
    metadataBase: new URL(canonicalOrigin(route.site)),
    openGraph: {
      description: socialDescription,
      images,
      locale: openGraphLocale(route.locale),
      siteName,
      title: socialTitle,
      type,
      url,
    },
    robots: noIndex
      ? { follow: false, index: false }
      : { follow: true, index: true },
    title: documentTitle,
    twitter: {
      card: images ? "summary_large_image" : "summary",
      creator: twitterHandle ?? undefined,
      description: socialDescription,
      images: image ? [image] : undefined,
      title: socialTitle,
    },
  };
};
