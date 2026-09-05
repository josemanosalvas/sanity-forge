import { defineField } from "sanity";

import { GROUP } from "../../lib/constants";

export const seoFields = [
  defineField({
    description:
      "This will override the meta title. If left blank it will inherit the page title.",
    group: GROUP.SEO,
    name: "seoTitle",
    title: "SEO Meta Title Override",
    type: "string",
    validation: (rule) => rule.warning("A page title is required"),
  }),
  defineField({
    description:
      "This will override the meta description. If left blank it will inherit the description from the page description.",
    group: GROUP.SEO,
    name: "seoDescription",
    rows: 2,
    title: "SEO Meta Description Override",
    type: "text",
    validation: (rule) => [
      rule.warning("A description is required"),
      rule.max(160).warning("No more than 160 characters"),
    ],
  }),
  defineField({
    description:
      "This will override the main image. If left blank it will inherit the image from the main image.",
    group: GROUP.SEO,
    name: "seoImage",
    options: {
      hotspot: true,
    },
    title: "SEO Image Override",
    type: "image",
  }),
  defineField({
    description: "If checked, this content won't be indexed by search engines.",
    group: GROUP.SEO,
    initialValue: () => false,
    name: "seoNoIndex",
    title: "Do Not Index This Page",
    type: "boolean",
  }),
];

export const ogFields = [
  defineField({
    description:
      "This will override the open graph title. If left blank it will inherit the page title.",
    group: GROUP.OG,
    name: "ogTitle",
    title: "Open Graph Title Override",
    type: "string",
    validation: (rule) => rule.warning("A page title is required"),
  }),
  defineField({
    description:
      "This will override the meta description. If left blank it will inherit the description from the page description.",
    group: GROUP.OG,
    name: "ogDescription",
    rows: 2,
    title: "Open Graph Description Override",
    type: "text",
    validation: (rule) => [
      rule.warning("A description is required"),
      rule.max(160).warning("No more than 160 characters"),
    ],
  }),
];
