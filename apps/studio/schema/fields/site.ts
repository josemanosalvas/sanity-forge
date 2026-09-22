import { siteList } from "@repo/internationalization/sites";
import { defineField } from "sanity";

// Templates and translations set the site; editors can see it but cannot move content between sites.
export const siteField = defineField({
  description: "Set when the document is created; cannot be changed in Studio.",
  name: "site",
  options: {
    direction: "horizontal",
    layout: "radio",
    list: siteList.map((site) => ({ title: site.name, value: site.key })),
  },
  readOnly: true,
  title: "Site",
  type: "string",
  validation: (rule) => rule.required(),
});
