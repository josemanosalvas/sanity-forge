import type { Formats } from "next-intl";
import type { RequestConfig } from "next-intl/server";

import type en from "../messages/en.json";
import type { Locale } from "./locales";

export type Messages = typeof en;

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export type PartialMessages = DeepPartial<Messages>;

type Loader<T> = () => Promise<{ default: T }>;

export type MessageLoaders = { en: Loader<Messages> } & Record<
  Exclude<Locale, "en">,
  Loader<PartialMessages>
>;

export const formats = {
  dateTime: {
    short: { day: "numeric", month: "short", year: "numeric" },
  },
} satisfies Formats;

export type AppFormats = typeof formats;

const loaders: MessageLoaders = {
  de: () => import("../messages/de.json"),
  en: () => import("../messages/en.json"),
  fr: () => import("../messages/fr.json"),
};

interface MessageTree {
  [key: string]: string | MessageTree;
}

const isTree = (value: unknown): value is MessageTree =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const mergeTrees = (fallback: MessageTree, messages: MessageTree) => {
  const result: MessageTree = { ...fallback };
  for (const [key, value] of Object.entries(messages)) {
    const base = result[key];
    result[key] =
      isTree(base) && isTree(value) ? mergeTrees(base, value) : value;
  }
  return result;
};

export const mergeMessages = (
  fallback: Messages,
  messages: PartialMessages
): Messages => mergeTrees(fallback, messages) as unknown as Messages;

export const loadMessages = async (
  locale: Locale,
  load: MessageLoaders = loaders
): Promise<Messages> => {
  if (locale === "en") {
    const { default: messages } = await load.en();
    return messages;
  }
  const [{ default: messages }, { default: fallback }] = await Promise.all([
    load[locale](),
    load.en(),
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
