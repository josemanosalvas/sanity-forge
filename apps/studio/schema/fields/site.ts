import { siteList } from "@repo/internationalization/sites";
import { defineField } from "sanity";

/**
 * The stable site key joining a document to one of the known sites. Values
 * come from the site registry, never from editors, so routing can trust it.
 */
export const siteField = defineField({
  name: "site",
  type: "string",
  title: "Site",
  description:
    "Which site this document belongs to. Set when it is created from the site's section.",
  options: {
    list: siteList.map((site) => ({ title: site.name, value: site.key })),
    layout: "radio",
    direction: "horizontal",
  },
  validation: (rule) => rule.required(),
});
