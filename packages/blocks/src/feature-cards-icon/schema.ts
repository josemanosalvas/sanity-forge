import { LayoutGrid } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";

import { lucideIconPreview } from "../components/lucide-icon-preview";
import { definePortableTextField, iconField } from "../lib/schema-fields";

const featureCardIconItem = defineArrayMember({
  fields: [
    iconField,
    defineField({
      description: "The heading text for this feature card",
      name: "title",
      title: "Title",
      type: "string",
    }),
    definePortableTextField(["block"], {
      description: "The short description shown beneath this card's heading",
      name: "richText",
    }),
  ],
  name: "featureCardIcon",
  preview: {
    prepare: ({ icon, title }) => ({
      media: lucideIconPreview(icon),
      title: title ?? "Untitled",
    }),
    select: {
      icon: "icon",
      title: "title",
    },
  },
  type: "object",
});

export const featureCardsIconSchema = defineType({
  description:
    "A grid of feature cards, each with an icon, title and description",
  fields: [
    defineField({
      description: "Optional text that appears above the main title",
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",
    }),
    defineField({
      description: "The main heading for this feature section",
      name: "title",
      title: "Title",
      type: "string",
    }),
    definePortableTextField(["block"], {
      description:
        "The supporting paragraph shown beneath the title, introducing the cards below",
      name: "richText",
    }),
    defineField({
      description: "The individual feature cards to display in the grid",
      name: "cards",
      of: [featureCardIconItem],
      title: "Cards",
      type: "array",
    }),
  ],
  icon: LayoutGrid,
  name: "featureCardsIcon",
  preview: {
    prepare: ({ title }) => ({
      subtitle: "Feature Cards with Icon",
      title,
    }),
    select: {
      title: "title",
    },
  },
  type: "object",
});
