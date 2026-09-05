import { defineField } from "sanity";

import { GROUP } from "../../lib/constants";

export const seoFields = [
  defineField({
    name: "seoTitle",
    type: "string",
    title: "SEO Meta Title Override",
    description:
      "This will override the meta title. If left blank it will inherit the page title.",
    validation: (rule) => rule.warning("A page title is required"),
    group: GROUP.SEO,
  }),
  defineField({
    name: "seoDescription",
    type: "text",
    title: "SEO Meta Description Override",
    description:
      "This will override the meta description. If left blank it will inherit the description from the page description.",
    rows: 2,
    validation: (rule) => [
      rule.warning("A description is required"),
      rule.max(160).warning("No more than 160 characters"),
    ],
    group: GROUP.SEO,
  }),
  defineField({
    name: "seoImage",
    type: "image",
    title: "SEO Image Override",
    description:
      "This will override the main image. If left blank it will inherit the image from the main image.",
    group: GROUP.SEO,
    options: {
      hotspot: true,
    },
  }),
  defineField({
    name: "seoNoIndex",
    type: "boolean",
    title: "Do Not Index This Page",
    description: "If checked, this content won't be indexed by search engines.",
    initialValue: () => false,
    group: GROUP.SEO,
  }),
];

export const ogFields = [
  defineField({
    name: "ogTitle",
    type: "string",
    title: "Open Graph Title Override",
    description:
      "This will override the open graph title. If left blank it will inherit the page title.",
    validation: (rule) => rule.warning("A page title is required"),
    group: GROUP.OG,
  }),
  defineField({
    name: "ogDescription",
    type: "text",
    title: "Open Graph Description Override",
    description:
      "This will override the meta description. If left blank it will inherit the description from the page description.",
    rows: 2,
    validation: (rule) => [
      rule.warning("A description is required"),
      rule.max(160).warning("No more than 160 characters"),
    ],
    group: GROUP.OG,
  }),
];
