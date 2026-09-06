import type { Formats } from "next-intl";
import type { RequestConfig } from "next-intl/server";

import type en from "../messages/en.json";
import type { Locale } from "./locales";

export type Messages = typeof en;

export const formats = {
  dateTime: {
    short: { day: "numeric", month: "short", year: "numeric" },
  },
} satisfies Formats;

export type AppFormats = typeof formats;

const loaders: Record<Locale, () => Promise<{ default: Messages }>> = {
  de: () => import("../messages/de.json"),
  en: () => import("../messages/en.json"),
  fr: () => import("../messages/fr.json"),
};

interface MessageTree {
  [key: string]: string | MessageTree;
}

const isTree = (value: unknown): value is MessageTree =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Fills every missing key, at any depth, from the fallback tree. A shallow
 * spread would only fall back for whole namespaces, so one untranslated key
 * inside an existing namespace would render as its key path.
 */
export const mergeMessages = <T extends MessageTree>(
  fallback: T,
  messages: MessageTree
): T => {
  const result: MessageTree = { ...fallback };
  for (const [key, value] of Object.entries(messages)) {
    const base = result[key];
    result[key] =
      isTree(base) && isTree(value) ? mergeMessages(base, value) : value;
  }
  return result as T;
};

/** Loads a locale's UI messages, falling back to English for missing keys. */
export const loadMessages = async (locale: Locale): Promise<Messages> => {
  if (locale === "en") {
    const { default: messages } = await loaders.en();
    return messages;
  }
  // Independent imports: start both before awaiting either.
  const [{ default: messages }, { default: fallback }] = await Promise.all([
    loaders[locale](),
    loaders.en(),
  ]);
  return mergeMessages(fallback, messages);
};

export const timeZone = "Europe/Zurich";

export const createRequestConfig = async ({
  locale,
}: {
  locale: Locale;
}): Promise<RequestConfig> => ({
  formats,
  locale,
  messages: await loadMessages(locale),
  timeZone,
});
