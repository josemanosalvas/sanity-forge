import { Text } from "lucide-react";
import { defineField, defineType } from "sanity";

import { definePortableTextField } from "../lib/schema-fields";

export const richTextBlockSchema = defineType({
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
    definePortableTextField(["block", "image", "table"], {
      description:
        "The body content for this block. Add paragraphs, headings, lists, links, images and tables.",
      name: "richText",
    }),
  ],
  icon: Text,
  name: "richTextBlock",
  preview: {
    prepare: ({ title }) => ({
      subtitle: "Rich Text Block",
      title: title || "Rich Text",
    }),
    select: {
      title: "title",
    },
  },
  type: "object",
});
