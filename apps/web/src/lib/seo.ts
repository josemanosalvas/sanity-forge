import { isLocale } from "@repo/internationalization/locales";
import type { SettingsQueryResult } from "@repo/sanity/types";
import { createMetadata, titleTemplate } from "@repo/seo/metadata";
import type { RouteAlternate } from "@repo/seo/route";
import type { Metadata } from "next";

import type { PageDocument, SiteContext } from "@/types";

/** Translations on this site only; the `site` field is editable, so a moved one is not an alternate here. */
const toAlternates = (
  translations: PageDocument["translations"] | undefined,
  site: SiteContext["site"]
): RouteAlternate[] =>
  (translations ?? []).flatMap((translation) =>
    isLocale(translation.language) &&
    translation.slug &&
    translation.site === site.key
      ? [{ locale: translation.language, path: translation.slug }]
      : []
  );

/** Favicons from the site settings; the neutral mark in public/ until the site uploads its own. */
export const faviconIcons = (
  settings: SettingsQueryResult
): Metadata["icons"] => {
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

const twitterHandle = (settings: SettingsQueryResult) => {
  const handle = settings?.socialLinks?.twitter?.split("/").findLast(Boolean);
  return handle ? `@${handle}` : undefined;
};

/** Metadata for a CMS page: `seo*` overrides win, then page fields, then site settings. */
export const pageMetadata = (
  context: SiteContext,
  page: PageDocument,
  settings: SettingsQueryResult
): Metadata =>
  createMetadata({
    description: page.seoDescription ?? page.description,
    icons: faviconIcons(settings),
    image: page.ogImage ?? settings?.ogImage,
    noIndex: page.seoNoIndex,
    ogDescription: page.ogDescription,
    ogTitle: page.ogTitle,
    route: {
      alternates: toAlternates(page.translations, context.site),
      locale: context.locale,
      path: page.slug ?? "/",
      site: context.site,
    },
    siteName: settings?.siteTitle ?? context.site.name,
    title: page.seoTitle ?? page.title,
    twitterHandle: twitterHandle(settings),
  });

/**
 * The layout's metadata: site defaults every segment inherits, plus the title
 * template that appends the site name to page titles. Routes without a CMS
 * document (404, errors) render with exactly this, so it asserts neither
 * alternates nor a robots directive; the 404 status carries its own noindex.
 */
export const siteMetadata = (
  context: SiteContext,
  settings: SettingsQueryResult
): Metadata => {
  const siteName = settings?.siteTitle ?? context.site.name;
  return {
    ...createMetadata({
      description: settings?.siteDescription,
      icons: faviconIcons(settings),
      image: settings?.ogImage,
      route: { locale: context.locale, path: "/", site: context.site },
      siteName,
    }),
    alternates: undefined,
    robots: undefined,
    title: { default: siteName, template: titleTemplate(siteName) },
  };
};
