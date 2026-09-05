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

/** Loads a locale's UI messages, falling back to English for missing namespaces. */
export const loadMessages = async (locale: Locale): Promise<Messages> => {
  const { default: messages } = await loaders[locale]();
  if (locale === "en") {
    return messages;
  }
  const { default: fallback } = await loaders.en();
  return { ...fallback, ...messages };
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
