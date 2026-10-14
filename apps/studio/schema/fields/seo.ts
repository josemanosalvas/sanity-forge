import { defineField } from "sanity";

import { GROUP } from "../../lib/constants";

export const seoFields = [
  defineField({
    description:
      "Override the page title in metadata. Leave blank to use the page title.",
    group: GROUP.SEO,
    name: "seoTitle",
    title: "SEO Meta Title Override",
    type: "string",
  }),
  defineField({
    description:
      "Override the meta description. Leave blank to use the page description.",
    group: GROUP.SEO,
    name: "seoDescription",
    rows: 2,
    title: "SEO Meta Description Override",
    type: "text",
    validation: (rule) => rule.max(160).warning("No more than 160 characters"),
  }),
  defineField({
    description:
      "Override the social sharing image. Leave blank to use the page image.",
    group: GROUP.SEO,
    name: "seoImage",
    options: {
      hotspot: true,
    },
    title: "SEO Image Override",
    type: "image",
  }),
  defineField({
    description:
      "Ask search engines not to index this page and omit it from the sitemap.",
    group: GROUP.SEO,
    initialValue: false,
    name: "seoNoIndex",
    title: "Do Not Index This Page",
    type: "boolean",
  }),
];

export const ogFields = [
  defineField({
    description:
      "Override the Open Graph title. Leave blank to use the SEO title or page title.",
    group: GROUP.OG,
    name: "ogTitle",
    title: "Open Graph Title Override",
    type: "string",
  }),
  defineField({
    description:
      "Override the Open Graph description. Leave blank to use the meta description.",
    group: GROUP.OG,
    name: "ogDescription",
    rows: 2,
    title: "Open Graph Description Override",
    type: "text",
    validation: (rule) => rule.max(160).warning("No more than 160 characters"),
  }),
];
