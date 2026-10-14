import { Text } from "lucide-react";
import { defineField, defineType } from "sanity";

import { definePortableTextField } from "../../lib/schema-fields";

export const richTextBlockSchema = defineType({
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
