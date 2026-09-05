import { Link, Users } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";

import { imageWithAltField } from "../../lib/schema-fields";

const SOCIAL_PLATFORMS = [
  { title: "Reddit", value: "reddit" },
  { title: "X (Twitter)", value: "x" },
  { title: "YouTube", value: "youtube" },
  { title: "GitHub", value: "github" },
  { title: "LinkedIn", value: "linkedin" },
  { title: "Facebook", value: "facebook" },
  { title: "Instagram", value: "instagram" },
  { title: "Slack", value: "slack" },
] as const;

const socialGridItem = defineArrayMember({
  fields: [
    defineField({
      description:
        "Choose which social platform this card links to. It decides the logo shown in the centre of the card",
      name: "platform",
      options: {
        layout: "dropdown",
        list: [...SOCIAL_PLATFORMS],
      },
      title: "Platform",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      description:
        'The name shown at the bottom of the card, for example "Reddit" or "X [Twitter]"',
      name: "label",
      title: "Label",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    imageWithAltField({
      description:
        "Optional custom logo image for this card. When set, it replaces the built-in platform icon in the centre of the card.",
      name: "logo",
      title: "Logo",
    }),
    defineField({
      description:
        "Where visitors go when they click this card, for example your community's profile page",
      name: "url",
      title: "Link URL",
      type: "customUrl",
    }),
  ],
  icon: Link,
  name: "socialGridItem",
  preview: {
    prepare: ({ label, platform }) => ({
      subtitle: platform,
      title: label || platform || "Social card",
    }),
    select: {
      label: "label",
      platform: "platform",
    },
  },
  type: "object",
});

export const socialGridSchema = defineType({
  description:
    "A community section with a heading and a row of large cards linking to your social platforms",
  fields: [
    defineField({
      description:
        'Short label shown in a pill above the title, for example "Socials"',
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",
    }),
    defineField({
      description:
        'The main heading for this section, for example "Join our community"',
      name: "title",
      title: "Title",
      type: "string",
    }),
    defineField({
      description:
        "A short supporting sentence shown beneath the title to add context",
      name: "subtitle",
      rows: 2,
      title: "Subtitle",
      type: "text",
    }),
    defineField({
      description: "Add the social platform cards to display in the row",
      name: "socials",
      of: [socialGridItem],
      title: "Social Cards",
      type: "array",
    }),
  ],
  icon: Users,
  name: "socialGrid",
  preview: {
    prepare: ({ title, socials = [] }) => {
      const count = socials.length;
      const label = count === 1 ? "card" : "cards";
      return {
        subtitle: `${count} ${label}`,
        title: title || "Social Grid",
      };
    },
    select: {
      socials: "socials",
      title: "title",
    },
  },
  title: "Social Grid",
  type: "object",
});
