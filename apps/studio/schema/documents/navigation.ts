import { LayoutPanelLeft, Link, PanelTop } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";

import { lucideIconPreview } from "../../components/icon-preview";
import { buttonsField, iconField, languageField, siteField } from "../fields";

const navigationLink = defineArrayMember({
  name: "navigationLink",
  type: "object",
  title: "Navigation Link",
  description: "Individual navigation link with name and URL",
  icon: Link,
  fields: [
    defineField({
      name: "name",
      type: "string",
      title: "Link Text",
      description: "The text that will be displayed for this navigation link",
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

const navigationColumnLink = defineArrayMember({
  name: "navigationColumnLink",
  type: "object",
  title: "Navigation Column Link",
  description: "A link within a navigation column",
  icon: LayoutPanelLeft,
  fields: [
    iconField,
    defineField({
      name: "name",
      type: "string",
      title: "Link Text",
      description: "The text that will be displayed for this navigation link",
    }),
    defineField({
      name: "description",
      type: "string",
      title: "Description",
      description: "The description for this navigation link",
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
      icon: "icon",
    },
    prepare({ title, icon, externalUrl, urlType, internalUrl, openInNewTab }) {
      const url = urlType === "external" ? externalUrl : internalUrl;
      const newTabIndicator = openInNewTab ? " ↗" : "";
      const truncatedUrl = url?.length > 30 ? `${url.slice(0, 30)}...` : url;

      return {
        title: title || "Untitled Link",
        subtitle: `${urlType === "external" ? "External" : "Internal"} • ${truncatedUrl}${newTabIndicator}`,
        media: lucideIconPreview(icon),
      };
    },
  },
});

const navigationColumn = defineArrayMember({
  name: "navigationColumn",
  type: "object",
  title: "Navigation Column",
  description: "A column of navigation links with an optional title",
  icon: LayoutPanelLeft,
  fields: [
    defineField({
      name: "title",
      type: "string",
      title: "Column Title",
      description:
        "The heading text displayed above this group of navigation links",
    }),
    defineField({
      name: "links",
      type: "array",
      title: "Column Links",
      description: "The list of navigation links to display in this column",
      validation: (rule) => [rule.required(), rule.unique()],
      of: [navigationColumnLink],
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

/**
 * The main navigation of one site in one language. Localized per document:
 * each language links to that language's pages and is published on its own.
 */
export const navigation = defineType({
  name: "navigation",
  type: "document",
  title: "Navigation",
  description: "Configure the main navigation of a site for one language",
  icon: PanelTop,
  fields: [
    siteField,
    languageField,
    defineField({
      name: "columns",
      type: "array",
      title: "Navigation Structure",
      description:
        "Build your navigation menu using columns and links. Add either a column of links or individual links.",
      of: [navigationColumn, navigationLink],
    }),
    buttonsField,
  ],
  preview: {
    select: {
      site: "site",
      language: "language",
    },
    prepare: ({ site, language }) => ({
      title: `Navigation · ${(language ?? "??").toUpperCase()}`,
      subtitle: site,
    }),
  },
});
