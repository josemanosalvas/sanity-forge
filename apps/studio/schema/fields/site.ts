import { siteList } from "@repo/internationalization/sites";
import { defineField } from "sanity";

/**
 * The stable site key joining a document to one of the known sites. Values
 * come from the site registry, never from editors, so routing can trust it:
 * the Structure's site-aware templates set it at creation and a translation
 * copies it from its source, and it is read-only after that. Re-homing a
 * document to another brand would hide it from every query, link and preview
 * that filters on the site. Unlike `language`, which the translations menu
 * already shows, it stays visible: nothing else in the form names the owning
 * site, and it is the answer when a document is missing from a workspace.
 */
export const siteField = defineField({
  description:
    "Which site this document belongs to. Set when it is created from the site's section, and fixed after that.",
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
