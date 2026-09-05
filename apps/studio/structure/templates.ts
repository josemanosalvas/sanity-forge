import type { Template } from "sanity";

import { SITE_SCOPED_TYPES } from "../lib/constants";
import { templateIds } from "./index";

const siteParameter = { name: "site", title: "Site", type: "string" } as const;
const languageParameter = {
  name: "language",
  title: "Language",
  type: "string",
} as const;

interface SiteLanguageParams {
  site: string;
  language: string;
  slug?: string;
  title?: string;
}

/**
 * Initial value templates that carry the site and language a document is
 * created for. The Structure passes the parameters, so the bare per-type
 * templates are removed: a site-scoped document must never be created
 * without its scope.
 */
export const createTemplates = (previous: Template[]): Template[] => [
  ...previous.filter(
    (template) =>
      !(SITE_SCOPED_TYPES as readonly string[]).includes(template.id) &&
      template.id !== "faq"
  ),
  {
    id: templateIds.page,
    parameters: [
      siteParameter,
      languageParameter,
      { name: "slug", type: "string" },
      { name: "title", type: "string" },
    ],
    schemaType: "page",
    title: "Page",
    value: ({ site, language, slug, title }: SiteLanguageParams) => ({
      language,
      site,
      ...(slug ? { slug: { _type: "slug", current: slug } } : {}),
      ...(title ? { title } : {}),
    }),
  },
  {
    id: templateIds.navigation,
    parameters: [siteParameter, languageParameter],
    schemaType: "navigation",
    title: "Navigation",
    value: ({ site, language }: SiteLanguageParams) => ({ language, site }),
  },
  {
    id: templateIds.footer,
    parameters: [siteParameter, languageParameter],
    schemaType: "footer",
    title: "Footer",
    value: ({ site, language }: SiteLanguageParams) => ({ language, site }),
  },
  {
    id: templateIds.settings,
    parameters: [siteParameter],
    schemaType: "settings",
    title: "Site settings",
    value: ({ site }: { site: string }) => ({ site }),
  },
  {
    id: templateIds.redirect,
    parameters: [siteParameter],
    schemaType: "redirect",
    title: "Redirect",
    value: ({ site }: { site: string }) => ({ site }),
  },
  {
    id: templateIds.faq,
    parameters: [languageParameter],
    schemaType: "faq",
    title: "FAQ",
    value: ({ language }: { language: string }) => ({ language }),
  },
];
