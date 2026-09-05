import { isLocale } from "@repo/internationalization/locales";
import type { SettingsQueryResult } from "@repo/sanity/types";
import { createMetadata } from "@repo/seo/metadata";
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

/** Favicons from the site settings; none until the site uploads them. */
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
  return icon.length > 0 ? { icon } : undefined;
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

/** Metadata for routes without a CMS document (404, errors): site defaults only. */
export const siteMetadata = (
  context: SiteContext,
  settings: SettingsQueryResult
): Metadata => ({
  ...createMetadata({
    description: settings?.siteDescription,
    icons: faviconIcons(settings),
    image: settings?.ogImage,
    route: { locale: context.locale, path: "/", site: context.site },
    siteName: settings?.siteTitle ?? context.site.name,
  }),
  alternates: undefined,
});
