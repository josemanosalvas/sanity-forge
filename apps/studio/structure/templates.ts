import type { Template } from "sanity";

import { SITE_SCOPED_TYPES } from "../lib/constants";
import { templateIds } from "./index";

const siteParameter = { name: "site", type: "string", title: "Site" } as const;
const languageParameter = {
  name: "language",
  type: "string",
  title: "Language",
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
    title: "Page",
    schemaType: "page",
    parameters: [
      siteParameter,
      languageParameter,
      { name: "slug", type: "string" },
      { name: "title", type: "string" },
    ],
    value: ({ site, language, slug, title }: SiteLanguageParams) => ({
      site,
      language,
      ...(slug ? { slug: { current: slug, _type: "slug" } } : {}),
      ...(title ? { title } : {}),
    }),
  },
  {
    id: templateIds.navigation,
    title: "Navigation",
    schemaType: "navigation",
    parameters: [siteParameter, languageParameter],
    value: ({ site, language }: SiteLanguageParams) => ({ site, language }),
  },
  {
    id: templateIds.footer,
    title: "Footer",
    schemaType: "footer",
    parameters: [siteParameter, languageParameter],
    value: ({ site, language }: SiteLanguageParams) => ({ site, language }),
  },
  {
    id: templateIds.settings,
    title: "Site settings",
    schemaType: "settings",
    parameters: [siteParameter],
    value: ({ site }: { site: string }) => ({ site }),
  },
  {
    id: templateIds.redirect,
    title: "Redirect",
    schemaType: "redirect",
    parameters: [siteParameter],
    value: ({ site }: { site: string }) => ({ site }),
  },
  {
    id: templateIds.faq,
    title: "FAQ",
    schemaType: "faq",
    parameters: [languageParameter],
    value: ({ language }: { language: string }) => ({ language }),
  },
];
