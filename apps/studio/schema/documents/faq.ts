import { MessageCircle } from "lucide-react";
import { defineField, defineType } from "sanity";

import { parseRichTextToString } from "../../lib/helpers";
import { customRichText } from "../definitions/rich-text";
import { languageField } from "../fields";

/** Shared across sites; localized per document so each language is published independently. */
export const faq = defineType({
  description:
    "A question and answer pair that any site's FAQ block can reference. Each language is its own document.",
  fields: [
    languageField,
    defineField({
      description:
        "Write the question exactly as someone might ask it. For example: 'How do I reset my password?'",
      name: "title",
      title: "Question",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    customRichText(["block"], {
      description:
        "Write a friendly, clear answer that directly addresses the question. Keep it simple enough that anyone can understand it.",
      title: "Answer",
    }),
  ],
  icon: MessageCircle,
  name: "faq",
  preview: {
    prepare: ({ title, richText, language }) => ({
      subtitle: `${(language ?? "??").toUpperCase()} · ${parseRichTextToString(richText, 20)}`,
      title: `❓ ${title || "Untitled Question"}`,
    }),
    select: {
      language: "language",
      richText: "richText",
      title: "title",
    },
  },
  title: "Frequently Asked Question",
  type: "document",
});
