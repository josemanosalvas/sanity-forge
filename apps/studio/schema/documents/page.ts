import { imageWithAltField } from "@repo/blocks/lib/schema-fields";
import { File } from "lucide-react";
import { defineField, defineType } from "sanity";

import { GROUP, GROUPS } from "../../lib/constants";
import { pageBuilderField } from "../definitions/page-builder";
import { languageField } from "../fields/language";
import { ogFields, seoFields } from "../fields/seo";
import { siteField } from "../fields/site";
import { documentSlugField } from "../fields/slug";

export const page = defineType({
  description:
    "A page of a site, like 'About us' or the home page (slug '/'). Each language is its own document, linked through the Translations menu, so it can have its own slug and be published independently.",
  fields: [
    { ...siteField, group: GROUP.MAIN_CONTENT },
    languageField,
    defineField({
      description:
        "The main heading that appears at the top of your page and in browser tabs",
      group: GROUP.MAIN_CONTENT,
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required().error("A page title is required"),
    }),
    defineField({
      description:
        "A brief summary of what this page is about. This text helps search engines understand your page and may appear in search results.",
      group: GROUP.MAIN_CONTENT,
      name: "description",
      rows: 3,
      title: "Description",
      type: "text",
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
      description:
        "A main picture for this page that can be used when sharing on social media or in search results",
      group: GROUP.MAIN_CONTENT,
      title: "Image",
    }),
    pageBuilderField,
    ...seoFields,
    ...ogFields,
  ],
  groups: GROUPS,
  icon: File,
  name: "page",
  preview: {
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
        media,
        subtitle: `${site ?? "no site"} · ${(language ?? "??").toUpperCase()} · ${statusEmoji} ${builderEmoji} · ${slug || "no-slug"}`,
        title: `${title || "Untitled Page"}`,
      };
    },
    select: {
      hasPageBuilder: "pageBuilder",
      isPrivate: "seoNoIndex",
      language: "language",
      media: "image",
      site: "site",
      slug: "slug.current",
      title: "title",
    },
  },
  title: "Page",
  type: "document",
});
