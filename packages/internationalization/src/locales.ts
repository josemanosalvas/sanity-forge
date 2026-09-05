/**
 * Every locale any site can serve. Individual sites pick a subset in `sites.ts`.
 * Keep this the union of all site locales: it drives next-intl's `Locale` type
 * and the Studio's translation menus.
 */
export const locales = ["en", "de", "fr"] as const;

export type Locale = (typeof locales)[number];

export const localeLabels: Record<Locale, string> = {
  en: "English",
  de: "Deutsch",
  fr: "Français",
};

export const isLocale = (value: unknown): value is Locale =>
  typeof value === "string" && (locales as readonly string[]).includes(value);
