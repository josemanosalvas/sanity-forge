import { Command } from "lucide-react";
import { defineField, defineType } from "sanity";

import {
  capitalize,
  createRadioListLayout,
  linkPreviewTarget,
} from "../../lib/helpers";

const buttonVariants = ["default", "secondary", "outline", "link"];

export const button = defineType({
  fields: [
    defineField({
      description:
        "Choose a style. Default is solid, secondary uses the accent color, outline adds a border, and link uses text only.",
      initialValue: "default",
      name: "variant",
      options: createRadioListLayout(buttonVariants, {
        direction: "horizontal",
      }),
      type: "string",
    }),
    defineField({
      description:
        "The text that appears on the button, like 'Learn More' or 'Get Started'",
      name: "text",
      title: "Button Text",
      type: "string",
    }),
    defineField({
      description: "Select a page or enter a web address.",
      name: "url",
      title: "URL",
      type: "customUrl",
    }),
  ],
  icon: Command,
  name: "button",
  preview: {
    prepare: ({ title, variant, ...link }) => ({
      subtitle: `${capitalize(variant ?? "default")} • ${linkPreviewTarget(link)}`,
      title: title || "Untitled Button",
    }),
    select: {
      externalUrl: "url.external",
      internalUrl: "url.internal.slug.current",
      openInNewTab: "url.openInNewTab",
      title: "text",
      urlType: "url.type",
      variant: "variant",
    },
  },
  title: "Button",
  type: "object",
});
