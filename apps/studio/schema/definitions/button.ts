import { Command } from "lucide-react";
import { defineField, defineType } from "sanity";

import { capitalize, createRadioListLayout } from "../../lib/helpers";

const buttonVariants = ["default", "secondary", "outline", "link"];

export const button = defineType({
  fields: [
    defineField({
      description:
        "Choose the button's visual style - default is solid, secondary is the accent color, outline has a border, and link looks like regular text",
      initialValue: () => "default",
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
      description:
        "Where the button links to - can be an internal page or external website",
      name: "url",
      title: "URL",
      type: "customUrl",
    }),
  ],
  icon: Command,
  name: "button",
  preview: {
    prepare: ({
      title,
      variant,
      externalUrl,
      urlType,
      internalUrl,
      openInNewTab,
    }) => {
      const url = urlType === "external" ? externalUrl : internalUrl;
      const newTabIndicator = openInNewTab ? " ↗" : "";

      return {
        subtitle: `${capitalize(variant ?? "default")} • ${url}${newTabIndicator}`,
        title: title || "Untitled Button",
      };
    },
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
