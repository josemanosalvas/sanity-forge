import { Phone } from "lucide-react";
import { defineField, defineType } from "sanity";

import {
  buttonsField,
  definePortableTextField,
  logoLinkItem,
} from "../lib/schema-fields";

const usedByTeamsLogo = logoLinkItem("usedByTeamsLogo");

export const ctaSchema = defineType({
  fields: [
    defineField({
      description:
        "The smaller text that sits above the title to provide context",
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",
    }),
    defineField({
      description: "The large text that is the primary focus of the block",
      name: "title",
      title: "Title",
      type: "string",
    }),
    definePortableTextField(["block"], {
      description:
        "The supporting paragraph shown beneath the title, explaining what visitors get if they act",
      name: "richText",
    }),
    buttonsField,
    defineField({
      description:
        "Optional logo grid shown to the side of the heading, highlighting the teams or brands that use the product",
      fields: [
        defineField({
          description:
            'Short label displayed above the logo grid, for example "Trusted by teams at leading companies"',
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
