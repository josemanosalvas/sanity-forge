import { defineField, defineType } from "sanity";

import { createRadioListLayout, isValidUrl } from "../../lib/helpers";

const linkableTypes = [{ type: "page" }];

export const customUrl = defineType({
  description:
    "Configure a link that can point to either an internal page or external website",
  fields: [
    defineField({
      description:
        "Choose whether this link points to another page on this site (internal) or to a different website (external)",
      initialValue: () => "external",
      name: "type",
      options: createRadioListLayout(["internal", "external"]),
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      description:
        "When enabled, clicking this link will open the destination in a new browser tab instead of navigating away from the current page",
      initialValue: () => false,
      name: "openInNewTab",
      title: "Open In New Tab",
      type: "boolean",
    }),
    defineField({
      description:
        "Enter either a full web address (URL) starting with https:// for external sites, or a relative path like /about for internal pages",
      hidden: ({ parent }) => parent?.type !== "external",
      name: "external",
      title: "URL",
      type: "string",
      validation: (rule) => [
        rule.custom((value, { parent }) => {
          const type = (parent as { type?: string })?.type;
          if (type === "external") {
            if (!value) {
              return "URL can't be empty";
            }
            if (!isValidUrl(value)) {
              return "Enter a http, https, mailto or tel address, or a relative path like /about";
            }
          }
          return true;
        }),
      ],
    }),
    defineField({
      description:
        "Technical field used internally to store the complete URL - you don't need to modify this",
      hidden: true,
      initialValue: () => "#",
      name: "href",
      readOnly: true,
      type: "string",
    }),
    defineField({
      description:
        "Select which page on this site the link should point to. Pages from the same site in any language are offered; the link keeps that page's language.",
      hidden: ({ parent }) => parent?.type !== "internal",
      name: "internal",
      options: {
        disableNew: true,
        // Only pages of the document's own site can be linked; cross-site
        // links are external links with a full URL.
        filter: ({ document }) => {
          const site = (document as { site?: string } | undefined)?.site;
          return site
            ? { filter: "site == $site", params: { site } }
            : { filter: "defined(site)" };
        },
      },
      to: linkableTypes,
      type: "reference",
      validation: (rule) => [
        rule.custom((value, { parent }) => {
          const type = (parent as { type?: string })?.type;
          if (type === "internal" && !value?._ref) {
            return "internal can't be empty";
          }
          return true;
        }),
      ],
    }),
  ],
  name: "customUrl",
  preview: {
    prepare({ externalUrl, urlType, internalUrl, openInNewTab }) {
      const url = urlType === "external" ? externalUrl : `${internalUrl}`;
      const newTabIndicator = openInNewTab ? " ↗" : "";
      return {
        subtitle: `${url}${newTabIndicator}`,
        title: `${urlType === "external" ? "External" : "Internal"} Link`,
      };
    },
    select: {
      externalUrl: "external",
      internalUrl: "internal.slug.current",
      openInNewTab: "openInNewTab",
      urlType: "type",
    },
  },
  type: "object",
});
