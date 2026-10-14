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
    "A page in one site's language. Use slug '/' for the home page. The Translations menu links separate documents, each with its own slug and publishing status.",
  fields: [
    { ...siteField, group: GROUP.MAIN_CONTENT },
    languageField,
    defineField({
      description:
        "Default title for browser tabs and search results. Also shown as the page heading when no blocks render. Otherwise, set headings in the blocks.",
      group: GROUP.MAIN_CONTENT,
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required().error("A page title is required"),
    }),
    defineField({
      description:
        "Page summary used as the default meta description. Search engines may show it in results.",
      group: GROUP.MAIN_CONTENT,
      name: "description",
      rows: 3,
      title: "Description",
      type: "text",
      validation: (rule) => [
        rule
          .min(140)
          .warning(
            "This description is shorter than the suggested 140 characters."
          ),
        rule
          .max(160)
          .warning(
            "This description exceeds the suggested 160 characters. Search engines may shorten it."
          ),
      ],
    }),
    documentSlugField("page", {
      group: GROUP.MAIN_CONTENT,
    }),
    imageWithAltField({
      description: "Default image for social sharing and search results.",
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
    prepare: ({ title, slug, media, noIndex, blocks, language, site }) => {
      const noIndexLabel = noIndex ? " · noindex" : "";
      const blockCount = blocks?.length ?? 0;
      const blockLabel = `${blockCount} ${blockCount === 1 ? "block" : "blocks"}`;

      return {
        media,
        subtitle: `${site ?? "no site"} · ${(language ?? "??").toUpperCase()}${noIndexLabel} · ${blockLabel} · ${slug || "no-slug"}`,
        title: `${title || "Untitled Page"}`,
      };
    },
    select: {
      blocks: "pageBuilder",
      language: "language",
      media: "image",
      noIndex: "seoNoIndex",
      site: "site",
      slug: "slug.current",
      title: "title",
    },
  },
  title: "Page",
  type: "document",
});
