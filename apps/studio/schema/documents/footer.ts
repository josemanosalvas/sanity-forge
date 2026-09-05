import { BadgeCheck, LayoutPanelLeft, Link, PanelBottom } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";

import { imageWithAltField, languageField, siteField } from "../fields";

const footerCreditItem = defineArrayMember({
  name: "footerCredit",
  type: "object",
  title: "Footer Credit",
  description: "A short 'made with' style credit shown in the footer bar",
  icon: BadgeCheck,
  fields: [
    defineField({
      name: "label",
      type: "string",
      title: "Label",
      description: "Text before the logo, e.g. 'Powered by' or 'Hosted on'",
    }),
    imageWithAltField({
      name: "logo",
      title: "Logo",
      description: "Brand logo shown after the label",
    }),
    defineField({
      name: "url",
      type: "url",
      title: "Link",
      description:
        "Optional website the logo links to, e.g. the brand's homepage.",
      validation: (rule) => rule.uri({ scheme: ["http", "https"] }),
    }),
  ],
  preview: {
    select: { title: "label", media: "logo" },
    prepare: ({ title, media }) => ({ title: title || "Credit", media }),
  },
});

const footerColumnLink = defineArrayMember({
  name: "footerColumnLink",
  type: "object",
  title: "Footer Link",
  description: "A single link inside a footer column",
  icon: Link,
  fields: [
    defineField({
      name: "name",
      type: "string",
      title: "Name",
      description: "Name for the link",
    }),
    defineField({
      name: "url",
      type: "customUrl",
      title: "Link URL",
      description: "The URL that this link will navigate to when clicked",
    }),
  ],
  preview: {
    select: {
      title: "name",
      externalUrl: "url.external",
      urlType: "url.type",
      internalUrl: "url.internal.slug.current",
      openInNewTab: "url.openInNewTab",
    },
    prepare({ title, externalUrl, urlType, internalUrl, openInNewTab }) {
      const url = urlType === "external" ? externalUrl : internalUrl;
      const newTabIndicator = openInNewTab ? " ↗" : "";
      const truncatedUrl = url?.length > 30 ? `${url.slice(0, 30)}...` : url;

      return {
        title: title || "Untitled Link",
        subtitle: `${urlType === "external" ? "External" : "Internal"} • ${truncatedUrl}${newTabIndicator}`,
        media: Link,
      };
    },
  },
});

const footerColumn = defineArrayMember({
  name: "footerColumn",
  type: "object",
  title: "Footer Column",
  description: "A group of footer links shown under a shared heading",
  icon: LayoutPanelLeft,
  fields: [
    defineField({
      name: "title",
      type: "string",
      title: "Title",
      description: "Title for the column",
    }),
    defineField({
      name: "links",
      type: "array",
      title: "Links",
      description: "Links for the column",
      of: [footerColumnLink],
    }),
  ],
  preview: {
    select: {
      title: "title",
      links: "links",
    },
    prepare({ title, links = [] }) {
      return {
        title: title || "Untitled Column",
        subtitle: `${links.length} link${links.length === 1 ? "" : "s"}`,
      };
    },
  },
});

/** The footer of one site in one language, localized per document like the navigation. */
export const footer = defineType({
  name: "footer",
  type: "document",
  title: "Footer",
  description: "Footer content of a site for one language",
  icon: PanelBottom,
  fields: [
    siteField,
    languageField,
    defineField({
      name: "subtitle",
      type: "text",
      title: "Subtitle",
      description: "Subtitle that sits beneath the logo in the footer",
      rows: 2,
    }),
    defineField({
      name: "columns",
      type: "array",
      title: "Columns",
      description: "Columns for the footer",
      of: [footerColumn],
    }),
    defineField({
      name: "copyright",
      type: "string",
      title: "Copyright Text",
      description:
        "Copyright line shown in the bottom bar. Leave empty for the default '© year Site name'.",
    }),
    defineField({
      name: "credits",
      type: "array",
      title: "Footer Credits",
      description:
        "Credits shown on the right of the footer bar. Each has a label and a logo (e.g. 'Powered by Sanity', 'Hosted on Vercel')",
      of: [footerCreditItem],
    }),
  ],
  preview: {
    select: {
      site: "site",
      language: "language",
    },
    prepare: ({ site, language }) => ({
      title: `Footer · ${(language ?? "??").toUpperCase()}`,
      subtitle: site,
      media: PanelBottom,
    }),
  },
});
