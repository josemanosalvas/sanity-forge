import { siteSupportsLocale } from "@repo/internationalization/sites";
import type { SiteKey } from "@repo/internationalization/sites";
import { ogImageUrl } from "@repo/sanity/image";
import type { SettingsQueryResult } from "@repo/sanity/types";
import { createMetadata, titleTemplate } from "@repo/seo/metadata";
import type { RouteAlternate } from "@repo/seo/route";
import type { Metadata } from "next";
import { stegaClean } from "next-sanity";

import type { PageDocument, SiteContext } from "@/types";

interface TranslationReference {
  readonly language: string;
  readonly site: string | null;
  readonly slug: string | null;
}

/**
 * A page's translations on this site, in the locales it serves. A reference
 * can still point at another site's page (one moved after it was linked).
 */
export const siteTranslations = (
  translations: readonly TranslationReference[] | null,
  site: SiteKey
): RouteAlternate[] =>
  (translations ?? []).flatMap((translation) =>
    translation.slug &&
    stegaClean(translation.site) === site &&
    siteSupportsLocale(site, translation.language)
      ? [{ locale: translation.language, path: translation.slug }]
      : []
  );

const faviconIcons = (settings: SettingsQueryResult): Metadata["icons"] => {
  const icon = [
    ...(settings?.favicon?.svg
      ? [{ type: "image/svg+xml", url: settings.favicon.svg }]
      : []),
    ...(settings?.favicon?.ico
      ? [{ sizes: "16x16 32x32 48x48", url: settings.favicon.ico }]
      : []),
  ];
  return icon.length > 0
    ? { icon }
    : { icon: [{ type: "image/svg+xml", url: "/icon.svg" }] };
};

const urlPathname = (value: string) => {
  try {
    return new URL(value).pathname;
  } catch {
    return value;
  }
};

/** Accept profile URLs and legacy bare handles. */
const twitterHandle = (settings: SettingsQueryResult) => {
  const value = settings?.socialLinks?.twitter?.trim();
  const [handle] = (value ? urlPathname(value) : "")
    .replace(/^[/@]+/u, "")
    .split("/");
  return handle && /^\w+$/u.test(handle) ? `@${handle}` : undefined;
};

/** Metadata for a CMS page: `seo*` overrides win, then page fields, then site settings. */
export const pageMetadata = (
  context: SiteContext,
  page: PageDocument,
  settings: SettingsQueryResult
): Metadata => {
  const pageImage = ogImageUrl(page.ogImage);
  return createMetadata({
    description: page.seoDescription ?? page.description,
    icons: faviconIcons(settings),
    image: pageImage ?? ogImageUrl(settings?.ogImage),
    imageAlt: pageImage ? page.ogImage?.alt : settings?.ogImage?.alt,
    noIndex: page.seoNoIndex,
    ogDescription: page.ogDescription,
    ogTitle: page.ogTitle,
    route: {
      alternates: siteTranslations(page.translations, context.site.key),
      locale: context.locale,
      path: page.slug ?? "/",
      site: context.site,
    },
    siteName: settings?.siteTitle ?? context.site.name,
    title: page.seoTitle ?? page.title,
    twitterHandle: twitterHandle(settings),
  });
};

export const siteMetadata = (
  context: SiteContext,
  settings: SettingsQueryResult
): Metadata => {
  const siteName = settings?.siteTitle ?? context.site.name;
  return {
    ...createMetadata({
      description: settings?.siteDescription,
      icons: faviconIcons(settings),
      image: ogImageUrl(settings?.ogImage),
      imageAlt: settings?.ogImage?.alt,
      route: { locale: context.locale, path: "/", site: context.site },
      siteName,
    }),
    alternates: undefined,
    robots: undefined,
    title: { default: siteName, template: titleTemplate(siteName) },
  };
};
