import { LayoutPanelLeft, Link, PanelTop } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";

import { lucideIconPreview } from "../../components/icon-preview";
import { buttonsField, iconField, languageField, siteField } from "../fields";

const navigationLink = defineArrayMember({
  description: "Individual navigation link with name and URL",
  fields: [
    defineField({
      description: "The text that will be displayed for this navigation link",
      name: "name",
      title: "Link Text",
      type: "string",
    }),
    defineField({
      description: "The URL that this link will navigate to when clicked",
      name: "url",
      title: "Link URL",
      type: "customUrl",
    }),
  ],
  icon: Link,
  name: "navigationLink",
  preview: {
    prepare({ title, externalUrl, urlType, internalUrl, openInNewTab }) {
      const url = urlType === "external" ? externalUrl : internalUrl;
      const newTabIndicator = openInNewTab ? " ↗" : "";
      const truncatedUrl = url?.length > 30 ? `${url.slice(0, 30)}...` : url;

      return {
        media: Link,
        subtitle: `${urlType === "external" ? "External" : "Internal"} • ${truncatedUrl}${newTabIndicator}`,
        title: title || "Untitled Link",
      };
    },
    select: {
      externalUrl: "url.external",
      internalUrl: "url.internal.slug.current",
      openInNewTab: "url.openInNewTab",
      title: "name",
      urlType: "url.type",
    },
  },
  title: "Navigation Link",
  type: "object",
});

const navigationColumnLink = defineArrayMember({
  description: "A link within a navigation column",
  fields: [
    iconField,
    defineField({
      description: "The text that will be displayed for this navigation link",
      name: "name",
      title: "Link Text",
      type: "string",
    }),
    defineField({
      description: "The description for this navigation link",
      name: "description",
      title: "Description",
      type: "string",
    }),
    defineField({
      description: "The URL that this link will navigate to when clicked",
      name: "url",
      title: "Link URL",
      type: "customUrl",
    }),
  ],
  icon: LayoutPanelLeft,
  name: "navigationColumnLink",
  preview: {
    prepare({ title, icon, externalUrl, urlType, internalUrl, openInNewTab }) {
      const url = urlType === "external" ? externalUrl : internalUrl;
      const newTabIndicator = openInNewTab ? " ↗" : "";
      const truncatedUrl = url?.length > 30 ? `${url.slice(0, 30)}...` : url;

      return {
        media: lucideIconPreview(icon),
        subtitle: `${urlType === "external" ? "External" : "Internal"} • ${truncatedUrl}${newTabIndicator}`,
        title: title || "Untitled Link",
      };
    },
    select: {
      externalUrl: "url.external",
      icon: "icon",
      internalUrl: "url.internal.slug.current",
      openInNewTab: "url.openInNewTab",
      title: "name",
      urlType: "url.type",
    },
  },
  title: "Navigation Column Link",
  type: "object",
});

const navigationColumn = defineArrayMember({
  description: "A column of navigation links with an optional title",
  fields: [
    defineField({
      description:
        "The heading text displayed above this group of navigation links",
      name: "title",
      title: "Column Title",
      type: "string",
    }),
    defineField({
      description: "The list of navigation links to display in this column",
      name: "links",
      of: [navigationColumnLink],
      title: "Column Links",
      type: "array",
      validation: (rule) => [rule.required(), rule.unique()],
    }),
  ],
  icon: LayoutPanelLeft,
  name: "navigationColumn",
  preview: {
    prepare({ title, links = [] }) {
      return {
        subtitle: `${links.length} link${links.length === 1 ? "" : "s"}`,
        title: title || "Untitled Column",
      };
    },
    select: {
      links: "links",
      title: "title",
    },
  },
  title: "Navigation Column",
  type: "object",
});

/**
 * The main navigation of one site in one language. Localized per document:
 * each language links to that language's pages and is published on its own.
 */
export const navigation = defineType({
  description: "Configure the main navigation of a site for one language",
  fields: [
    siteField,
    languageField,
    defineField({
      description:
        "Build your navigation menu using columns and links. Add either a column of links or individual links.",
      name: "columns",
      of: [navigationColumn, navigationLink],
      title: "Navigation Structure",
      type: "array",
    }),
    buttonsField,
  ],
  icon: PanelTop,
  name: "navigation",
  preview: {
    prepare: ({ site, language }) => ({
      subtitle: site,
      title: `Navigation · ${(language ?? "??").toUpperCase()}`,
    }),
    select: {
      language: "language",
      site: "site",
    },
  },
  title: "Navigation",
  type: "document",
});
