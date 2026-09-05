import { defineField, defineType } from "sanity";

import { createRadioListLayout, isValidUrl } from "../../lib/helpers";
import {
  internalPageFilter,
  linkedPageRule,
  linkTypeRule,
} from "../../lib/link-scope";

const linkableTypes = [{ type: "page" }];

export const customUrl = defineType({
  description:
    "Configure a link that can point to either an internal page or external website",
  fields: [
    defineField({
      description:
        "Internal points at a page of this site. External is any address: a full https:// URL, or a path such as /about. Shared content (FAQs) uses External only, because it is shown on more than one site.",
      initialValue: "external",
      name: "type",
      options: createRadioListLayout(["internal", "external"]),
      type: "string",
      validation: (rule) => [
        rule.required(),
        rule.custom((value, { document }) => linkTypeRule(value, document)),
      ],
    }),
    defineField({
      description:
        "When enabled, clicking this link will open the destination in a new browser tab instead of navigating away from the current page",
      initialValue: false,
      name: "openInNewTab",
      title: "Open In New Tab",
      type: "boolean",
    }),
    defineField({
      description:
        "A full web address starting with https://, or a path such as /about. A path opens on whichever site shows this content; a full address always opens one site.",
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
      initialValue: "#",
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
        // Only pages of the document's own site; none for shared content.
        filter: ({ document }) => internalPageFilter(document),
      },
      to: linkableTypes,
      type: "reference",
      validation: (rule) => [
        rule.custom((value, context) => {
          const type = (context.parent as { type?: string })?.type;
          if (type !== "internal") {
            return true;
          }
          if (!value?._ref) {
            return "internal can't be empty";
          }
          return linkedPageRule(value, context);
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
