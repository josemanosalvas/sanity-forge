import {
  localizedSingletonId,
  settingsDocumentId,
} from "@repo/blocks/lib/singletons";
import type { LocalizedSingletonType } from "@repo/blocks/lib/singletons";
import { localeLabels } from "@repo/internationalization/locales";
import type { Locale } from "@repo/internationalization/locales";
import type { Site } from "@repo/internationalization/sites";
import {
  Cog,
  EyeOff,
  File,
  Folder,
  Languages,
  MessageCircle,
  PanelBottom,
  PanelTop,
  TrendingUpDown,
} from "lucide-react";
import type { StructureBuilder, StructureResolver } from "sanity/structure";

import { API_VERSION } from "../lib/constants";
import { createPagesByPathList } from "./nested-pages";

export const templateIds = {
  faq: "faq-by-language",
  footer: "footer-by-site-language",
  navigation: "navigation-by-site-language",
  page: "page-by-site-language",
  redirect: "redirect-by-site",
  settings: "settings-by-site",
} as const;

/**
 * One document per language for a localized singleton. Opening a language
 * opens the document the site reads for it, created from the template on
 * first use; there is no list to add a second one to. Documents of the type
 * under any other ID are never read, so they are listed at the end where an
 * editor can find and delete them.
 */
const languageDocuments = (
  S: StructureBuilder,
  site: Site,
  {
    type,
    title,
    templateId,
    icon,
  }: {
    type: LocalizedSingletonType;
    title: string;
    templateId: string;
    icon: typeof File;
  }
) => {
  const ids = site.locales.map((language) =>
    localizedSingletonId(type, site.key, language)
  );
  return [
    ...site.locales.map((language: Locale) =>
      S.listItem()
        .id(`${type}-${language}`)
        .title(localeLabels[language])
        .icon(icon)
        .child(
          S.document()
            .id(`${type}-${language}`)
            .schemaType(type)
            .documentId(localizedSingletonId(type, site.key, language))
            .title(`${title} (${language.toUpperCase()})`)
            .initialValueTemplate(templateId, { language, site: site.key })
        )
    ),
    S.divider(),
    S.listItem()
      .id(`${type}-unused`)
      .title("Not shown on the site")
      .icon(EyeOff)
      .child(
        S.documentList()
          .apiVersion(API_VERSION)
          .id(`${type}-unused`)
          .title(`${title} documents the site never reads`)
          .schemaType(type)
          .filter(
            "_type == $type && site == $site && !(_id in $ids) && !(_id in $draftIds)"
          )
          .params({
            draftIds: ids.map((id) => `drafts.${id}`),
            ids,
            site: site.key,
            type,
          })
          .defaultOrdering([{ direction: "desc", field: "_updatedAt" }])
      ),
  ];
};

const pagesForLanguage = (S: StructureBuilder, site: Site, language: Locale) =>
  S.listItem()
    .id(`pages-${language}`)
    .title(localeLabels[language])
    .icon(File)
    .child(
      S.list()
        .id(`pages-${language}`)
        .title(`Pages (${language.toUpperCase()})`)
        .items([
          S.listItem()
            .id(`all-pages-${language}`)
            .title("All pages")
            .icon(File)
            .child(
              S.documentList()
                .apiVersion(API_VERSION)
                .id(`all-pages-${language}`)
                .title(`All pages (${language.toUpperCase()})`)
                .schemaType("page")
                .filter(
                  '_type == "page" && site == $site && language == $language'
                )
                .params({ language, site: site.key })
                .defaultOrdering([{ direction: "desc", field: "_updatedAt" }])
                .initialValueTemplates([
                  S.initialValueTemplateItem(templateIds.page, {
                    language,
                    site: site.key,
                  }),
                ])
            ),
          S.listItem()
            .id(`pages-by-path-${language}`)
            .title("Pages by path")
            .icon(Folder)
            .child(
              createPagesByPathList(S, {
                language,
                schemaType: "page",
                site: site.key,
                templateId: templateIds.page,
              })
            ),
        ])
    );

export const createStructure =
  (site: Site): StructureResolver =>
  (S) =>
    S.list()
      .title(site.name)
      .items([
        S.listItem()
          .id("pages")
          .title("Pages")
          .icon(File)
          .child(
            S.list()
              .id("pages")
              .title("Pages")
              .items(
                site.locales.map((language) =>
                  pagesForLanguage(S, site, language)
                )
              )
          ),
        S.divider(),
        S.listItem()
          .id("navigation")
          .title("Navigation")
          .icon(PanelTop)
          .child(
            S.list()
              .id("navigation")
              .title("Navigation")
              .items(
                languageDocuments(S, site, {
                  icon: PanelTop,
                  templateId: templateIds.navigation,
                  title: "Navigation",
                  type: "navigation",
                })
              )
          ),
        S.listItem()
          .id("footer")
          .title("Footer")
          .icon(PanelBottom)
          .child(
            S.list()
              .id("footer")
              .title("Footer")
              .items(
                languageDocuments(S, site, {
                  icon: PanelBottom,
                  templateId: templateIds.footer,
                  title: "Footer",
                  type: "footer",
                })
              )
          ),
        S.listItem()
          .id("settings")
          .title("Site settings")
          .icon(Cog)
          .child(
            S.document()
              .schemaType("settings")
              .documentId(settingsDocumentId(site.key))
              .initialValueTemplate(templateIds.settings, { site: site.key })
          ),
        S.listItem()
          .id("redirects")
          .title("Redirects")
          .icon(TrendingUpDown)
          .child(
            S.documentList()
              .apiVersion(API_VERSION)
              .id("redirects")
              .title("Redirects")
              .schemaType("redirect")
              .filter('_type == "redirect" && site == $site')
              .params({ site: site.key })
              .initialValueTemplates([
                S.initialValueTemplateItem(templateIds.redirect, {
                  site: site.key,
                }),
              ])
          ),
        S.divider(),
        S.listItem()
          .id("shared")
          .title("Shared content")
          .icon(Languages)
          .child(
            S.list()
              .id("shared")
              .title("Shared content")
              .items([
                S.listItem()
                  .id("faqs")
                  .title("FAQs")
                  .icon(MessageCircle)
                  .child(
                    S.list()
                      .id("faqs")
                      .title("FAQs")
                      .items(
                        site.locales.map((language) =>
                          S.listItem()
                            .id(`faq-${language}`)
                            .title(localeLabels[language])
                            .icon(MessageCircle)
                            .child(
                              S.documentList()
                                .apiVersion(API_VERSION)
                                .id(`faq-${language}`)
                                .title(`FAQs (${language.toUpperCase()})`)
                                .schemaType("faq")
                                .filter(
                                  '_type == "faq" && language == $language'
                                )
                                .params({ language })
                                .initialValueTemplates([
                                  S.initialValueTemplateItem(templateIds.faq, {
                                    language,
                                  }),
                                ])
                            )
                        )
                      )
                  ),
              ])
          ),
      ]);
