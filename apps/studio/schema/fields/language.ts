import { isLocale, localeLabels } from "@repo/internationalization/locales";
import {
  isSiteKey,
  siteSupportsLocale,
} from "@repo/internationalization/sites";
import { defineField } from "sanity";

/**
 * Managed by @sanity/document-internationalization (`languageField`). Hidden
 * from editors; the plugin sets it when a translation is created. The custom
 * rule keeps a site from receiving a translation in a locale it doesn't serve.
 */
export const languageField = defineField({
  hidden: true,
  name: "language",
  readOnly: true,
  title: "Language",
  type: "string",
  validation: (rule) =>
    rule.custom((value, context) => {
      if (!isLocale(value)) {
        return "A language is required";
      }
      const site = (context.document as { site?: unknown } | undefined)?.site;
      if (isSiteKey(site) && !siteSupportsLocale(site, value)) {
        return `${localeLabels[value]} is not enabled for this site`;
      }
      return true;
    }),
});
