import type { Metadata } from "next";

import { canonicalOrigin, canonicalUrl, languageAlternates } from "./route";
import type { SeoRoute } from "./route";

export interface CreateMetadataOptions {
  readonly route: SeoRoute;
  /** The page title. The site name is appended unless already present. */
  readonly title?: string | null;
  readonly description?: string | null;
  /** The site's display name, used for the title suffix, Open Graph and Twitter. */
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

const LOCALE_TAGS: Record<string, string> = {
  en: "en_US",
  de: "de_DE",
  fr: "fr_FR",
};

/**
 * Next.js metadata for one site × locale × route: canonical on the site's
 * production origin, hreflang alternates from CMS-driven localized slugs,
 * Open Graph and Twitter cards, and robots directives. Everything the
 * caller passes is a plain string, so this is safe inside `'use cache'`.
 */
const resolveTitles = ({
  title,
  siteName,
  ogTitle,
}: Pick<CreateMetadataOptions, "title" | "siteName" | "ogTitle">) => {
  const pageTitle = title?.trim() || siteName;
  const fullTitle = pageTitle.includes(siteName)
    ? pageTitle
    : `${pageTitle} | ${siteName}`;
  return { fullTitle, socialTitle: ogTitle?.trim() || fullTitle };
};

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
  const { fullTitle, socialTitle } = resolveTitles({
    title,
    siteName,
    ogTitle,
  });
  const socialDescription =
    ogDescription?.trim() || description?.trim() || undefined;
  const url = canonicalUrl(route);
  const images = image
    ? [{ url: image, width: 1200, height: 630, alt: imageAlt ?? socialTitle }]
    : undefined;

  return {
    metadataBase: new URL(canonicalOrigin(route.site)),
    title: fullTitle,
    description: description?.trim() || undefined,
    applicationName: siteName,
    icons,
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    alternates: {
      canonical: url,
      languages: languageAlternates(route),
    },
    openGraph: {
      type,
      url,
      siteName,
      locale: LOCALE_TAGS[route.locale] ?? route.locale,
      title: socialTitle,
      description: socialDescription,
      images,
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title: socialTitle,
      description: socialDescription,
      images: image ? [image] : undefined,
      creator: twitterHandle ?? undefined,
    },
  };
};
