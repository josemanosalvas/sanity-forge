import { MessageCircle } from "lucide-react";
import { defineField, defineType } from "sanity";

import { parseRichTextToString } from "../../lib/helpers";
import { customRichText } from "../definitions/rich-text";
import { languageField } from "../fields";

/** Shared across sites; localized per document so each language is published independently. */
export const faq = defineType({
  name: "faq",
  type: "document",
  title: "Frequently Asked Question",
  description:
    "A question and answer pair that any site's FAQ block can reference. Each language is its own document.",
  icon: MessageCircle,
  fields: [
    languageField,
    defineField({
      name: "title",
      type: "string",
      title: "Question",
      description:
        "Write the question exactly as someone might ask it. For example: 'How do I reset my password?'",
      validation: (rule) => rule.required(),
    }),
    customRichText(["block"], {
      title: "Answer",
      description:
        "Write a friendly, clear answer that directly addresses the question. Keep it simple enough that anyone can understand it.",
    }),
  ],
  preview: {
    select: {
      title: "title",
      richText: "richText",
      language: "language",
    },
    prepare: ({ title, richText, language }) => ({
      title: `❓ ${title || "Untitled Question"}`,
      subtitle: `${(language ?? "??").toUpperCase()} · ${parseRichTextToString(richText, 20)}`,
    }),
  },
});
