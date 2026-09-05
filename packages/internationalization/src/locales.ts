/**
 * Every locale any site can serve. Individual sites pick a subset in `sites.ts`.
 * Keep this the union of all site locales: it drives next-intl's `Locale` type
 * and the Studio's translation menus.
 */
export const locales = ["en", "de", "fr"] as const;

export type Locale = (typeof locales)[number];

export const localeLabels: Record<Locale, string> = {
  de: "Deutsch",
  en: "English",
  fr: "Français",
};

/**
 * The BCP 47 region each locale is written for. Metadata such as `og:locale`
 * derives from these. The example sites target Germany, the United States and
 * France; change the regions here, in one place, for another market
 * (Switzerland would be `de-CH` and `fr-CH`).
 */
export const localeRegions: Record<Locale, string> = {
  de: "de-DE",
  en: "en-US",
  fr: "fr-FR",
};

export const isLocale = (value: unknown): value is Locale =>
  typeof value === "string" && (locales as readonly string[]).includes(value);
