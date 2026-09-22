import { isLocale } from "@repo/internationalization/locales";
import { imageUrl } from "@repo/sanity/image";
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

const urlPathname = (value: string) => {
  try {
    return new URL(value).pathname;
  } catch {
    // Not a URL, so the field holds the handle itself.
    return value;
  }
};

/**
 * The field takes a profile URL or a bare handle, written with or without the
 * `@` that `twitter:creator` needs exactly one of. Anything that is not a
 * single handle-shaped segment — a scheme-less URL, a sentence — is not a handle.
 */
const twitterHandle = (settings: SettingsQueryResult) => {
  const value = settings?.socialLinks?.twitter?.trim();
  const [handle] = (value ? urlPathname(value) : "")
    .replace(/^[/@]+/u, "")
    .split("/");
  return handle && /^\w+$/u.test(handle) ? `@${handle}` : undefined;
};

/** Open Graph's fixed card size; the builder crops to it around the hotspot. */
const OG_IMAGE_SIZE = { height: 630, width: 1200 } as const;

/** Metadata for a CMS page: `seo*` overrides win, then page fields, then site settings. */
export const pageMetadata = (
  context: SiteContext,
  page: PageDocument,
  settings: SettingsQueryResult
): Metadata => {
  // The query already resolved the page's own override against its main image.
  const ogImage = page.ogImage ?? settings?.ogImage;
  return createMetadata({
    description: page.seoDescription ?? page.description,
    icons: faviconIcons(settings),
    image: imageUrl(ogImage, OG_IMAGE_SIZE),
    imageAlt: ogImage?.alt,
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
      image: imageUrl(settings?.ogImage, OG_IMAGE_SIZE),
      imageAlt: settings?.ogImage?.alt,
      route: { locale: context.locale, path: "/", site: context.site },
      siteName,
    }),
    alternates: undefined,
    robots: undefined,
    title: { default: siteName, template: titleTemplate(siteName) },
  };
};
