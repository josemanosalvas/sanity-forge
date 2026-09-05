import {
  localizedSingletonId,
  settingsDocumentId,
} from "@repo/blocks/lib/singletons";
import type { SingletonType } from "@repo/blocks/lib/singletons";
import { isLocale, localeLabels } from "@repo/internationalization/locales";
import { getSite, isSiteKey } from "@repo/internationalization/sites";
import { getPublishedId } from "sanity";
import type { DocumentRule } from "sanity";

interface SingletonScope {
  site?: unknown;
  language?: unknown;
}

/** Where the Structure lists each singleton, for validation messages. */
const STRUCTURE_TITLES: Record<SingletonType, string> = {
  footer: "Footer",
  navigation: "Navigation",
  settings: "Site settings",
};

/** The only ID a singleton may have in its scope; undefined while the scope is incomplete. */
export const expectedSingletonId = (
  type: SingletonType,
  { site, language }: SingletonScope
): string | undefined => {
  if (!isSiteKey(site)) {
    return undefined;
  }
  if (type === "settings") {
    return settingsDocumentId(site);
  }
  return isLocale(language)
    ? localizedSingletonId(type, site, language)
    : undefined;
};

/**
 * Document-level rule: the site reads a singleton from one fixed ID, so a
 * document under any other ID — an import, a copy — is never displayed, and
 * publishing it would change nothing. The message points editors to the
 * document that is.
 */
export const singletonIdRule =
  (type: SingletonType) =>
  (rule: DocumentRule): DocumentRule =>
    rule.custom((document) => {
      const expected = expectedSingletonId(type, document ?? {});
      if (!(document?._id && expected)) {
        return true;
      }
      if (getPublishedId(document._id) === expected) {
        return true;
      }
      const site = getSite(document.site as Parameters<typeof getSite>[0]);
      const language = isLocale(document.language)
        ? ` → ${localeLabels[document.language]}`
        : "";
      return `The ${site.name} site never shows this document: it reads its ${STRUCTURE_TITLES[type].toLowerCase()} from one fixed document. Open ${STRUCTURE_TITLES[type]}${language} in the ${site.name} workspace to edit that one, and delete this copy.`;
    });
