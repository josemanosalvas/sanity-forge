/**
 * Document types that exist once per scope: settings once per site,
 * navigation and footer once per site and language. Their IDs derive from
 * that scope, so the Studio opens and the site reads the same document; a
 * second one can only arrive through an import, and fails validation.
 */
export const LOCALIZED_SINGLETON_TYPES = ["navigation", "footer"] as const;

export type LocalizedSingletonType = (typeof LOCALIZED_SINGLETON_TYPES)[number];

export const SINGLETON_TYPES = [
  ...LOCALIZED_SINGLETON_TYPES,
  "settings",
] as const;

export type SingletonType = (typeof SINGLETON_TYPES)[number];

export const isSingletonType = (type: unknown): type is SingletonType =>
  typeof type === "string" &&
  (SINGLETON_TYPES as readonly string[]).includes(type);

export const settingsDocumentId = (site: string): string => `settings-${site}`;

export const localizedSingletonId = (
  type: LocalizedSingletonType,
  site: string,
  language: string
): string => `${type}-${site}-${language}`;
