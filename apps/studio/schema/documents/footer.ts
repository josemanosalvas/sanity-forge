import { imageWithAltField } from "@repo/blocks/lib/schema-fields";
import { BadgeCheck, LayoutPanelLeft, Link, PanelBottom } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";

import { columnPreview, linkPreviewSubtitle } from "../../lib/helpers";
import { singletonIdRule } from "../../lib/singletons";
import { languageField } from "../fields/language";
import { siteField } from "../fields/site";

const footerCreditItem = defineArrayMember({
  description: "A short 'made with' style credit shown in the footer bar",
  fields: [
    defineField({
      description: "Text before the logo, e.g. 'Powered by' or 'Hosted on'",
      name: "label",
      title: "Label",
      type: "string",
    }),
    imageWithAltField({
      description: "Brand logo shown after the label",
      name: "logo",
      title: "Logo",
    }),
    defineField({
      description:
        "Optional website the logo links to, e.g. the brand's homepage.",
      name: "url",
      title: "Link",
      type: "url",
      validation: (rule) => rule.uri({ scheme: ["http", "https"] }),
    }),
  ],
  icon: BadgeCheck,
  name: "footerCredit",
  preview: {
    prepare: ({ title, media }) => ({ media, title: title || "Credit" }),
    select: { media: "logo", title: "label" },
  },
  title: "Footer Credit",
  type: "object",
});

const footerColumnLink = defineArrayMember({
  description: "A single link inside a footer column",
  fields: [
    defineField({
      name: "name",
      title: "Link Text",
      type: "string",
    }),
    defineField({
      name: "url",
      title: "Link URL",
      type: "customUrl",
    }),
  ],
  icon: Link,
  name: "footerColumnLink",
  preview: {
    prepare: ({ title, ...link }) => ({
      media: Link,
      subtitle: linkPreviewSubtitle(link),
      title: title || "Untitled Link",
    }),
    select: {
      externalUrl: "url.external",
      internalUrl: "url.internal.slug.current",
      openInNewTab: "url.openInNewTab",
      title: "name",
      urlType: "url.type",
    },
  },
  title: "Footer Link",
  type: "object",
});

const footerColumn = defineArrayMember({
  description: "A group of footer links shown under a shared heading",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
    }),
    defineField({
      name: "links",
      of: [footerColumnLink],
      title: "Links",
      type: "array",
    }),
  ],
  icon: LayoutPanelLeft,
  name: "footerColumn",
  preview: {
    prepare: columnPreview,
    select: {
      links: "links",
      title: "title",
    },
  },
  title: "Footer Column",
  type: "object",
});

/** The footer of one site in one language: one document per site and language, like the navigation. */
export const footer = defineType({
  description: "Footer content of a site for one language",
  fields: [
    siteField,
    languageField,
    defineField({
      description: "Subtitle that sits beneath the logo in the footer",
      name: "subtitle",
      rows: 2,
      title: "Subtitle",
      type: "text",
    }),
    defineField({
      name: "columns",
      of: [footerColumn],
      title: "Columns",
      type: "array",
    }),
    defineField({
      description:
        "Copyright line shown in the bottom bar. Leave empty for the default '© Site name. All rights reserved.'",
      name: "copyright",
      title: "Copyright Text",
      type: "string",
    }),
    defineField({
      description:
        "Credits shown on the right of the footer bar. Each has a label and a logo (e.g. 'Powered by Sanity', 'Hosted on Vercel')",
      name: "credits",
      of: [footerCreditItem],
      title: "Footer Credits",
      type: "array",
    }),
  ],
  icon: PanelBottom,
  name: "footer",
  preview: {
    prepare: ({ site, language }) => ({
      media: PanelBottom,
      subtitle: site,
      title: `Footer · ${(language ?? "??").toUpperCase()}`,
    }),
    select: {
      language: "language",
      site: "site",
    },
  },
  title: "Footer",
  type: "document",
  validation: singletonIdRule("footer"),
});
