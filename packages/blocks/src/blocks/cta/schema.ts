import { Phone } from "lucide-react";
import { defineField, defineType } from "sanity";

import {
  buttonsField,
  definePortableTextField,
  logoLinkItem,
} from "../../lib/schema-fields";

const usedByTeamsLogo = logoLinkItem("usedByTeamsLogo");

export const ctaSchema = defineType({
  fields: [
    defineField({
      description: "Short label above the title.",
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",
    }),
    defineField({
      description: "Main heading for the block.",
      name: "title",
      title: "Title",
      type: "string",
    }),
    definePortableTextField(["block"], {
      description: "Paragraph below the title.",
      name: "richText",
    }),
    buttonsField,
    defineField({
      description: "Optional logo grid beside the heading.",
      fields: [
        defineField({
          description: 'Label above the logo grid, for example "Partners".',
          name: "title",
          title: "Title",
          type: "string",
        }),
        defineField({
          description: "Add the partner or brand logos to display in the grid",
          name: "logos",
          of: [usedByTeamsLogo],
          title: "Logos",
          type: "array",
        }),
      ],
      name: "usedByTeams",
      title: "Used By Teams",
      type: "object",
    }),
  ],
  icon: Phone,
  name: "cta",
  preview: {
    prepare: ({ title }) => ({
      subtitle: "CTA Block",
      title,
    }),
    select: {
      title: "title",
    },
  },
  type: "object",
});
