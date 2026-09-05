import { File } from "lucide-react";
import { defineField, defineType } from "sanity";

import { GROUP, GROUPS } from "../../lib/constants";
import { pageBuilderField } from "../definitions/page-builder";
import {
  documentSlugField,
  imageWithAltField,
  languageField,
  ogFields,
  seoFields,
  siteField,
} from "../fields";

export const page = defineType({
  name: "page",
  type: "document",
  title: "Page",
  description:
    "A page of a site, like 'About us' or the home page (slug '/'). Each language is its own document, linked through the Translations menu, so it can have its own slug and be published independently.",
  icon: File,
  groups: GROUPS,
  fields: [
    { ...siteField, group: GROUP.MAIN_CONTENT },
    languageField,
    defineField({
      name: "title",
      type: "string",
      title: "Title",
      description:
        "The main heading that appears at the top of your page and in browser tabs",
      group: GROUP.MAIN_CONTENT,
      validation: (rule) => rule.required().error("A page title is required"),
    }),
    defineField({
      name: "description",
      type: "text",
      title: "Description",
      description:
        "A brief summary of what this page is about. This text helps search engines understand your page and may appear in search results.",
      rows: 3,
      group: GROUP.MAIN_CONTENT,
      validation: (rule) => [
        rule
          .min(140)
          .warning(
            "The meta description should be at least 140 characters for optimal SEO visibility in search results"
          ),
        rule
          .max(160)
          .warning(
            "The meta description should not exceed 160 characters as it will be truncated in search results"
          ),
      ],
    }),
    documentSlugField("page", {
      group: GROUP.MAIN_CONTENT,
    }),
    imageWithAltField({
      title: "Image",
      description:
        "A main picture for this page that can be used when sharing on social media or in search results",
      group: GROUP.MAIN_CONTENT,
    }),
    pageBuilderField,
    ...seoFields,
    ...ogFields,
  ],
  preview: {
    select: {
      title: "title",
      slug: "slug.current",
      media: "image",
      isPrivate: "seoNoIndex",
      hasPageBuilder: "pageBuilder",
      language: "language",
      site: "site",
    },
    prepare: ({
      title,
      slug,
      media,
      isPrivate,
      hasPageBuilder,
      language,
      site,
    }) => {
      const statusEmoji = isPrivate ? "🔒" : "🌎";
      const builderEmoji = hasPageBuilder?.length
        ? `🧱 ${hasPageBuilder.length}`
        : "🏗️";

      return {
        title: `${title || "Untitled Page"}`,
        subtitle: `${site ?? "no site"} · ${(language ?? "??").toUpperCase()} · ${statusEmoji} ${builderEmoji} · ${slug || "no-slug"}`,
        media,
      };
    },
  },
});
